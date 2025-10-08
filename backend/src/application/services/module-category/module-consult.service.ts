import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ModuleConsultDao } from '../../../domain/modules-category/dao/module-consult.dao';
import { ModuleResponseDto, ModuleWithStatsDto,ModuleListItemDto } from '../../../domain/modules-category/dto/module-category.dto';
import { Modules } from '../../../domain/modules-category/entity/module-category.entity';

@Injectable()
export class ModuleConsultService {
  private readonly logger = new Logger(ModuleConsultService.name);

  constructor(
    private readonly moduleConsultDao: ModuleConsultDao
  ) {}

  /**
   * Obtener todos los módulos
   */
  async findAll(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ModuleResponseDto[] 
  }> {
    try {
      const modules = await this.moduleConsultDao.findAll();

      return {
        success: true,
        message: 'Módulos obtenidos exitosamente',
        data: modules.map(module => this.mapToResponseDto(module))
      };
    } catch (error) {
      this.logger.error(`Error al obtener módulos: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener todos los módulos con estadísticas (conteo de cursos)
   */
  async findAllWithStats(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ModuleWithStatsDto[] 
  }> {
    try {
      const modules = await this.moduleConsultDao.findAll();

      const modulesWithStats = await Promise.all(
        modules.map(async (module) => {
          const activeCoursesCount = await this.moduleConsultDao.countActiveCoursesByModule(module.id);
          
          return {
            ...this.mapToResponseDto(module),
            coursesCount: activeCoursesCount, 
            activeCoursesCount: activeCoursesCount
          };
        })
      );

      return {
        success: true,
        message: 'Módulos con estadísticas obtenidos exitosamente',
        data: modulesWithStats
      };
    } catch (error) {
      this.logger.error(`Error al obtener módulos con estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ModuleResponseDto 
  }> {
    try {
      const module = await this.moduleConsultDao.findById(id);

      if (!module) {
        return {
          success: false,
          message: 'Módulo no encontrado'
        };
      }

      return {
        success: true,
        message: 'Módulo encontrado',
        data: this.mapToResponseDto(module)
      };
    } catch (error) {
      this.logger.error(`Error al buscar módulo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener un módulo por ID con estadísticas
   */
  async findByIdWithStats(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ModuleWithStatsDto 
  }> {
    try {
      const module = await this.moduleConsultDao.findById(id);

      if (!module) {
        return {
          success: false,
          message: 'Módulo no encontrado'
        };
      }

      const activeCoursesCount = await this.moduleConsultDao.countActiveCoursesByModule(id);

      const moduleWithStats: ModuleWithStatsDto = {
        ...this.mapToResponseDto(module),
        coursesCount: activeCoursesCount,
        activeCoursesCount: activeCoursesCount
      };

      return {
        success: true,
        message: 'Módulo encontrado',
        data: moduleWithStats
      };
    } catch (error) {
      this.logger.error(`Error al buscar módulo con estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Listar módulos de forma simplificada (para selects/dropdowns)
   */
  async findAllSimple(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ModuleListItemDto[] 
  }> {
    try {
      const modules = await this.moduleConsultDao.findAll();

      const simpleModules: ModuleListItemDto[] = modules.map(module => ({
        id: module.id,
        name: module.name,
        icon: module.icon,
        coursesCount: 0 
      }));

      return {
        success: true,
        message: 'Lista de módulos obtenida',
        data: simpleModules
      };
    } catch (error) {
      this.logger.error(`Error al obtener lista simple de módulos: ${error.message}`, error.stack);
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