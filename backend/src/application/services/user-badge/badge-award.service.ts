import { Injectable, Logger } from '@nestjs/common';
import { BadgeConsultDao } from '../../../domain/user-badge/dao/badge-consult.dao';
import { BadgeMutationDao } from '../../../domain/user-badge/dao/badge-mutation.dao';
import { ProgressConsultDao } from '../../../domain/progress/dao/progress-consult.dao';
import { CourseConsultDao } from '../../../domain/courses/dao/course-consult.dao';


@Injectable()
export class BadgeAwardService {
  private readonly logger = new Logger(BadgeAwardService.name);

  constructor(
    private readonly badgeConsultDao: BadgeConsultDao,
    private readonly badgeMutationDao: BadgeMutationDao,
    private readonly progressConsultDao: ProgressConsultDao,
    private readonly courseConsultDao: CourseConsultDao
  ) {}

  /**
   * Verificar y otorgar insignias cuando un usuario completa un curso
   */
  async checkAndAwardBadgesForCourseCompletion(userId: number, courseId: number): Promise<void> {
    try {
      // 1. Insignia "Curso Completado" (badgeTypeId: 1)
      await this.awardCourseCompletionBadge(userId, courseId);

      // 2. Verificar si completó todo el módulo → "Módulo Maestro" (badgeTypeId: 2)
      await this.checkModuleMasterBadge(userId, courseId);

      // 3. Verificar si completó en menos de 24h → "Aprendiz Rápido" (badgeTypeId: 3)
      await this.checkFastLearnerBadge(userId, courseId);

      // 4. Verificar si completó cursos de 3+ módulos → "Explorador" (badgeTypeId: 4)
      await this.checkExplorerBadge(userId);

      this.logger.log(`Insignias verificadas para usuario ${userId} en curso ${courseId}`);
    } catch (error) {
      this.logger.error(`Error al verificar insignias: ${error.message}`, error.stack);
      // No lanzar error para no interrumpir el flujo
    }
  }

  /**
   * Otorgar insignia "Curso Completado"
   */
  private async awardCourseCompletionBadge(userId: number, courseId: number): Promise<void> {
    try {
      const hasIt = await this.badgeConsultDao.userHasBadge(userId, 1, courseId);
      
      if (!hasIt) {
        await this.badgeMutationDao.awardBadge(userId, 1, courseId);
        this.logger.log(`Insignia "Curso Completado" otorgada a usuario ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error al otorgar insignia de curso completado: ${error.message}`);
    }
  }

  /**
   * Verificar y otorgar insignia "Módulo Maestro"
   */
  private async checkModuleMasterBadge(userId: number, courseId: number): Promise<void> {
    try {
      // Obtener el módulo del curso
      const course = await this.courseConsultDao.findById(courseId);
      if (!course) return;

      const moduleId = course.moduleId;

      // Obtener todos los cursos del módulo
      const allCoursesInModule = await this.courseConsultDao.findActiveByModuleId(moduleId);
      const totalCoursesInModule = allCoursesInModule.length;

      // Contar cuántos cursos del módulo ha completado el usuario
      const userCompletedCourses = await this.progressConsultDao.findUserCoursesCompleted(userId);
      const completedInModule = userCompletedCourses.filter(
        progress => progress.course.moduleId === moduleId
      ).length;

      // Si completó todos los cursos del módulo
      if (completedInModule >= totalCoursesInModule && totalCoursesInModule > 0) {
        const hasIt = await this.badgeConsultDao.userHasBadge(userId, 2, undefined);
        
        if (!hasIt) {
          await this.badgeMutationDao.awardBadge(userId, 2);
          this.logger.log(`Insignia "Módulo Maestro" otorgada a usuario ${userId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error al verificar Módulo Maestro: ${error.message}`);
    }
  }

  /**
   * Verificar y otorgar insignia "Aprendiz Rápido"
   */
  private async checkFastLearnerBadge(userId: number, courseId: number): Promise<void> {
    try {
      const courseProgress = await this.progressConsultDao.findCourseProgress(userId, courseId);
      
      if (!courseProgress || !courseProgress.completedAt) return;

      // Calcular diferencia en horas
      const startTime = new Date(courseProgress.startedAt).getTime();
      const endTime = new Date(courseProgress.completedAt).getTime();
      const diffHours = (endTime - startTime) / (1000 * 60 * 60);

      // Si completó en menos de 24 horas
      if (diffHours < 24) {
        const hasIt = await this.badgeConsultDao.userHasBadge(userId, 3, courseId);
        
        if (!hasIt) {
          await this.badgeMutationDao.awardBadge(userId, 3, courseId);
          this.logger.log(`Insignia "Aprendiz Rápido" otorgada a usuario ${userId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error al verificar Aprendiz Rápido: ${error.message}`);
    }
  }

  /**
   * Verificar y otorgar insignia "Explorador"
   */
  private async checkExplorerBadge(userId: number): Promise<void> {
    try {
      const userCompletedCourses = await this.progressConsultDao.findUserCoursesCompleted(userId);
      
      // Obtener módulos únicos
      const uniqueModules = new Set(
        userCompletedCourses.map(progress => progress.course.moduleId)
      );

      // Si completó cursos de 3 o más módulos diferentes
      if (uniqueModules.size >= 3) {
        const hasIt = await this.badgeConsultDao.userHasBadge(userId, 4, undefined);
        
        if (!hasIt) {
          await this.badgeMutationDao.awardBadge(userId, 4, undefined);
          this.logger.log(`Insignia "Explorador" otorgada a usuario ${userId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error al verificar Explorador: ${error.message}`);
    }
  }
}