import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentType,ChapterContent } from '../entity/content.entity';

@Injectable()
export class ContentConsultDao {
  private readonly logger = new Logger(ContentConsultDao.name);

  constructor(
    @InjectRepository(ChapterContent)
    private readonly contentRepository: Repository<ChapterContent>,
    @InjectRepository(ContentType)
    private readonly contentTypeRepository: Repository<ContentType>,
  ) {}

  /**
   * Obtener todos los contenidos de un capítulo
   */
  async findByChapterId(chapterId: number): Promise<ChapterContent[]> {
    try {
      return await this.contentRepository.find({
        where: { chapterId },
        relations: ['contentType', 'chapter'],
        order: { orderIndex: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener contenidos por capítulo en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar contenidos en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar contenido por ID
   */
  async findById(id: number): Promise<ChapterContent | null> {
    try {
      return await this.contentRepository.findOne({ 
        where: { id },
        relations: ['contentType', 'chapter', 'chapter.course']
      });
    } catch (error) {
      this.logger.error(`Error al buscar contenido por ID en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar contenido en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Buscar contenidos por tipo
   */
  async findByContentTypeId(contentTypeId: number): Promise<ChapterContent[]> {
    try {
      return await this.contentRepository.find({
        where: { contentTypeId },
        relations: ['contentType', 'chapter'],
        order: { chapterId: 'ASC', orderIndex: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error al buscar contenidos por tipo en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar contenidos por tipo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener todos los tipos de contenido disponibles
   */
  async findAllContentTypes(): Promise<ContentType[]> {
    try {
      return await this.contentTypeRepository.find({
        order: { id: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener tipos de contenido en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar tipos de contenido',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verificar si existe un contenido por ID
   */
  async existsById(id: number): Promise<boolean> {
    try {
      const count = await this.contentRepository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia del contenido: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar contenido',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar contenidos de un capítulo
   */
  async countByChapterId(chapterId: number): Promise<number> {
    try {
      return await this.contentRepository.count({ 
        where: { chapterId } 
      });
    } catch (error) {
      this.logger.error(`Error al contar contenidos del capítulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar contenidos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener el último order_index de un capítulo
   */
  async getLastOrderIndexByChapterId(chapterId: number): Promise<number> {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .select('MAX(content.order_index)', 'maxOrder')
        .where('content.chapter_id = :chapterId', { chapterId })
        .getRawOne();
      
      return result?.maxOrder || 0;
    } catch (error) {
      this.logger.error(`Error al obtener último orden: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener último orden',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verificar si existe un contenido con ese order_index en el capítulo
   */
  async existsByOrderIndex(chapterId: number, orderIndex: number, excludeId?: number): Promise<boolean> {
    try {
      const query = this.contentRepository
        .createQueryBuilder('content')
        .where('content.chapter_id = :chapterId', { chapterId })
        .andWhere('content.order_index = :orderIndex', { orderIndex });
      
      if (excludeId) {
        query.andWhere('content.id != :excludeId', { excludeId });
      }
      
      const count = await query.getCount();
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar order_index: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar orden del contenido',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener estadísticas de contenidos de un capítulo
   */
  async getChapterContentStats(chapterId: number): Promise<any> {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .select('content.content_type_id', 'contentTypeId')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(content.file_size_mb)', 'totalSize')
        .where('content.chapter_id = :chapterId', { chapterId })
        .groupBy('content.content_type_id')
        .getRawMany();
      
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener estadísticas de contenidos de un curso completo
   */
  async getCourseContentStats(courseId: number): Promise<any> {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .innerJoin('content.chapter', 'chapter')
        .select('content.content_type_id', 'contentTypeId')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(content.file_size_mb)', 'totalSize')
        .where('chapter.course_id = :courseId', { courseId })
        .groupBy('content.content_type_id')
        .getRawMany();
      
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas del curso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener estadísticas del curso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Calcular tamaño total de contenidos de un capítulo
   */
  async getTotalSizeByChapterId(chapterId: number): Promise<number> {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .select('SUM(content.file_size_mb)', 'totalSize')
        .where('content.chapter_id = :chapterId', { chapterId })
        .getRawOne();
      
      return result?.totalSize || 0;
    } catch (error) {
      this.logger.error(`Error al calcular tamaño total: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al calcular tamaño',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}