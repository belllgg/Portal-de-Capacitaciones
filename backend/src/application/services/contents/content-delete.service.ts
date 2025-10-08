import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ContentConsultDao } from '../../../domain/contents/dao/content-consult.dao';
import { ContentDeleteDao } from '../../../domain/contents/dao/content-delete.dao';
import { ChapterConsultDao } from '../../../domain/chapters/dao/chapter-consult.dao';

@Injectable()
export class ContentDeleteService {
  private readonly logger = new Logger(ContentDeleteService.name);

  constructor(
    private readonly contentConsultDao: ContentConsultDao,
    private readonly ContentDeleteDao: ContentDeleteDao,
    private readonly chapterConsultDao: ChapterConsultDao
  ) {}


  /**
   * Eliminar un contenido permanentemente
   */
  async delete(id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // Verificar que el contenido existe
      const exists = await this.contentConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Contenido no encontrado'
        };
      }

      // Eliminar el contenido
      const deleted = await this.ContentDeleteDao.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar el contenido'
        };
      }

      return {
        success: true,
        message: 'Contenido eliminado exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al eliminar contenido: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Eliminar todos los contenidos de un capítulo
   */
  async deleteByChapterId(chapterId: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      // Verificar que el capítulo existe
      const chapterExists = await this.chapterConsultDao.existsById(chapterId);
      
      if (!chapterExists) {
        return {
          success: false,
          message: 'Capítulo no encontrado'
        };
      }

      // Eliminar todos los contenidos
      await this.ContentDeleteDao.deleteByChapterId(chapterId);

      return {
        success: true,
        message: 'Todos los contenidos del capítulo fueron eliminados'
      };
    } catch (error) {
      this.logger.error(`Error al eliminar contenidos del capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }

}