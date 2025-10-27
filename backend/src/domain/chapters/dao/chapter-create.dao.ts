import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../entity/chapter.entity';
import { CreateChapterDto } from '../dto/chapter.dto';

@Injectable()
export class ChapterCreateDao {
  private readonly logger = new Logger(ChapterCreateDao.name);

  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

 
  async create(createChapterDto: CreateChapterDto): Promise<Chapter| null> {
    try {
      const chapter = this.chapterRepository.create(createChapterDto);
      const savedChapter = await this.chapterRepository.save(chapter);
      
      return await this.chapterRepository.findOne({
        where: { id: savedChapter.id },
        relations: ['state', 'course']
      });
    } catch (error) {
      this.logger.error(`Error al crear capítulo en BD: ${error.message}`, error.stack);
      
      if (error.code === '23503') {
        throw new HttpException(
          'El curso o estado especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al crear capítulo en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}