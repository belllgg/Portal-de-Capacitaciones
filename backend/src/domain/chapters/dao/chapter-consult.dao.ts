import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../entity/chapter.entity';

@Injectable()
export class ChapterConsultDao {
  private readonly logger = new Logger(ChapterConsultDao.name);

  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  /**
   * Obtener todos los capítulos de un curso
   */
  async findByCourseId(courseId: number): Promise<Chapter[]> {
    try {
      return await this.chapterRepository.find({
        where: { courseId },
        relations: ['state', 'course'],
        order: { orderIndex: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener capítulos por curso en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar capítulos en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener solo capítulos PUBLICADOS de un curso
   */
  async findPublishedByCourseId(courseId: number): Promise<Chapter[]> {
    try {
      return await this.chapterRepository.find({
        where: { 
          courseId,
          stateId: 2 // PUBLISHED
        },
        relations: ['state'],
        order: { orderIndex: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener capítulos publicados en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar capítulos publicados',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar capítulo por ID
   */
  async findById(id: number): Promise<Chapter | null> {
    try {
      return await this.chapterRepository.findOne({ 
        where: { id },
        relations: ['state', 'course']
      });
    } catch (error) {
      this.logger.error(`Error al buscar capítulo por ID en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar capítulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

    async findByIdcourse(id: number): Promise<Chapter | null> {
    try {
      return await this.chapterRepository.findOne({ 
        where: { id },
        relations: ['state', 'course']
      });
    } catch (error) {
      this.logger.error(`Error al buscar capítulo por ID en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar capítulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verificar si existe un capítulo por ID
   */
  async existsById(id: number): Promise<boolean> {
    try {
      const count = await this.chapterRepository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia del capítulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar capítulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar capítulos de un curso
   */
  async countByCourseId(courseId: number): Promise<number> {
    try {
      return await this.chapterRepository.count({ 
        where: { courseId } 
      });
    } catch (error) {
      this.logger.error(`Error al contar capítulos del curso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar capítulos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar capítulos publicados de un curso
   */
  async countPublishedByCourseId(courseId: number): Promise<number> {
    try {
      return await this.chapterRepository.count({ 
        where: { 
          courseId,
          stateId: 2 // PUBLISHED
        } 
      });
    } catch (error) {
      this.logger.error(`Error al contar capítulos publicados: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar capítulos publicados',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar capítulos por estado
   */
  async findByStateId(stateId: number): Promise<Chapter[]> {
    try {
      return await this.chapterRepository.find({
        where: { stateId },
        relations: ['state', 'course'],
        order: { courseId: 'ASC', orderIndex: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar capítulos por estado en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar capítulos por estado',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener el último order_index de un curso
   */
  async getLastOrderIndexByCourseId(courseId: number): Promise<number> {
    try {
      const result = await this.chapterRepository
        .createQueryBuilder('chapter')
        .select('MAX(chapter.order_index)', 'maxOrder')
        .where('chapter.course_id = :courseId', { courseId })
        .getRawOne();
      
      return result?.maxOrder || 0;
    } catch (error) {
      this.logger.error(`Error al obtener último orden: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener último orden',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verificar si existe un capítulo con ese order_index en el curso
   */
  async existsByOrderIndex(courseId: number, orderIndex: number, excludeId?: number): Promise<boolean> {
    try {
      const query = this.chapterRepository
        .createQueryBuilder('chapter')
        .where('chapter.course_id = :courseId', { courseId })
        .andWhere('chapter.order_index = :orderIndex', { orderIndex });
      
      if (excludeId) {
        query.andWhere('chapter.id != :excludeId', { excludeId });
      }
      
      const count = await query.getCount();
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar order_index: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar orden del capítulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Calcular duración total de los capítulos de un curso
   */
  async getTotalDurationByCourseId(courseId: number): Promise<number> {
    try {
      const result = await this.chapterRepository
        .createQueryBuilder('chapter')
        .select('SUM(chapter.duration_minutes)', 'totalMinutes')
        .where('chapter.course_id = :courseId', { courseId })
        .andWhere('chapter.state_id = :stateId', { stateId: 2 }) // Solo publicados
        .getRawOne();
      
      return result?.totalMinutes || 0;
    } catch (error) {
      this.logger.error(`Error al calcular duración total: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al calcular duración',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}