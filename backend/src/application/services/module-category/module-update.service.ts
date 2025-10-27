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

  async update(id: number, updateModuleDto: UpdateModuleDto): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ModuleResponseDto 
  }> {
    try {
      const exists = await this.moduleConsultDao.existsById(id);
      
      if (!exists) {
        return {
          success: false,
          message: 'Módulo no encontrado'
        };
      }

      if (updateModuleDto.name) {
        const existingModule = await this.moduleConsultDao.findByName(updateModuleDto.name);
        
        if (existingModule && existingModule.id !== id) {
          throw new HttpException(
            'Ya existe otro módulo con ese nombre',
            HttpStatus.CONFLICT
          );
        }
      }

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