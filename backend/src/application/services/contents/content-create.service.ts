import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ContentConsultDao } from '../../../domain/contents/dao/content-consult.dao';
import { ContentCreateDao } from '../../../domain/contents/dao/content-create.dao';
import { ChapterConsultDao } from '../../../domain/chapters/dao/chapter-consult.dao';
import { CreateContentDto,ContentResponseDto,} from '../../../domain/contents/dto/content.dto';
import { ChapterContent } from '../../../domain/contents/entity/content.entity';

@Injectable()
export class ContentCreateService {
  private readonly logger = new Logger(ContentCreateService.name);

  constructor(
    private readonly contentConsultDao: ContentConsultDao,
    private readonly ContentCreateDao: ContentCreateDao,
    private readonly chapterConsultDao: ChapterConsultDao
  ) {}

  /**
   * Crear un nuevo contenido
   */
  async create(createContentDto: CreateContentDto): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ContentResponseDto 
  }> {
    try {
      // Validar que el capítulo existe
      const chapterExists = await this.chapterConsultDao.existsById(createContentDto.chapterId);
      
      if (!chapterExists) {
        throw new HttpException(
          'El capítulo especificado no existe',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validar que el order_index no esté duplicado
      const orderExists = await this.contentConsultDao.existsByOrderIndex(
        createContentDto.chapterId, 
        createContentDto.orderIndex
      );
      
      if (orderExists) {
        throw new HttpException(
          `Ya existe un contenido con el orden ${createContentDto.orderIndex} en este capítulo`,
          HttpStatus.CONFLICT
        );
      }

      // Crear el contenido
      const content = await this.ContentCreateDao.create(createContentDto);

      return {
        success: true,
        message: 'Contenido creado exitosamente',
        data: this.mapToResponseDto(content!)
      };
    } catch (error) {
this.logger.error(`Error al crear contenido: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crear contenido con order_index automático (al final)
   */
  async createAutoOrdered(
    chapterId: number,
    contentTypeId: number,
    title: string | undefined,
    fileUrl: string,
    fileSizeMb?: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ContentResponseDto 
  }> {
    try {
      // Obtener el último order_index del capítulo
      const lastOrder = await this.contentConsultDao.getLastOrderIndexByChapterId(chapterId);
      
      const createDto: CreateContentDto = {
        chapterId,
        contentTypeId,
        title,
        fileUrl,
        fileSizeMb,
        orderIndex: lastOrder + 1
      };

      return await this.create(createDto);
    } catch (error) {
      this.logger.error(`Error al crear contenido con orden automático: ${error.message}`, error.stack);
      throw error;
    }
  }
  /**
   * Mapear a DTO de respuesta
   */
  private mapToResponseDto(content: ChapterContent): ContentResponseDto {
    return {
      id: content.id,
      title: content.title,
      fileUrl: content.fileUrl,
      fileSizeMb: content.fileSizeMb,
      orderIndex: content.orderIndex,
      contentType: {
        id: content.contentType.id,
        name: content.contentType.name
      },
      chapter: {
        id: content.chapter.id,
        title: content.chapter.title,
        courseId: content.chapter.courseId
      },
      createdAt: content.createdAt
    };
  }
}