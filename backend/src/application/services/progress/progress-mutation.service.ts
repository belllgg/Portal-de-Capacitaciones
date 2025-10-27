import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ProgressConsultDao } from '../../../domain/progress/dao/progress-consult.dao';
import { ProgressMutationDao } from '../../../domain/progress/dao/progress-mutation.dao';
import { CourseConsultDao } from '../../../domain/courses/dao/course-consult.dao';
import { ChapterConsultDao } from '../../../domain/chapters/dao/chapter-consult.dao';
import { BadgeAwardService} from '../../../application/services/user-badge/badge-award.service';

@Injectable()
export class ProgressMutationService {
  private readonly logger = new Logger(ProgressMutationService.name);

  constructor(
    private readonly progressConsultDao: ProgressConsultDao,
    private readonly progressMutationDao: ProgressMutationDao,
    private readonly courseConsultDao: CourseConsultDao,
    private readonly chapterConsultDao: ChapterConsultDao,
    private readonly badgeAwardService: BadgeAwardService 

  ) {}


  async startCourse(userId: number, courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: any 
  }> {
    try {
      const courseExists = await this.courseConsultDao.existsById(courseId);
      
      if (!courseExists) {
        throw new HttpException(
          'El curso especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      const existing = await this.progressConsultDao.findCourseProgress(userId, courseId);
      
      if (existing) {
        return {
          success: false,
          message: 'Ya has iniciado este curso'
        };
      }

      await this.progressMutationDao.startCourse(userId, courseId);

      return {
        success: true,
        message: 'Curso iniciado exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al iniciar curso: ${error.message}`, error.stack);
      throw error;
    }
  }


  async completeChapter(userId: number, chapterId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: any 
  }> {
    try {
      const chapter = await this.chapterConsultDao.findById(chapterId);
      
      if (!chapter) {
        throw new HttpException(
          'El capítulo especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      const courseId = chapter.courseId;

      let courseProgress = await this.progressConsultDao.findCourseProgress(userId, courseId);
      
      if (!courseProgress) {
        await this.progressMutationDao.startCourse(userId, courseId);
      }

      await this.progressMutationDao.completeChapter(userId, chapterId);

      await this.recalculateCourseProgress(userId, courseId);

      return {
        success: true,
        message: 'Capítulo completado exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al completar capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }


  async uncompleteChapter(userId: number, chapterId: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const chapter = await this.chapterConsultDao.findById(chapterId);
      
      if (!chapter) {
        throw new HttpException(
          'El capítulo especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      const courseId = chapter.courseId;

      await this.progressMutationDao.uncompleteChapter(userId, chapterId);

      await this.recalculateCourseProgress(userId, courseId);

    const courseProgress = await this.progressConsultDao.findCourseProgress(userId, courseId);
    if (courseProgress && courseProgress.completedAt) {
      await this.badgeAwardService.checkAndAwardBadgesForCourseCompletion(userId, courseId);
    }

    return {
      success: true,
      message: 'Capítulo completado exitosamente'
    };
  } catch (error) {
    this.logger.error(`Error al completar capítulo: ${error.message}`, error.stack);
    throw error;
  }
}

  async resetCourseProgress(userId: number, courseId: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const courseExists = await this.courseConsultDao.existsById(courseId);
      
      if (!courseExists) {
        throw new HttpException(
          'El curso especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      await this.progressMutationDao.deleteCourseProgress(userId, courseId);

      const chapters = await this.chapterConsultDao.findByCourseId(courseId);
      
      for (const chapter of chapters) {
        await this.progressMutationDao.deleteChapterProgress(userId, chapter.id);
      }

      return {
        success: true,
        message: 'Progreso del curso reiniciado'
      };
    } catch (error) {
      this.logger.error(`Error al reiniciar progreso: ${error.message}`, error.stack);
      throw error;
    }
  }


  private async recalculateCourseProgress(userId: number, courseId: number): Promise<void> {
    try {
      const totalChapters = await this.chapterConsultDao.countPublishedByCourseId(courseId);
      const completedChapters = await this.progressConsultDao.countCompletedChaptersByCourse(userId, courseId);

      if (totalChapters === 0) {
        return;
      }

      const progressPercentage = (completedChapters / totalChapters) * 100;

      await this.progressMutationDao.updateCourseProgress(userId, courseId, progressPercentage);

      if (completedChapters === totalChapters) {
        await this.progressMutationDao.completeCourse(userId, courseId);
      }
    } catch (error) {
      this.logger.error(`Error al recalcular progreso: ${error.message}`, error.stack);
    }
  }
}