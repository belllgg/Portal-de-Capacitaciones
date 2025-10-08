import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CourseConsultDao } from '../../../domain/courses/dao/course-consult.dao';
import { CourseResponseDto,CourseListItemDto,CourseSimpleDto,CourseWithStatsDto} from '../../../domain/courses/dto/course.dto';
import { Course } from '../../../domain/courses/entity/course.entity';

@Injectable()
export class CourseConsultService {
  private readonly logger = new Logger(CourseConsultService.name);

  constructor(
    private readonly courseConsultDao: CourseConsultDao
  ) {}

  /**
   * Obtener todos los cursos
   */
  async findAll(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseListItemDto[] 
  }> {
    try {
      const courses = await this.courseConsultDao.findAll();

      return {
        success: true,
        message: 'Cursos obtenidos exitosamente',
        data: courses.map(course => this.mapToListItemDto(course))
      };
    } catch (error) {
      this.logger.error(`Error al obtener cursos: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener solo cursos activos
   */
  async findActiveOnly(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseListItemDto[] 
  }> {
    try {
      const courses = await this.courseConsultDao.findActiveOnly();

      return {
        success: true,
        message: 'Cursos activos obtenidos exitosamente',
        data: courses.map(course => this.mapToListItemDto(course))
      };
    } catch (error) {
      this.logger.error(`Error al obtener cursos activos: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener un curso por ID
   */
  async findById(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseResponseDto 
  }> {
    try {
      const course = await this.courseConsultDao.findById(id);

      if (!course) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      return {
        success: true,
        message: 'Curso encontrado',
        data: this.mapToResponseDto(course)
      };
    } catch (error) {
      this.logger.error(`Error al buscar curso: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener cursos por módulo
   */
  async findByModuleId(moduleId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseListItemDto[] 
  }> {
    try {
      const courses = await this.courseConsultDao.findByModuleId(moduleId);

      return {
        success: true,
        message: `Cursos del módulo obtenidos exitosamente`,
        data: courses.map(course => this.mapToListItemDto(course))
      };
    } catch (error) {
      this.logger.error(`Error al obtener cursos por módulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener cursos ACTIVOS por módulo
   */
  async findActiveByModuleId(moduleId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseListItemDto[] 
  }> {
    try {
      const courses = await this.courseConsultDao.findActiveByModuleId(moduleId);

      return {
        success: true,
        message: `Cursos activos del módulo obtenidos exitosamente`,
        data: courses.map(course => this.mapToListItemDto(course))
      };
    } catch (error) {
      this.logger.error(`Error al obtener cursos activos por módulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener cursos por estado
   */
  async findByStateId(stateId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseListItemDto[] 
  }> {
    try {
      const courses = await this.courseConsultDao.findByStateId(stateId);

      return {
        success: true,
        message: 'Cursos obtenidos por estado',
        data: courses.map(course => this.mapToListItemDto(course))
      };
    } catch (error) {
      this.logger.error(`Error al obtener cursos por estado: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Buscar cursos por texto
   */
  async searchByText(searchText: string): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseListItemDto[] 
  }> {
    try {
      const courses = await this.courseConsultDao.searchByText(searchText);

      return {
        success: true,
        message: `Se encontraron ${courses.length} cursos`,
        data: courses.map(course => this.mapToListItemDto(course))
      };
    } catch (error) {
      this.logger.error(`Error al buscar cursos: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener cursos creados por un usuario
   */
  async findByCreatorId(creatorId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseListItemDto[] 
  }> {
    try {
      const courses = await this.courseConsultDao.findByCreatorId(creatorId);

      return {
        success: true,
        message: 'Cursos del creador obtenidos',
        data: courses.map(course => this.mapToListItemDto(course))
      };
    } catch (error) {
      this.logger.error(`Error al obtener cursos por creador: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mapear a DTO de respuesta completo
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

  /**
   * Mapear a DTO de listado
   */
  private mapToListItemDto(course: Course): CourseListItemDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructorName: course.instructorName,
      thumbnailUrl: course.thumbnailUrl,
      durationHours: course.durationHours,
      moduleName: course.module.name,
      moduleIcon: course.module.icon,
      stateName: course.state.name,
      chaptersCount: 0 
    };
  }
}