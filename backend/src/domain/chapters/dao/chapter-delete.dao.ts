import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../entity/chapter.entity';

@Injectable()
export class ChapterDeleteDao {
  private readonly logger = new Logger(ChapterDeleteDao.name);

  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}



  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.chapterRepository.delete(id);
      return (result.affected ??0)> 0;
    } catch (error) {
      this.logger.error(`Error al eliminar capítulo en BD: ${error.message}`, error.stack);
      
      if (error.code === '23503') {
        throw new HttpException(
          'No se puede eliminar el capítulo porque tiene contenidos asociados',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al eliminar capítulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async softDelete(id: number): Promise<Chapter | null> {
    try {
      await this.chapterRepository.update(id, { stateId: 3 }); // 3 = ARCHIVED
      
      return await this.chapterRepository.findOne({
        where: { id },
        relations: ['state']
      });
    } catch (error) {
      this.logger.error(`Error al archivar capítulo en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al archivar capítulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}