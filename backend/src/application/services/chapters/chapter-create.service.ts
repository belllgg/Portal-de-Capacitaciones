import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ChapterConsultDao } from '../../../domain/chapters/dao/chapter-consult.dao';
import { ChapterCreateDao } from '../../../domain/chapters/dao/chapter-create.dao';
import { CourseConsultDao } from '../../../domain/courses/dao/course-consult.dao';
import { CreateChapterDto,ChapterResponseDto} from '../../../domain/chapters/dto/chapter.dto';
import { Chapter } from '../../../domain/chapters/entity/chapter.entity';

@Injectable()
export class ChapterCreateService {
  private readonly logger = new Logger(ChapterCreateService.name);

  constructor(
    private readonly chapterConsultDao: ChapterConsultDao,
    private readonly ChapterCreateDao: ChapterCreateDao,
    private readonly courseConsultDao: CourseConsultDao
  ) {}

  /**
   * Crear un nuevo capítulo
   */
  async create(createChapterDto: CreateChapterDto): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterResponseDto 
  }> {
    try {
      // Validar que el curso existe
      const courseExists = await this.courseConsultDao.existsById(createChapterDto.courseId);
      
      if (!courseExists) {
        throw new HttpException(
          'El curso especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validar que el order_index no esté duplicado
      const orderExists = await this.chapterConsultDao.existsByOrderIndex(
        createChapterDto.courseId, 
        createChapterDto.orderIndex
      );
      
      if (orderExists) {
        throw new HttpException(
          `Ya existe un capítulo con el orden ${createChapterDto.orderIndex} en este curso`,
          HttpStatus.CONFLICT
        );
      }

      // Crear el capítulo
      const chapter = await this.ChapterCreateDao.create(createChapterDto);

      return {
        success: true,
        message: 'Capítulo creado exitosamente',
        data: this.mapToResponseDto(chapter!)
      };
    } catch (error) {
      this.logger.error(`Error al crear capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crear capítulo con order_index automático (al final)
   */
  async createAutoOrdered(
    courseId: number,
    title: string,
    description?: string,
    durationMinutes?: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterResponseDto 
  }> {
    try {
      // Obtener el último order_index del curso
      const lastOrder = await this.chapterConsultDao.getLastOrderIndexByCourseId(courseId);
      
      const createDto: CreateChapterDto = {
        courseId,
        title,
        description,
        orderIndex: lastOrder + 1,
        durationMinutes
      };

      return await this.create(createDto);
    } catch (error) {
      this.logger.error(`Error al crear capítulo con orden automático: ${error.message}`, error.stack);
      throw error;
    }
  }


  /**
   * Mapear a DTO de respuesta
   */
  private mapToResponseDto(chapter: Chapter): ChapterResponseDto {
    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      orderIndex: chapter.orderIndex,
      durationMinutes: chapter.durationMinutes,
      course: {
        id: chapter.course.id,
        title: chapter.course.title
      },
      state: {
        id: chapter.state.id,
        name: chapter.state.name
      },
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt
    };
  }
}