import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CourseCreateDao } from '../../../domain/courses/dao/course-create.dao';
import { ModuleConsultDao } from '../../../domain/modules-category/dao/module-consult.dao';
import { CreateCourseDto,CourseResponseDto} from '../../../domain/courses/dto/course.dto';
import { Course } from '../../../domain/courses/entity/course.entity';

@Injectable()
export class CourseCreateService {
  private readonly logger = new Logger(CourseCreateService.name);

  constructor(
    private readonly CourseCreateDao: CourseCreateDao,
    private readonly moduleConsultDao: ModuleConsultDao
  ) {}


  async create(
    createCourseDto: CreateCourseDto, 
    createdBy: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: CourseResponseDto 
  }> {
    try {
      const moduleExists = await this.moduleConsultDao.existsById(createCourseDto.moduleId);
      
      if (!moduleExists) {
        throw new HttpException(
          'El módulo especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      const course = await this.CourseCreateDao.create(createCourseDto, createdBy);

      return {
        success: true,
        message: 'Curso creado exitosamente',
        data: this.mapToResponseDto(course)
      };
    } catch (error) {
      this.logger.error(`Error al crear curso: ${error.message}`, error.stack);
      throw error;
    }
  }
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