import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ChapterConsultDao } from '../../../domain/chapters/dao/chapter-consult.dao';
import { ChapterDeleteDao } from '../../../domain/chapters/dao/chapter-delete.dao';

@Injectable()
export class ChapterDeleteService {
  private readonly logger = new Logger(ChapterDeleteService.name);

  constructor(
    private readonly chapterConsultDao: ChapterConsultDao,
    private readonly ChapterDeleteDao: ChapterDeleteDao,
  ) {}


  /**
   * Eliminar un capítulo (soft delete - cambiar a ARCHIVED)
   */
  async softDelete(id: number): Promise<{ 
    success: boolean; 
    message: string 
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

      // Archivar el capítulo
      await this.ChapterDeleteDao.softDelete(id);

      return {
        success: true,
        message: 'Capítulo archivado exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al archivar capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Eliminar un capítulo permanentemente
   */
  async delete(id: number): Promise<{ 
    success: boolean; 
    message: string 
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

      // Eliminar el capítulo
      const deleted = await this.ChapterDeleteDao.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar el capítulo'
        };
      }

      return {
        success: true,
        message: 'Capítulo eliminado permanentemente'
      };
    } catch (error) {
      this.logger.error(`Error al eliminar capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  
}