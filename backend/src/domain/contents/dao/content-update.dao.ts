import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChapterContent } from '../entity/content.entity';
import { UpdateContentDto } from '../dto/content.dto';

@Injectable()
export class ContentUpdateDao {
  private readonly logger = new Logger(ContentUpdateDao.name);

  constructor(
    @InjectRepository(ChapterContent)
    private readonly contentRepository: Repository<ChapterContent>,
  ) {}

  /**
   * Actualizar un contenido existente
   */
  async update(id: number, updateContentDto: UpdateContentDto): Promise<ChapterContent | null> {
    try {
      const result = await this.contentRepository.update(id, updateContentDto);
      
      if (result.affected === 0) {
        return null;
      }
      
      return await this.contentRepository.findOne({
        where: { id },
        relations: ['contentType', 'chapter']
      });
    } catch (error) {
      this.logger.error(`Error al actualizar contenido en BD: ${error.message}`, error.stack);
      
      // Manejo de errores de foreign key
      if (error.code === '23503') {
        throw new HttpException(
          'El tipo de contenido especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al actualizar contenido en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Actualizar el order_index de múltiples contenidos (para reordenar)
   */
  async updateOrderIndexes(updates: { id: number; orderIndex: number }[]): Promise<boolean> {
    try {
      // Usar transacción para actualizar todos a la vez
      await this.contentRepository.manager.transaction(async (manager) => {
        for (const update of updates) {
          await manager.update(ChapterContent, update.id, { orderIndex: update.orderIndex });
        }
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error al actualizar orden de contenidos: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al reordenar contenidos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}