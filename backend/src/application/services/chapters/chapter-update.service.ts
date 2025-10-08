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


  /**
   * Actualizar un capítulo existente
   */
  async update(
    id: number, 
    updateChapterDto: UpdateChapterDto
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterResponseDto 
  }> {
    try {
      // Verificar que el capítulo existe
      const chapter = await this.chapterConsultDao.findById(id);
      
      if (!chapter) {
        return {
          success: false,
          message: 'Capítulo no encontrado'
        };
      }

      // Si se está cambiando el order_index, validar que no esté duplicado
      if (updateChapterDto.orderIndex !== undefined) {
        const orderExists = await this.chapterConsultDao.existsByOrderIndex(
          chapter.courseId,
          updateChapterDto.orderIndex,
          id // Excluir el capítulo actual
        );
        
        if (orderExists) {
          throw new HttpException(
            `Ya existe otro capítulo con el orden ${updateChapterDto.orderIndex} en este curso`,
            HttpStatus.CONFLICT
          );
        }
      }

      // Actualizar el capítulo
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

  /**
   * Reordenar capítulos de un curso
   */
  async reorder(
    courseId: number,
    reorderDto: ReorderChaptersDto
  ): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // Validar que todos los IDs pertenecen al curso
      const chapters = await this.chapterConsultDao.findByCourseId(courseId);
      const chapterIds = chapters.map(ch => ch.id);
      
const invalidIds = reorderDto.chapterIds.filter(id => !chapterIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new HttpException(
          `Los siguientes IDs no pertenecen al curso: ${invalidIds.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Crear array de actualizaciones
      const updates = reorderDto.chapterIds.map((id, index) => ({
        id,
        orderIndex: index + 1 // Orden comienza en 1
      }));

      // Actualizar todos los order_index
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

  /**
   * Cambiar el estado de un capítulo
   */
  async changeState(
    id: number, 
    stateId: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterResponseDto 
  }> {
    try {
      // Verificar que el capítulo existe
      const exists = await this.chapterConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Capítulo no encontrado'
        };
      }

      // Validar que el estado es válido (1-3)
      if (stateId < 1 || stateId > 3) {
        throw new HttpException(
          'Estado inválido. Debe ser 1 (DRAFT), 2 (PUBLISHED) o 3 (ARCHIVED)',
          HttpStatus.BAD_REQUEST
        );
      }

      // Cambiar el estado
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

  /**
   * Publicar un capítulo (cambiar de DRAFT a PUBLISHED)
   */
  async publish(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ChapterResponseDto 
  }> {
    return await this.changeState(id, 2); // 2 = PUBLISHED
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