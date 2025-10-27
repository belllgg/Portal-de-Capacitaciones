import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ChapterConsultDao } from '../../../domain/chapters/dao/chapter-consult.dao';
import { ChapterResponseDto,ChapterListItemDto
} from '../../../domain/chapters/dto/chapter.dto';
import { Chapter } from '../../../domain/chapters/entity/chapter.entity';

@Injectable()
export class ChapterConsultService {
  private readonly logger = new Logger(ChapterConsultService.name);

  constructor(
    private readonly chapterConsultDao: ChapterConsultDao
  ) {}

  async findByCourseId(courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterListItemDto[] 
  }> {
    try {
      const chapters = await this.chapterConsultDao.findByCourseId(courseId);

      return {
        success: true,
        message: 'Capítulos obtenidos exitosamente',
        data: chapters.map(chapter => this.mapToListItemDto(chapter))
      };
    } catch (error) {
      this.logger.error(`Error al obtener capítulos del curso: ${error.message}`, error.stack);
      throw error;
    }
  }


  async findPublishedByCourseId(courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterListItemDto[] 
  }> {
    try {
      const chapters = await this.chapterConsultDao.findPublishedByCourseId(courseId);

      return {
        success: true,
        message: 'Capítulos publicados obtenidos exitosamente',
        data: chapters.map(chapter => this.mapToListItemDto(chapter))
      };
    } catch (error) {
      this.logger.error(`Error al obtener capítulos publicados: ${error.message}`, error.stack);
      throw error;
    }
  }


  async findById(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterResponseDto 
  }> {
    try {
      const chapter = await this.chapterConsultDao.findById(id);

      if (!chapter) {
        return {
          success: false,
          message: 'Capítulo no encontrado'
        };
      }

      return {
        success: true,
        message: 'Capítulo encontrado',
        data: this.mapToResponseDto(chapter)
      };
    } catch (error) {
      this.logger.error(`Error al buscar capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByStateId(stateId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterListItemDto[] 
  }> {
    try {
      const chapters = await this.chapterConsultDao.findByStateId(stateId);

      return {
        success: true,
        message: 'Capítulos obtenidos por estado',
        data: chapters.map(chapter => this.mapToListItemDto(chapter))
      };
    } catch (error) {
      this.logger.error(`Error al obtener capítulos por estado: ${error.message}`, error.stack);
      throw error;
    }
  }


  async getCourseChapterStats(courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: {
      totalChapters: number;
      publishedChapters: number;
      totalMinutes: number;
    }
  }> {
    try {
      const totalChapters = await this.chapterConsultDao.countByCourseId(courseId);
      const publishedChapters = await this.chapterConsultDao.countPublishedByCourseId(courseId);
      const totalMinutes = await this.chapterConsultDao.getTotalDurationByCourseId(courseId);

      return {
        success: true,
        message: 'Estadísticas obtenidas',
        data: {
          totalChapters,
          publishedChapters,
          totalMinutes
        }
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

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

  private mapToListItemDto(chapter: Chapter): ChapterListItemDto {
    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      orderIndex: chapter.orderIndex,
      durationMinutes: chapter.durationMinutes,
      stateName: chapter.state.name,
      contentsCount: 0 
    };
  }
}