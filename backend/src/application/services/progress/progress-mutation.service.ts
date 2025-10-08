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

  /**
   * Iniciar un curso (primera vez que el usuario accede)
   */
  async startCourse(userId: number, courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: any 
  }> {
    try {
      // Validar que el curso existe
      const courseExists = await this.courseConsultDao.existsById(courseId);
      
      if (!courseExists) {
        throw new HttpException(
          'El curso especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      // Verificar si ya inició el curso
      const existing = await this.progressConsultDao.findCourseProgress(userId, courseId);
      
      if (existing) {
        return {
          success: false,
          message: 'Ya has iniciado este curso'
        };
      }

      // Iniciar el curso
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

  /**
   * Marcar un capítulo como completado
   */
  async completeChapter(userId: number, chapterId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: any 
  }> {
    try {
      // Validar que el capítulo existe
      const chapter = await this.chapterConsultDao.findById(chapterId);
      
      if (!chapter) {
        throw new HttpException(
          'El capítulo especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      const courseId = chapter.courseId;

      // Verificar si el usuario ya inició el curso, si no, iniciarlo
      let courseProgress = await this.progressConsultDao.findCourseProgress(userId, courseId);
      
      if (!courseProgress) {
        await this.progressMutationDao.startCourse(userId, courseId);
      }

      // Marcar capítulo como completado
      await this.progressMutationDao.completeChapter(userId, chapterId);

      // Recalcular progreso del curso
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

  /**
   * Desmarcar un capítulo como completado
   */
  async uncompleteChapter(userId: number, chapterId: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // Validar que el capítulo existe
      const chapter = await this.chapterConsultDao.findById(chapterId);
      
      if (!chapter) {
        throw new HttpException(
          'El capítulo especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      const courseId = chapter.courseId;

      // Desmarcar capítulo
      await this.progressMutationDao.uncompleteChapter(userId, chapterId);

      // Recalcular progreso del curso
      await this.recalculateCourseProgress(userId, courseId);

    // 👇 AGREGAR ESTO: Verificar si completó el curso para otorgar insignias
    const courseProgress = await this.progressConsultDao.findCourseProgress(userId, courseId);
    if (courseProgress && courseProgress.completedAt) {
      // Importar BadgeAwardService en el constructor
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

  /**
   * Reiniciar progreso de un curso
   */
  async resetCourseProgress(userId: number, courseId: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // Validar que el curso existe
      const courseExists = await this.courseConsultDao.existsById(courseId);
      
      if (!courseExists) {
        throw new HttpException(
          'El curso especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      // Eliminar progreso del curso
      await this.progressMutationDao.deleteCourseProgress(userId, courseId);

      // Eliminar progreso de todos los capítulos del curso
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

  /**
   * Recalcular el progreso de un curso basado en capítulos completados
   */
  private async recalculateCourseProgress(userId: number, courseId: number): Promise<void> {
    try {
      // Contar capítulos totales y completados
      const totalChapters = await this.chapterConsultDao.countPublishedByCourseId(courseId);
      const completedChapters = await this.progressConsultDao.countCompletedChaptersByCourse(userId, courseId);

      if (totalChapters === 0) {
        return;
      }

      // Calcular porcentaje
      const progressPercentage = (completedChapters / totalChapters) * 100;

      // Actualizar progreso del curso
      await this.progressMutationDao.updateCourseProgress(userId, courseId, progressPercentage);

      // Si completó todos los capítulos, marcar curso como completado
      if (completedChapters === totalChapters) {
        await this.progressMutationDao.completeCourse(userId, courseId);
      }
    } catch (error) {
      this.logger.error(`Error al recalcular progreso: ${error.message}`, error.stack);
      // No lanzar error para no interrumpir el flujo principal
    }
  }
}