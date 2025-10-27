import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ModuleConsultDao } from '../../../domain/modules-category/dao/module-consult.dao';
import { ModuleDeleteDao } from '../../../domain/modules-category/dao/module-delete.dao';

@Injectable()
export class ModuleDeleteService {
  private readonly logger = new Logger(ModuleDeleteService.name);

  constructor(
    private readonly moduleConsultDao: ModuleConsultDao,
    private readonly ModuleDeleteDao: ModuleDeleteDao
  ) {}


  /**
   * Eliminar un módulo (solo ADMIN)
   * NOTA: Solo se puede eliminar si no tiene cursos asociados
   */
  async delete(id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const exists = await this.moduleConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Módulo no encontrado'
        };
      }

      const deleted = await this.ModuleDeleteDao.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar el módulo'
        };
      }

      return {
        success: true,
        message: 'Módulo eliminado exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al eliminar módulo: ${error.message}`, error.stack);
      
      throw error;
    }
  }
}