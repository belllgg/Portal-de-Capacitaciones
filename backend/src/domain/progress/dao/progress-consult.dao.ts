import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserCourseProgress, UserChapterProgress} from '../entity/progress.entity';

@Injectable()
export class ProgressConsultDao {
  private readonly logger = new Logger(ProgressConsultDao.name);

  constructor(
    @InjectRepository(UserCourseProgress)
    private readonly courseProgressRepository: Repository<UserCourseProgress>,
    @InjectRepository(UserChapterProgress)
    private readonly chapterProgressRepository: Repository<UserChapterProgress>,
  ) {}

  // ==========================================
  // CONSULTAS DE PROGRESO DE CURSO
  // ==========================================

  /**
   * Obtener progreso de un usuario en un curso específico
   */
  async findCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | null> {
    try {
      return await this.courseProgressRepository.findOne({
        where: { userId, courseId },
        relations: ['course', 'course.module']
      });
    } catch (error) {
      this.logger.error(`Error al buscar progreso del curso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar progreso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener todos los cursos en progreso de un usuario
   */
  async findUserCoursesInProgress(userId: number): Promise<UserCourseProgress[]> {
    try {
      return await this.courseProgressRepository.find({
        where: { userId, completedAt: IsNull() },
        relations: ['course', 'course.module'],
        order: { startedAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar cursos en progreso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar cursos en progreso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener todos los cursos completados de un usuario
   */
  async findUserCoursesCompleted(userId: number): Promise<UserCourseProgress[]> {
  try {
    return await this.courseProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.course', 'course')
      .leftJoinAndSelect('course.module', 'module')
      .where('progress.user_id = :userId', { userId })
      .andWhere('progress.completed_at IS NOT NULL')
      .orderBy('progress.completed_at', 'DESC')
      .getMany();
  } catch (error) {
    this.logger.error(`Error al buscar cursos completados: ${error.message}`, error.stack);
    throw new HttpException(
      'Error al consultar cursos completados',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}


  /**
   * Obtener todos los progresos de un usuario
   */
  async findAllUserProgress(userId: number): Promise<UserCourseProgress[]> {
    try {
      return await this.courseProgressRepository.find({
        where: { userId },
        relations: ['course', 'course.module'],
        order: { startedAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar progreso del usuario: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar progreso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar cursos iniciados por un usuario
   */
  async countUserCoursesStarted(userId: number): Promise<number> {
    try {
      return await this.courseProgressRepository.count({ where: { userId } });
    } catch (error) {
      this.logger.error(`Error al contar cursos iniciados: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar cursos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar cursos completados por un usuario
   */
  async countUserCoursesCompleted(userId: number): Promise<number> {
    try {
      return await this.courseProgressRepository
        .createQueryBuilder('progress')
        .where('progress.user_id = :userId', { userId })
        .andWhere('progress.completed_at IS NOT NULL')
        .getCount();
    } catch (error) {
      this.logger.error(`Error al contar cursos completados: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar cursos completados',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==========================================
  // CONSULTAS DE PROGRESO DE CAPÍTULO
  // ==========================================

  /**
   * Obtener progreso de un usuario en un capítulo específico
   */
  async findChapterProgress(userId: number, chapterId: number): Promise<UserChapterProgress | null> {
    try {
      return await this.chapterProgressRepository.findOne({
        where: { userId, chapterId },
        relations: ['chapter']
      });
    } catch (error) {
      this.logger.error(`Error al buscar progreso del capítulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar progreso del capítulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener progreso de todos los capítulos de un curso para un usuario
   */
  async findUserChapterProgressByCourse(userId: number, courseId: number): Promise<UserChapterProgress[]> {
    try {
      return await this.chapterProgressRepository
        .createQueryBuilder('progress')
        .leftJoinAndSelect('progress.chapter', 'chapter')
        .where('progress.user_id = :userId', { userId })
        .andWhere('chapter.course_id = :courseId', { courseId })
        .orderBy('chapter.order_index', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error al buscar progreso de capítulos: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar progreso de capítulos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar capítulos completados por un usuario en un curso
   */
  async countCompletedChaptersByCourse(userId: number, courseId: number): Promise<number> {
    try {
      return await this.chapterProgressRepository
        .createQueryBuilder('progress')
        .innerJoin('progress.chapter', 'chapter')
        .where('progress.user_id = :userId', { userId })
        .andWhere('chapter.course_id = :courseId', { courseId })
        .andWhere('progress.completed = :completed', { completed: true })
        .getCount();
    } catch (error) {
      this.logger.error(`Error al contar capítulos completados: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar capítulos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar total de capítulos completados por un usuario
   */
  async countUserChaptersCompleted(userId: number): Promise<number> {
    try {
      return await this.chapterProgressRepository.count({
        where: { userId, completed: true }
      });
    } catch (error) {
      this.logger.error(`Error al contar capítulos completados: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar capítulos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==========================================
  // ESTADÍSTICAS Y ANALYTICS
  // ==========================================

  /**
   * Calcular horas totales estudiadas por un usuario
   */
  async calculateTotalHoursStudied(userId: number): Promise<number> {
    try {
      const result = await this.courseProgressRepository
        .createQueryBuilder('progress')
        .innerJoin('progress.course', 'course')
        .select('SUM(course.duration_hours)', 'totalHours')
        .where('progress.user_id = :userId', { userId })
        .andWhere('progress.completed_at IS NOT NULL')
        .getRawOne();
      
      return parseFloat(result?.totalHours || 0);
    } catch (error) {
      this.logger.error(`Error al calcular horas estudiadas: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al calcular horas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener actividad reciente de un usuario (últimos 10 eventos)
   */
  async findRecentActivity(userId: number, limit: number = 10): Promise<any[]> {
    try {
      return await this.chapterProgressRepository
        .createQueryBuilder('progress')
        .leftJoinAndSelect('progress.chapter', 'chapter')
        .leftJoinAndSelect('chapter.course', 'course')
        .where('progress.user_id = :userId', { userId })
        .andWhere('progress.completed = :completed', { completed: true })
        .orderBy('progress.completed_at', 'DESC')
        .limit(limit)
        .getMany();
    } catch (error) {
      this.logger.error(`Error al obtener actividad reciente: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener actividad',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener progreso por módulo para un usuario
   */
  async findProgressByModule(userId: number): Promise<any[]> {
    try {
      return await this.courseProgressRepository
        .createQueryBuilder('progress')
        .innerJoin('progress.course', 'course')
        .innerJoin('course.module', 'module')
        .select('module.id', 'moduleId')
        .addSelect('module.name', 'moduleName')
        .addSelect('module.icon', 'moduleIcon')
        .addSelect('COUNT(progress.id)', 'coursesStarted')
        .addSelect('SUM(CASE WHEN progress.completed_at IS NOT NULL THEN 1 ELSE 0 END)', 'coursesCompleted')
        .addSelect('AVG(progress.progress_percentage)', 'averageProgress')
        .where('progress.user_id = :userId', { userId })
        .groupBy('module.id')
        .addGroupBy('module.name')
        .addGroupBy('module.icon')
        .getRawMany();
    } catch (error) {
      this.logger.error(`Error al obtener progreso por módulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener progreso por módulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==========================================
  // ANALYTICS PARA ADMIN
  // ==========================================

  /**
   * Obtener analytics de un curso (cuántos usuarios, progreso promedio, etc)
   */
  async getCourseAnalytics(courseId: number): Promise<any> {
    try {
      const result = await this.courseProgressRepository
        .createQueryBuilder('progress')
        .select('COUNT(progress.id)', 'totalStudents')
        .addSelect('SUM(CASE WHEN progress.completed_at IS NOT NULL THEN 1 ELSE 0 END)', 'completedStudents')
        .addSelect('AVG(progress.progress_percentage)', 'averageProgress')
        .addSelect('AVG(EXTRACT(EPOCH FROM (progress.completed_at - progress.started_at)) / 86400)', 'averageCompletionDays')
        .where('progress.course_id = :courseId', { courseId })
        .getRawOne();
      
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener analytics del curso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener analytics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener ranking de usuarios (top estudiantes)
   */
  async getUserRanking(limit: number = 10): Promise<any[]> {
    try {
      return await this.courseProgressRepository
        .createQueryBuilder('progress')
        .innerJoin('progress.user', 'user')
        .select('user.id', 'userId')
        .addSelect('user.name', 'userName')
        .addSelect('user.email', 'userEmail')
        .addSelect('COUNT(CASE WHEN progress.completed_at IS NOT NULL THEN 1 END)', 'coursesCompleted')
        .groupBy('user.id')
        .addGroupBy('user.name')
        .addGroupBy('user.email')
        .orderBy('coursesCompleted', 'DESC')
        .limit(limit)
        .getRawMany();
    } catch (error) {
      this.logger.error(`Error al obtener ranking: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener ranking',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}