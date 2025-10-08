import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChapterContent } from '../entity/content.entity';

@Injectable()
export class ContentDeleteDao {
  private readonly logger = new Logger(ContentDeleteDao.name);

  constructor(
    @InjectRepository(ChapterContent)
    private readonly contentRepository: Repository<ChapterContent>,
  ) {}

  /**
   * Eliminar un contenido permanentemente
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.contentRepository.delete(id);
      return (result.affected ??0)> 0;
    } catch (error) {
      this.logger.error(`Error al eliminar contenido en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al eliminar contenido en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Eliminar todos los contenidos de un capítulo
   */
  async deleteByChapterId(chapterId: number): Promise<boolean> {
    try {
      const result = await this.contentRepository.delete({ chapterId });
      return (result.affected ??0)> 0;
    } catch (error) {
      this.logger.error(`Error al eliminar contenidos del capítulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al eliminar contenidos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}