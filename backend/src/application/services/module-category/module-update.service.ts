import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ModuleConsultDao } from '../../../domain/modules-category/dao/module-consult.dao';
import { ModuleUpdateDao } from '../../../domain/modules-category/dao/module-update.dao';
import { UpdateModuleDto,ModuleResponseDto } from '../../../domain/modules-category/dto/module-category.dto';
import { Modules } from '../../../domain/modules-category/entity/module-category.entity';

@Injectable()
export class ModuleUpdateService {
  private readonly logger = new Logger(ModuleUpdateService.name);

  constructor(
    private readonly moduleConsultDao: ModuleConsultDao,
    private readonly ModuleUpdateDao: ModuleUpdateDao
  ) {}

  /**
   * Actualizar un módulo existente (solo ADMIN)
   */
  async update(id: number, updateModuleDto: UpdateModuleDto): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ModuleResponseDto 
  }> {
    try {
      // Verificar que el módulo existe
      const exists = await this.moduleConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Módulo no encontrado'
        };
      }

      // Si se está actualizando el nombre, validar que no exista otro con ese nombre
      if (updateModuleDto.name) {
        const existingModule = await this.moduleConsultDao.findByName(updateModuleDto.name);
        
        if (existingModule && existingModule.id !== id) {
          throw new HttpException(
            'Ya existe otro módulo con ese nombre',
            HttpStatus.CONFLICT
          );
        }
      }

      // Actualizar el módulo
      const module = await this.ModuleUpdateDao.update(id, updateModuleDto);

      if (!module) {
        return {
          success: false,
          message: 'No se pudo actualizar el módulo'
        };
      }

      return {
        success: true,
        message: 'Módulo actualizado exitosamente',
        data: this.mapToResponseDto(module)
      };
    } catch (error) {
      this.logger.error(`Error al actualizar módulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mapear entidad a DTO de respuesta
   */
  private mapToResponseDto(module: Modules): ModuleResponseDto {
    return {
      id: module.id,
      name: module.name,
      description: module.description,
      icon: module.icon,
      createdAt: module.createdAt
    };
  }
}