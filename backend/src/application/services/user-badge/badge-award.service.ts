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

 
  async checkAndAwardBadgesForCourseCompletion(userId: number, courseId: number): Promise<void> {
    try {
      await this.awardCourseCompletionBadge(userId, courseId);

      await this.checkModuleMasterBadge(userId, courseId);

      await this.checkFastLearnerBadge(userId, courseId);

      await this.checkExplorerBadge(userId);

      this.logger.log(`Insignias verificadas para usuario ${userId} en curso ${courseId}`);
    } catch (error) {
      this.logger.error(`Error al verificar insignias: ${error.message}`, error.stack);
    }
  }


private async checkModuleMasterBadge(userId: number, courseId: number): Promise<void> {
  try {
    const course = await this.courseConsultDao.findById(courseId);
    if (!course) return;

    const moduleId = course.moduleId;

    const allCoursesInModule = await this.courseConsultDao.findActiveByModuleId(moduleId);
    const totalCoursesInModule = allCoursesInModule.length;

    if (totalCoursesInModule === 0) return;

    const userCompletedCourses = await this.progressConsultDao.findUserCoursesCompleted(userId);
    const completedInModule = userCompletedCourses.filter(
      progress => progress.course.moduleId === moduleId
    ).length;

    if (completedInModule >= totalCoursesInModule) {
      const hasIt = await this.badgeConsultDao.userHasBadge(userId, 1, moduleId);
      
      if (!hasIt) {
      
        await this.badgeMutationDao.awardBadge(userId, 1, moduleId);
        this.logger.log(`✨ Insignia ORO "Módulo Maestro" otorgada a usuario ${userId} por completar módulo ${moduleId}`);
      }
    }
  } catch (error) {
    this.logger.error(`Error al verificar Módulo Maestro: ${error.message}`);
  }
}

private async awardCourseCompletionBadge(userId: number, courseId: number): Promise<void> {
  try {
    const hasIt = await this.badgeConsultDao.userHasBadge(userId, 2, courseId);
    
    if (!hasIt) {
      await this.badgeMutationDao.awardBadge(userId, 2, courseId);
      this.logger.log(`Insignia BRONCE "Curso Completado" otorgada a usuario ${userId} por curso ${courseId}`);
    }
  } catch (error) {
    this.logger.error(`Error al otorgar insignia de curso completado: ${error.message}`);
  }
}


  private async checkFastLearnerBadge(userId: number, courseId: number): Promise<void> {
    try {
      const courseProgress = await this.progressConsultDao.findCourseProgress(userId, courseId);
      
      if (!courseProgress || !courseProgress.completedAt) return;

      const startTime = new Date(courseProgress.startedAt).getTime();
      const endTime = new Date(courseProgress.completedAt).getTime();
      const diffHours = (endTime - startTime) / (1000 * 60 * 60);

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


  private async checkExplorerBadge(userId: number): Promise<void> {
    try {
      const userCompletedCourses = await this.progressConsultDao.findUserCoursesCompleted(userId);
      
      const uniqueModules = new Set(
        userCompletedCourses.map(progress => progress.course.moduleId)
      );

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