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


  async softDelete(id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const exists = await this.chapterConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Capítulo no encontrado'
        };
      }

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

  async delete(id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const exists = await this.chapterConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Capítulo no encontrado'
        };
      }

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