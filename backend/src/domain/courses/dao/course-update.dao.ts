import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entity/course.entity';
import {UpdateCourseDto } from '../dto/course.dto';

@Injectable()
export class CourseUpdateDao {
  private readonly logger = new Logger(CourseUpdateDao.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /**
   * Actualizar un curso existente
   */
  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course | null> {
    try {
      const result = await this.courseRepository.update(id, updateCourseDto);
      
      if (result.affected === 0) {
        return null;
      }
      
      return await this.courseRepository.findOne({
        where: { id },
        relations: ['module', 'state', 'creator']
      });
    } catch (error) {
      this.logger.error(`Error al actualizar curso en BD: ${error.message}`, error.stack);
      
      // Manejo de errores de foreign key
      if (error.code === '23503') {
        throw new HttpException(
          'El módulo o estado especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al actualizar curso en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  
  /**
   * Cambiar el estado de un curso
   */
  async changeState(id: number, stateId: number): Promise<Course | null> {
    try {
      await this.courseRepository.update(id, { stateId });
      
      return await this.courseRepository.findOne({
        where: { id },
        relations: ['module', 'state']
      });
    } catch (error) {
      this.logger.error(`Error al cambiar estado del curso en BD: ${error.message}`, error.stack);
      
      if (error.code === '23503') {
        throw new HttpException(
          'El estado especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al cambiar estado del curso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}