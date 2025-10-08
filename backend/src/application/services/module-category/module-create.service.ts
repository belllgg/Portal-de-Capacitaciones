import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ModuleConsultDao } from '../../../domain/modules-category/dao/module-consult.dao';
import { ModuleCreateDao } from '../../../domain/modules-category/dao/module-create.dao';
import { CreateModuleDto,ModuleResponseDto } from '../../../domain/modules-category/dto/module-category.dto';
import { Modules } from '../../../domain/modules-category/entity/module-category.entity';

@Injectable()
export class ModuleCreateService {
  private readonly logger = new Logger(ModuleCreateService.name);

  constructor(
    private readonly moduleConsultDao: ModuleConsultDao,
    private readonly ModuleCreateDao: ModuleCreateDao
  ) {}

  /**
   * Crear un nuevo módulo (solo ADMIN)
   */
  async create(createModuleDto: CreateModuleDto): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ModuleResponseDto 
  }> {
    try {
      // Validar que no exista un módulo con ese nombre
      const existingModule = await this.moduleConsultDao.findByName(createModuleDto.name);
      
      if (existingModule) {
        throw new HttpException(
          'Ya existe un módulo con ese nombre',
          HttpStatus.CONFLICT
        );
      }

      // Crear el módulo
      const module = await this.ModuleCreateDao.create(createModuleDto);

      return {
        success: true,
        message: 'Módulo creado exitosamente',
        data: this.mapToResponseDto(module)
      };
    } catch (error) {
      this.logger.error(`Error al crear módulo: ${error.message}`, error.stack);
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