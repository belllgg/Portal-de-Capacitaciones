import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CourseConsultDao } from '../../../domain/courses/dao/course-consult.dao';
import { CourseUpdateDao } from '../../../domain/courses/dao/course-update.dao';
import { ModuleConsultDao } from '../../../domain/modules-category/dao/module-consult.dao';
import { UpdateCourseDto,CourseResponseDto} from '../../../domain/courses/dto/course.dto';
import { Course } from '../../../domain/courses/entity/course.entity';

@Injectable()
export class CourseUpdateService {
  private readonly logger = new Logger(CourseUpdateService.name);

  constructor(
    private readonly courseConsultDao: CourseConsultDao,
    private readonly CourseUpdateDao: CourseUpdateDao,
    private readonly moduleConsultDao: ModuleConsultDao
  ) {}

  /**
   * Actualizar un curso existente (solo ADMIN o CREADOR)
   */
  async update(
    id: number, 
    updateCourseDto: UpdateCourseDto
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseResponseDto 
  }> {
    try {
      // Verificar que el curso existe
      const exists = await this.courseConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Si se está cambiando el módulo, validar que existe
      if (updateCourseDto.moduleId) {
        const moduleExists = await this.moduleConsultDao.existsById(updateCourseDto.moduleId);
        
        if (!moduleExists) {
          throw new HttpException(
            'El módulo especificado no existe',
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Actualizar el curso
      const course = await this.CourseUpdateDao.update(id, updateCourseDto);

      if (!course) {
        return {
          success: false,
          message: 'No se pudo actualizar el curso'
        };
        }

      return {
        success: true,
        message: 'Curso actualizado exitosamente',
        data: this.mapToResponseDto(course)
      };
    } catch (error) {
      this.logger.error(`Error al actualizar curso: ${error.message}`, error.stack);
      throw error;
    }
  }


  /**
   * Cambiar el estado de un curso
   */
  async changeState(
    id: number, 
    stateId: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseResponseDto 
  }> {
    try {
      // Verificar que el curso existe
      const exists = await this.courseConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Validar que el estado es válido (1-4)
      if (stateId < 1 || stateId > 4) {
        throw new HttpException(
          'Estado inválido. Debe ser 1 (DRAFT), 2 (ACTIVE), 3 (INACTIVE) o 4 (ARCHIVED)',
          HttpStatus.BAD_REQUEST
        );
      }

      // Cambiar el estado
      const course = await this.CourseUpdateDao.changeState(id, stateId);

      if (!course) {
        return {
          success: false,
          message: 'No se pudo cambiar el estado del curso'
        };
      }

      return {
        success: true,
        message: 'Estado del curso actualizado',
        data: this.mapToResponseDto(course)
      };
    } catch (error) {
      this.logger.error(`Error al cambiar estado del curso: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Publicar un curso (cambiar de DRAFT a ACTIVE)
   */
  async publish(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseResponseDto 
  }> {
    return await this.changeState(id, 2); // 2 = ACTIVE
  }

  /**
   * Pausar un curso (cambiar a INACTIVE)
   */
  async pause(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseResponseDto 
  }> {
    return await this.changeState(id, 3); // 3 = INACTIVE
  }

  /**
   * Mapear a DTO de respuesta
   */
  private mapToResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructorName: course.instructorName,
      thumbnailUrl: course.thumbnailUrl,
      durationHours: course.durationHours,
      module: {
        id: course.module.id,
        name: course.module.name,
        icon: course.module.icon
      },
      state: {
        id: course.state.id,
        name: course.state.name,
        description: course.state.description
      },
      creator: course.creator ? {
        id: course.creator.id,
        name: course.creator.name,
        email: course.creator.email
      } : null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
  }
}