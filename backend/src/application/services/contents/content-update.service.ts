import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ContentConsultDao } from '../../../domain/contents/dao/content-consult.dao';
import { ContentUpdateDao } from '../../../domain/contents/dao/content-update.dao';
import { UpdateContentDto,ContentResponseDto,ReorderContentsDto} from '../../../domain/contents/dto/content.dto';
import { ChapterContent } from '../../../domain/contents/entity/content.entity';

@Injectable()
export class ContentUpdateService {
  private readonly logger = new Logger(ContentUpdateService.name);

  constructor(
    private readonly contentConsultDao: ContentConsultDao,
    private readonly ContentUpdateDao: ContentUpdateDao,
  ) {}


  /**
   * Actualizar un contenido existente
   */
  async update(
    id: number, 
    updateContentDto: UpdateContentDto
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ContentResponseDto 
  }> {
    try {
      // Verificar que el contenido existe
      const content = await this.contentConsultDao.findById(id);
      
      if (!content) {
        return {
          success: false,
          message: 'Contenido no encontrado'
        };
      }

      // Si se está cambiando el order_index, validar que no esté duplicado
      if (updateContentDto.orderIndex !== undefined) {
        const orderExists = await this.contentConsultDao.existsByOrderIndex(
          content.chapterId,
          updateContentDto.orderIndex,
          id // Excluir el contenido actual
        );
        
        if (orderExists) {
          throw new HttpException(
            `Ya existe otro contenido con el orden ${updateContentDto.orderIndex} en este capítulo`,
            HttpStatus.CONFLICT
          );
        }
      }

      // Actualizar el contenido
      const updatedContent = await this.ContentUpdateDao.update(id, updateContentDto);

      if (!updatedContent) {
        return {
          success: false,
          message: 'No se pudo actualizar el contenido'
        };
      }

      return {
        success: true,
        message: 'Contenido actualizado exitosamente',
        data: this.mapToResponseDto(updatedContent)
      };
    } catch (error) {
      this.logger.error(`Error al actualizar contenido: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reordenar contenidos de un capítulo
   */
  async reorder(
    chapterId: number,
    reorderDto: ReorderContentsDto
  ): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // Validar que todos los IDs pertenecen al capítulo
      const contents = await this.contentConsultDao.findByChapterId(chapterId);
      const contentIds = contents.map(c => c.id);
      
      const invalidIds = reorderDto.contentIds.filter(id => !contentIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new HttpException(
          `Los siguientes IDs no pertenecen al capítulo: ${invalidIds.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Crear array de actualizaciones
      const updates = reorderDto.contentIds.map((id, index) => ({
        id,
        orderIndex: index + 1 // Orden comienza en 1
      }));

      // Actualizar todos los order_index
      await this.ContentUpdateDao.updateOrderIndexes(updates);

      return {
        success: true,
        message: 'Contenidos reordenados exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al reordenar contenidos: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mapear a DTO de respuesta
   */
  private mapToResponseDto(content: ChapterContent): ContentResponseDto {
    return {
      id: content.id,
      title: content.title,
      fileUrl: content.fileUrl,
      fileSizeMb: content.fileSizeMb,
      orderIndex: content.orderIndex,
      contentType: {
        id: content.contentType.id,
        name: content.contentType.name
      },
      chapter: {
        id: content.chapter.id,
        title: content.chapter.title,
        courseId: content.chapter.courseId
      },
      createdAt: content.createdAt
    };
  }
}