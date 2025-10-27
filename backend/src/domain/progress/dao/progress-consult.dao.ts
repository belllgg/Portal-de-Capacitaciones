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

  async findUserModulesCompleted(userId: number): Promise<any[]> {
  try {
    const totalCoursesSubQuery = this.courseProgressRepository
      .createQueryBuilder('cp')
      .innerJoin('cp.course', 'c')
      .where('c.module_id = module.id')
      .andWhere('c.state_id = :stateId', { stateId: 2 }) // Solo cursos activos
      .select('COUNT(DISTINCT c.id)');

    return await this.courseProgressRepository
      .createQueryBuilder('progress')
      .innerJoin('progress.course', 'course')
      .innerJoin('course.module', 'module')
      .select('module.id', 'moduleId')
      .addSelect('module.name', 'moduleName')
      .addSelect('module.icon', 'moduleIcon')
      .addSelect('module.description', 'moduleDescription')
      .addSelect('COUNT(DISTINCT course.id)', 'completedCourses')
      .addSelect(`(${totalCoursesSubQuery.getQuery()})`, 'totalCourses')
      .addSelect('MAX(progress.completed_at)', 'completedAt') 
      .where('progress.user_id = :userId', { userId })
      .andWhere('progress.completed_at IS NOT NULL')
      .andWhere('course.state_id = :stateId', { stateId: 2 })
      .groupBy('module.id')
      .addGroupBy('module.name')
      .addGroupBy('module.icon')
      .addGroupBy('module.description')
      .having(`COUNT(DISTINCT course.id) = (${totalCoursesSubQuery.getQuery()})`) // Solo módulos completados
      .setParameters(totalCoursesSubQuery.getParameters())
      .getRawMany();
  } catch (error) {
    this.logger.error(`Error al buscar módulos completados: ${error.message}`, error.stack);
    throw new HttpException(
      'Error al consultar módulos completados',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

async findDetailedModuleProgress(userId: number): Promise<any[]> {
  try {
    const modules = await this.courseProgressRepository.query(`
      SELECT 
        m.id as "moduleId",
        m.name as "moduleName",
        m.description as "moduleDescription",
        m.icon as "moduleIcon",
        COUNT(DISTINCT c.id) as "totalCourses",
        COUNT(DISTINCT CASE WHEN ucp.completed_at IS NOT NULL THEN c.id END) as "completedCourses",
        COUNT(DISTINCT CASE WHEN ucp.id IS NOT NULL AND ucp.completed_at IS NULL THEN c.id END) as "inProgressCourses",
        MIN(ucp.started_at) as "startedAt",
        MAX(ucp.completed_at) as "lastCompletedAt",
        CASE 
          WHEN COUNT(DISTINCT c.id) = COUNT(DISTINCT CASE WHEN ucp.completed_at IS NOT NULL THEN c.id END) 
            AND COUNT(DISTINCT c.id) > 0 
          THEN 'completed'
          WHEN COUNT(DISTINCT CASE WHEN ucp.id IS NOT NULL THEN c.id END) > 0 
          THEN 'in_progress'
          ELSE 'not_started'
        END as "status"
      FROM modules m
      LEFT JOIN courses c ON c.module_id = m.id AND c.state_id = 2
      LEFT JOIN user_course_progress ucp ON ucp.course_id = c.id AND ucp.user_id = $1
      GROUP BY m.id, m.name, m.description, m.icon
      HAVING COUNT(DISTINCT c.id) > 0
      ORDER BY 
        CASE 
          WHEN COUNT(DISTINCT c.id) = COUNT(DISTINCT CASE WHEN ucp.completed_at IS NOT NULL THEN c.id END) 
            AND COUNT(DISTINCT c.id) > 0 
          THEN 3
          WHEN COUNT(DISTINCT CASE WHEN ucp.id IS NOT NULL THEN c.id END) > 0 
          THEN 1
          ELSE 2
        END,
        m.name
    `, [userId]);

    return modules;
  } catch (error) {
    this.logger.error(`Error al obtener progreso de módulos: ${error.message}`, error.stack);
    throw new HttpException(
      'Error al consultar progreso de módulos',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
}