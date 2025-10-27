import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ChapterConsultDao } from '../../../domain/chapters/dao/chapter-consult.dao';
import { ChapterUpdateDao } from '../../../domain/chapters/dao/chapter-update.dao';
import { UpdateChapterDto,ChapterResponseDto,ReorderChaptersDto} from '../../../domain/chapters/dto/chapter.dto';
import { Chapter } from '../../../domain/chapters/entity/chapter.entity';

@Injectable()
export class ChapterUpdateService {
  private readonly logger = new Logger(ChapterUpdateService.name);

  constructor(
    private readonly chapterConsultDao: ChapterConsultDao,
    private readonly ChapterUpdateDao: ChapterUpdateDao,
  ) {}


  async update(
    id: number, 
    updateChapterDto: UpdateChapterDto
  ): Promise<{ 
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

      if (updateChapterDto.orderIndex !== undefined) {
        const orderExists = await this.chapterConsultDao.existsByOrderIndex(
          chapter.courseId,
          updateChapterDto.orderIndex,
          id 
        );
        
        if (orderExists) {
          throw new HttpException(
            `Ya existe otro capítulo con el orden ${updateChapterDto.orderIndex} en este curso`,
            HttpStatus.CONFLICT
          );
        }
      }

      const updatedChapter = await this.ChapterUpdateDao.update(id, updateChapterDto);

      if (!updatedChapter) {
        return {
          success: false,
          message: 'No se pudo actualizar el capítulo'
        };
      }

      return {
        success: true,
        message: 'Capítulo actualizado exitosamente',
        data: this.mapToResponseDto(updatedChapter)
      };
    } catch (error) {
      this.logger.error(`Error al actualizar capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  async reorder(
    courseId: number,
    reorderDto: ReorderChaptersDto
  ): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const chapters = await this.chapterConsultDao.findByCourseId(courseId);
      const chapterIds = chapters.map(ch => ch.id);
      
const invalidIds = reorderDto.chapterIds.filter(id => !chapterIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new HttpException(
          `Los siguientes IDs no pertenecen al curso: ${invalidIds.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      const updates = reorderDto.chapterIds.map((id, index) => ({
        id,
        orderIndex: index + 1 
      }));

      await this.ChapterUpdateDao.updateOrderIndexes(updates);

      return {
        success: true,
        message: 'Capítulos reordenados exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al reordenar capítulos: ${error.message}`, error.stack);
      throw error;
    }
  }

  async changeState(
    id: number, 
    stateId: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterResponseDto 
  }> {
    try {
      const exists = await this.chapterConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Capítulo no encontrado'
        };
      }

      if (stateId < 1 || stateId > 3) {
        throw new HttpException(
          'Estado inválido. Debe ser 1 (DRAFT), 2 (PUBLISHED) o 3 (ARCHIVED)',
          HttpStatus.BAD_REQUEST
        );
      }

      const chapter = await this.ChapterUpdateDao.changeState(id, stateId);

      if (!chapter) {
        return {
          success: false,
          message: 'No se pudo cambiar el estado del capítulo'
        };
      }

      return {
        success: true,
        message: 'Estado del capítulo actualizado',
        data: this.mapToResponseDto(chapter)
      };
    } catch (error) {
      this.logger.error(`Error al cambiar estado del capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }


  async publish(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterResponseDto 
  }> {
    return await this.changeState(id, 2); // 2 = PUBLISHED
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
}