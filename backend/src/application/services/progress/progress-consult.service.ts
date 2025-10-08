import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ProgressConsultDao } from '../../../domain/progress/dao/progress-consult.dao';
import { ChapterConsultDao } from '../../../domain/chapters/dao/chapter-consult.dao';
import { CourseProgressDto,CourseProgressDetailDto,ChapterProgressDto,UserProgressSummaryDto,UserDashboardStatsDto,UserHistoryItemDto,RecentActivityDto,ModuleStatsDto,CourseAnalyticsDto,UserRankingDto} from '../../../domain/progress/dto/progress.dto';
import { UserCourseProgress,UserChapterProgress } from '../../../domain/progress/entity/progress.entity';

@Injectable()
export class ProgressConsultService {
  private readonly logger = new Logger(ProgressConsultService.name);

  constructor(
    private readonly progressConsultDao: ProgressConsultDao,
    private readonly chapterConsultDao: ChapterConsultDao
  ) {}

  /**
   * Obtener progreso completo de un usuario (resumen general)
   */
  async getUserProgressSummary(userId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: UserProgressSummaryDto 
  }> {
    try {
      const coursesStarted = await this.progressConsultDao.countUserCoursesStarted(userId);
      const coursesCompleted = await this.progressConsultDao.countUserCoursesCompleted(userId);
      const chaptersCompleted = await this.progressConsultDao.countUserChaptersCompleted(userId);
      const hoursStudied = await this.progressConsultDao.calculateTotalHoursStudied(userId);

      const inProgress = await this.progressConsultDao.findUserCoursesInProgress(userId);
      const completed = await this.progressConsultDao.findUserCoursesCompleted(userId);

      // Obtener total de capítulos para cada curso en progreso
      const coursesInProgressWithStats = await Promise.all(
        inProgress.map(async (progress) => {
          const totalChapters = await this.chapterConsultDao.countByCourseId(progress.courseId);
          const completedChapters = await this.progressConsultDao.countCompletedChaptersByCourse(
            userId, 
            progress.courseId
          );
          
          return this.mapToCourseProgressDto(progress, totalChapters, completedChapters);
        })
      );

      const coursesCompletedWithStats = await Promise.all(
        completed.map(async (progress) => {
          const totalChapters = await this.chapterConsultDao.countByCourseId(progress.courseId);
          return this.mapToCourseProgressDto(progress, totalChapters, totalChapters);
        })
      );

      const summary: UserProgressSummaryDto = {
        userId,
        userName: inProgress[0]?.user?.name || 'Usuario',
        userEmail: inProgress[0]?.user?.email || '',
        totalCoursesStarted: coursesStarted,
        totalCoursesCompleted: coursesCompleted,
        totalChaptersCompleted: chaptersCompleted,
        totalHoursStudied: parseFloat(hoursStudied.toFixed(2)),
        coursesInProgress: coursesInProgressWithStats,
        coursesCompleted: coursesCompletedWithStats
      };

      return {
        success: true,
        message: 'Resumen de progreso obtenido',
        data: summary
      };
    } catch (error) {
      this.logger.error(`Error al obtener resumen de progreso: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener progreso detallado de un curso (con capítulos)
   */
  async getCourseProgressDetail(userId: number, courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseProgressDetailDto 
  }> {
    try {
      const courseProgress = await this.progressConsultDao.findCourseProgress(userId, courseId);

      if (!courseProgress) {
        return {
          success: false,
          message: 'No has iniciado este curso'
        };
      }

      const totalChapters = await this.chapterConsultDao.countByCourseId(courseId);
      const completedChapters = await this.progressConsultDao.countCompletedChaptersByCourse(userId, courseId);
      
      // Obtener todos los capítulos del curso
      const allChapters = await this.chapterConsultDao.findByCourseId(courseId);
      
      // Obtener progreso de cada capítulo
      const chapterProgressList = await this.progressConsultDao.findUserChapterProgressByCourse(userId, courseId);
      
      // Mapear progreso de capítulos
      const chaptersWithProgress: ChapterProgressDto[] = allChapters.map(chapter => {
        const progress = chapterProgressList.find(p => p.chapterId === chapter.id);
        
        return {
          id: progress?.id || 0,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterOrderIndex: chapter.orderIndex,
          completed: progress?.completed || false,
          completedAt: progress?.completedAt || null
        };
      });

      const detail: CourseProgressDetailDto = {
        ...this.mapToCourseProgressDto(courseProgress, totalChapters, completedChapters),
        chapters: chaptersWithProgress
      };

      return {
        success: true,
        message: 'Detalle de progreso obtenido',
        data: detail
      };
    } catch (error) {
      this.logger.error(`Error al obtener detalle de progreso: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener cursos en progreso de un usuario
   */
  async getCoursesInProgress(userId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseProgressDto[] 
  }> {
    try {
      const inProgress = await this.progressConsultDao.findUserCoursesInProgress(userId);

      const coursesWithStats = await Promise.all(
        inProgress.map(async (progress) => {
          const totalChapters = await this.chapterConsultDao.countByCourseId(progress.courseId);
          const completedChapters = await this.progressConsultDao.countCompletedChaptersByCourse(
            userId, 
            progress.courseId
          );
          
          return this.mapToCourseProgressDto(progress, totalChapters, completedChapters);
        })
      );

      return {
        success: true,
        message: 'Cursos en progreso obtenidos',
        data: coursesWithStats
      };
    } catch (error) {
      this.logger.error(`Error al obtener cursos en progreso: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener cursos completados de un usuario (historial)
   */
  async getCoursesCompleted(userId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: UserHistoryItemDto[] 
  }> {
    try {
      const completed = await this.progressConsultDao.findUserCoursesCompleted(userId);

      const history: UserHistoryItemDto[] = await Promise.all(
        completed.map(async (progress) => {
          const totalChapters = await this.chapterConsultDao.countByCourseId(progress.courseId);
          
          return {
            courseId: progress.courseId,
            courseTitle: progress.course.title,
            moduleName: progress.course.module.name,
            completedAt: progress.completedAt,
            totalChapters,
            durationHours: progress.course.durationHours
          };
        })
      );

      return {
        success: true,
        message: 'Historial obtenido',
        data: history
      };
    } catch (error) {
      this.logger.error(`Error al obtener historial: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener estadísticas para el dashboard del usuario
   */
  async getDashboardStats(userId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: UserDashboardStatsDto 
  }> {
    try {
      const coursesInProgress = await this.progressConsultDao.findUserCoursesInProgress(userId);
      const coursesCompleted = await this.progressConsultDao.countUserCoursesCompleted(userId);
      const chaptersCompleted = await this.progressConsultDao.countUserChaptersCompleted(userId);
      const hoursStudied = await this.progressConsultDao.calculateTotalHoursStudied(userId);
      
      // Actividad reciente
      const recentActivityRaw = await this.progressConsultDao.findRecentActivity(userId, 5);
      const recentActivity: RecentActivityDto[] = recentActivityRaw.map(activity => ({
        type: 'chapter_completed',
        courseTitle: activity.chapter.course.title,
        chapterTitle: activity.chapter.title,
        date: activity.completedAt,
        icon: '✅'
      }));

      // Progreso por módulo
      const moduleProgressRaw = await this.progressConsultDao.findProgressByModule(userId);
      const coursesByModule: ModuleStatsDto[] = moduleProgressRaw.map(module => ({
        moduleId: parseInt(module.moduleId),
        moduleName: module.moduleName,
        moduleIcon: module.moduleIcon,
        coursesStarted: parseInt(module.coursesStarted),
        coursesCompleted: parseInt(module.coursesCompleted),
        progressPercentage: parseFloat(module.averageProgress || 0)
      }));

      const stats: UserDashboardStatsDto = {
        coursesInProgress: coursesInProgress.length,
        coursesCompleted,
        chaptersCompleted,
        hoursStudied: parseFloat(hoursStudied.toFixed(2)),
        recentActivity,
        coursesByModule
      };

      return {
        success: true,
        message: 'Estadísticas del dashboard obtenidas',
        data: stats
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener analytics de un curso (para admin)
   */
  async getCourseAnalytics(courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseAnalyticsDto 
  }> {
    try {
      const analytics = await this.progressConsultDao.getCourseAnalytics(courseId);

      const result: CourseAnalyticsDto = {
        courseId,
        courseTitle: '', // TODO: Obtener del curso
        totalStudents: parseInt(analytics.totalStudents || 0),
        completedStudents: parseInt(analytics.completedStudents || 0),
        averageProgress: parseFloat(analytics.averageProgress || 0),
        averageCompletionTime: parseFloat(analytics.averageCompletionDays || 0)
      };

      return {
        success: true,
        message: 'Analytics del curso obtenidos',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error al obtener analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener ranking de usuarios (para admin)
   */
  async getUserRanking(limit: number = 10): Promise<{ 
    success: boolean; 
    message: string; 
    data?: UserRankingDto[] 
  }> {
    try {
      const rankingRaw = await this.progressConsultDao.getUserRanking(limit);

      const ranking: UserRankingDto[] = await Promise.all(
        rankingRaw.map(async (user, index) => {
          const chaptersCompleted = await this.progressConsultDao.countUserChaptersCompleted(user.userId);
          const hoursStudied = await this.progressConsultDao.calculateTotalHoursStudied(user.userId);

          return {
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
            coursesCompleted: parseInt(user.coursesCompleted),
            chaptersCompleted,
            hoursStudied: parseFloat(hoursStudied.toFixed(2)),
            rank: index + 1
          };
        })
      );

      return {
        success: true,
        message: 'Ranking obtenido',
        data: ranking
      };
    } catch (error) {
      this.logger.error(`Error al obtener ranking: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mapear a DTO de progreso de curso
   */
  private mapToCourseProgressDto(
    progress: UserCourseProgress, 
    totalChapters: number, 
    completedChapters: number
  ): CourseProgressDto {
    return {
      id: progress.id,
      courseId: progress.courseId,
      courseTitle: progress.course.title,
      moduleName: progress.course.module.name,
      moduleIcon: progress.course.module.icon,
      instructorName: progress.course.instructorName,
      thumbnailUrl: progress.course.thumbnailUrl,
      progressPercentage: parseFloat(progress.progressPercentage.toString()),
      completedChapters,
      totalChapters,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      isCompleted: progress.completedAt !== null
    };
  }
}