import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modules } from '../entity/module-category.entity';

@Injectable()
export class ModuleConsultDao {
  private readonly logger = new Logger(ModuleConsultDao.name);

  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) {}

  
  async findAll(): Promise<Modules[]> {
    try {
      return await this.moduleRepository.find({
        order: { id: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener módulos en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar módulos en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async findById(id: number): Promise<Modules | null> {
    try {
      return await this.moduleRepository.findOne({ 
        where: { id }
      });
    } catch (error) {
      this.logger.error(`Error al buscar módulo por ID en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar módulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByName(name: string): Promise<Modules | null> {
    try {
      return await this.moduleRepository.findOne({ 
        where: { name }
      });
    } catch (error) {
      this.logger.error(`Error al buscar módulo por nombre en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar módulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async countActiveCoursesByModule(moduleId: number): Promise<number> {
    try {
       const result = await this.moduleRepository
       .createQueryBuilder('module')
      .leftJoin('module.courses', 'course')
      .where('module.id = :moduleId', { moduleId })
      .andWhere('course.state_id = :stateId', { stateId: 2 })
      .getCount();
      
      return 0; // Por ahora retorna 0
    } catch (error) {
      this.logger.error(`Error al contar cursos del módulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar cursos del módulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async existsByName(name: string): Promise<boolean> {
    try {
      const count = await this.moduleRepository.count({ where: { name } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia del módulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar módulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async existsById(id: number): Promise<boolean> {
    try {
      const count = await this.moduleRepository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia del módulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar módulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}