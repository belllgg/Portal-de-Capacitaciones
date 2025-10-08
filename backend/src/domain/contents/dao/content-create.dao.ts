import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChapterContent } from '../entity/content.entity';
import { CreateContentDto } from '../dto/content.dto';

@Injectable()
export class ContentCreateDao {
  private readonly logger = new Logger(ContentCreateDao.name);

  constructor(
    @InjectRepository(ChapterContent)
    private readonly contentRepository: Repository<ChapterContent>,
  ) {}

  /**
   * Crear un nuevo contenido
   */
  async create(createContentDto: CreateContentDto): Promise<ChapterContent| null> {
    try {
      const content = this.contentRepository.create(createContentDto);
      const savedContent = await this.contentRepository.save(content);
      
      // Retornar con relaciones cargadas
      return await this.contentRepository.findOne({
        where: { id: savedContent.id },
        relations: ['contentType', 'chapter']
      });
    } catch (error) {
      this.logger.error(`Error al crear contenido en BD: ${error.message}`, error.stack);
      
      // Manejo de errores de foreign key
      if (error.code === '23503') {
        throw new HttpException(
          'El capítulo o tipo de contenido especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al crear contenido en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}