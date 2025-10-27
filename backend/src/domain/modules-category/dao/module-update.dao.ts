import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modules } from '../entity/module-category.entity';
import { UpdateModuleDto } from '../dto/module-category.dto';

@Injectable()
export class ModuleUpdateDao {
  private readonly logger = new Logger(ModuleUpdateDao.name);

  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) {}



  async update(id: number, updateModuleDto: UpdateModuleDto): Promise<Modules | null> {
    try {
      const result = await this.moduleRepository.update(id, updateModuleDto);
      
      if (result.affected === 0) {
        return null;
      }
      
      return await this.moduleRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Error al actualizar módulo en BD: ${error.message}`, error.stack);
      
      if (error.code === '23505') {
        throw new HttpException(
          'Ya existe un módulo con ese nombre',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al actualizar módulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}