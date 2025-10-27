import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../entity/chapter.entity';
import { UpdateChapterDto } from '../dto/chapter.dto';

@Injectable()
export class ChapterUpdateDao {
  private readonly logger = new Logger(ChapterUpdateDao.name);

  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}


  async update(id: number, updateChapterDto: UpdateChapterDto): Promise<Chapter | null> {
    try {
      const result = await this.chapterRepository.update(id, updateChapterDto);
      
      if (result.affected === 0) {
        return null;
      }
      
      return await this.chapterRepository.findOne({
        where: { id },
        relations: ['state', 'course']
      });
    } catch (error) {
      this.logger.error(`Error al actualizar capítulo en BD: ${error.message}`, error.stack);
      
      if (error.code === '23503') {
        throw new HttpException(
          'El estado especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al actualizar capítulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }



  async changeState(id: number, stateId: number): Promise<Chapter | null> {
    try {
      await this.chapterRepository.update(id, { stateId });
      
      return await this.chapterRepository.findOne({
        where: { id },
        relations: ['state', 'course']
      });
    } catch (error) {
      this.logger.error(`Error al cambiar estado del capítulo en BD: ${error.message}`, error.stack);
      
      if (error.code === '23503') {
        throw new HttpException(
          'El estado especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al cambiar estado del capítulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async updateOrderIndexes(updates: { id: number; orderIndex: number }[]): Promise<boolean> {
    try {
      await this.chapterRepository.manager.transaction(async (manager) => {
        for (const update of updates) {
          await manager.update(Chapter, update.id, { orderIndex: update.orderIndex });
        }
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error al actualizar orden de capítulos: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al reordenar capítulos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}