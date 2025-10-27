import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modules } from '../entity/module-category.entity';

@Injectable()
export class ModuleDeleteDao {
  private readonly logger = new Logger(ModuleDeleteDao.name);

  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) {}



  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.moduleRepository.delete(id);
      return (result.affected ?? 0)> 0;
    } catch (error) {
      this.logger.error(`Error al eliminar módulo en BD: ${error.message}`, error.stack);
      
      if (error.code === '23503') { // Código de violación de foreign key
        throw new HttpException(
          'No se puede eliminar el módulo porque tiene cursos asociados',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al eliminar módulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}