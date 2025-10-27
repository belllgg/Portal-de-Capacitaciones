import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modules } from '../entity/module-category.entity';
import { CreateModuleDto } from '../dto/module-category.dto';

@Injectable()
export class ModuleCreateDao {
  private readonly logger = new Logger(ModuleCreateDao.name);

  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) {}


  async create(createModuleDto: CreateModuleDto): Promise<Modules> {
    try {
      const module = this.moduleRepository.create(createModuleDto);
      return await this.moduleRepository.save(module);
    } catch (error) {
      this.logger.error(`Error al crear módulo en BD: ${error.message}`, error.stack);
      
      if (error.code === '23505') { // Código de PostgreSQL para violación de UNIQUE
        throw new HttpException(
          'Ya existe un módulo con ese nombre',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al crear módulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}