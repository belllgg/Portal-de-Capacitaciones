import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entity/course.entity';

@Injectable()
export class CourseConsultDao {
  private readonly logger = new Logger(CourseConsultDao.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /**
   * Obtener todos los cursos
   */
  async findAll(): Promise<Course[]> {
    try {
      return await this.courseRepository.find({
        relations: ['module', 'state', 'creator'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener cursos en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar cursos en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar curso por ID
   */
  async findById(id: number): Promise<Course | null> {
    try {
      return await this.courseRepository.findOne({ 
        where: { id },
        relations: ['module', 'state', 'creator']
      });
    } catch (error) {
      this.logger.error(`Error al buscar curso por ID en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar curso en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar cursos por módulo
   */
  async findByModuleId(moduleId: number): Promise<Course[]> {
    try {
      return await this.courseRepository.find({
        where: { moduleId },
        relations: ['module', 'state', 'creator'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar cursos por módulo en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar cursos por módulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar cursos ACTIVOS por módulo
   */
  async findActiveByModuleId(moduleId: number): Promise<Course[]> {
    try {
      return await this.courseRepository.find({
        where: { 
          moduleId,
          stateId: 2 // ACTIVE
        },
        relations: ['module', 'state', 'creator'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar cursos activos por módulo en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar cursos activos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar solo cursos ACTIVOS
   */
  async findActiveOnly(): Promise<Course[]> {
    try {
      return await this.courseRepository.find({
        where: { stateId: 2 }, // ACTIVE
        relations: ['module', 'state'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar cursos activos en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar cursos activos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar cursos por estado
   */
  async findByStateId(stateId: number): Promise<Course[]> {
    try {
      return await this.courseRepository.find({
        where: { stateId },
        relations: ['module', 'state', 'creator'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar cursos por estado en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar cursos por estado',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar cursos creados por un usuario
   */
  async findByCreatorId(creatorId: number): Promise<Course[]> {
    try {
      return await this.courseRepository.find({
        where: { createdBy: creatorId },
        relations: ['module', 'state'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar cursos por creador en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar cursos por creador',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verificar si existe un curso por ID
   */
  async existsById(id: number): Promise<boolean> {
    try {
      const count = await this.courseRepository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia del curso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar curso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar cursos por módulo
   */
  async countByModuleId(moduleId: number): Promise<number> {
    try {
      return await this.courseRepository.count({ 
        where: { moduleId } 
      });
    } catch (error) {
      this.logger.error(`Error al contar cursos por módulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar cursos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar cursos activos por módulo
   */
  async countActiveByModuleId(moduleId: number): Promise<number> {
    try {
      return await this.courseRepository.count({ 
        where: { 
          moduleId,
          stateId: 2 // ACTIVE
        } 
      });
    } catch (error) {
      this.logger.error(`Error al contar cursos activos: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar cursos activos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar cursos con búsqueda por texto (título o descripción)
   */
  async searchByText(searchText: string): Promise<Course[]> {
    try {
      return await this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.module', 'module')
        .leftJoinAndSelect('course.state', 'state')
        .leftJoinAndSelect('course.creator', 'creator')
        .where('LOWER(course.title) LIKE LOWER(:search)', { search: `%${searchText}%` })
        .orWhere('LOWER(course.description) LIKE LOWER(:search)', { search: `%${searchText}%` })
        .orWhere('LOWER(course.instructorName) LIKE LOWER(:search)', { search: `%${searchText}%` })
        .orderBy('course.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error al buscar cursos por texto: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al buscar cursos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}