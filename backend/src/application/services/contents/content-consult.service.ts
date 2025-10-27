import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ContentConsultDao } from '../../../domain/contents/dao/content-consult.dao';
import { ContentResponseDto,ContentListItemDto,ContentStatsDto} from '../../../domain/contents/dto/content.dto';
import { ChapterContent } from '../../../domain/contents/entity/content.entity';

@Injectable()
export class ContentConsultService {
  private readonly logger = new Logger(ContentConsultService.name);

  private readonly contentTypeIcons = {
    'VIDEO': '🎥',
    'PDF': '📄',
    'PRESENTATION': '📊',
    'DOCUMENT': '📝',
    'LINK': '🔗'
  };

  constructor(
    private readonly contentConsultDao: ContentConsultDao
  ) {}


  async findByChapterId(chapterId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ContentListItemDto[] 
  }> {
    try {
      const contents = await this.contentConsultDao.findByChapterId(chapterId);

      return {
        success: true,
        message: 'Contenidos obtenidos exitosamente',
        data: contents.map(content => this.mapToListItemDto(content))
      };
    } catch (error) {
      this.logger.error(`Error al obtener contenidos del capítulo: ${error.message}`, error.stack);
      throw error;
    }
  }


  async findById(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ContentResponseDto 
  }> {
    try {
      const content = await this.contentConsultDao.findById(id);

      if (!content) {
        return {
          success: false,
          message: 'Contenido no encontrado'
        };
      }

      return {
        success: true,
        message: 'Contenido encontrado',
        data: this.mapToResponseDto(content)
      };
    } catch (error) {
      this.logger.error(`Error al buscar contenido: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByContentTypeId(contentTypeId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ContentListItemDto[] 
  }> {
    try {
      const contents = await this.contentConsultDao.findByContentTypeId(contentTypeId);

      return {
        success: true,
        message: 'Contenidos obtenidos por tipo',
        data: contents.map(content => this.mapToListItemDto(content))
      };
    } catch (error) {
      this.logger.error(`Error al obtener contenidos por tipo: ${error.message}`, error.stack);
      throw error;
    }
  }


  async findAllContentTypes(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: any[] 
  }> {
    try {
      const types = await this.contentConsultDao.findAllContentTypes();

      const typesWithIcons = types.map(type => ({
        id: type.id,
        name: type.name,
        icon: this.contentTypeIcons[type.name] || '📦'
      }));

      return {
        success: true,
        message: 'Tipos de contenido obtenidos',
        data: typesWithIcons
      };
    } catch (error) {
      this.logger.error(`Error al obtener tipos de contenido: ${error.message}`, error.stack);
      throw error;
    }
  }


  async getChapterContentStats(chapterId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ContentStatsDto 
  }> {
    try {
      const rawStats = await this.contentConsultDao.getChapterContentStats(chapterId);
      const totalContents = await this.contentConsultDao.countByChapterId(chapterId);
      const totalSize = await this.contentConsultDao.getTotalSizeByChapterId(chapterId);

      const stats: ContentStatsDto = {
        totalContents,
        videoCount: 0,
        pdfCount: 0,
        presentationCount: 0,
        documentCount: 0,
        linkCount: 0,
        totalSizeMb: parseFloat(totalSize.toFixed(2))
      };

      rawStats.forEach(stat => {
        const count = parseInt(stat.count);
        switch (parseInt(stat.contentTypeId)) {
          case 1: stats.videoCount = count; break;
          case 2: stats.pdfCount = count; break;
          case 3: stats.presentationCount = count; break;
          case 4: stats.documentCount = count; break;
          case 5: stats.linkCount = count; break;
        }
      });

      return {
        success: true,
        message: 'Estadísticas obtenidas',
        data: stats
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }


  async getCourseContentStats(courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: ContentStatsDto 
  }> {
    try {
      const rawStats = await this.contentConsultDao.getCourseContentStats(courseId);

      const stats: ContentStatsDto = {
        totalContents: 0,
        videoCount: 0,
        pdfCount: 0,
        presentationCount: 0,
        documentCount: 0,
        linkCount: 0,
        totalSizeMb: 0
      };

      rawStats.forEach(stat => {
        const count = parseInt(stat.count);
        const size = parseFloat(stat.totalSize || 0);
        
        stats.totalContents += count;
        stats.totalSizeMb += size;

        switch (parseInt(stat.contentTypeId)) {
          case 1: stats.videoCount = count; break;
          case 2: stats.pdfCount = count; break;
          case 3: stats.presentationCount = count; break;
          case 4: stats.documentCount = count; break;
          case 5: stats.linkCount = count; break;
        }
      });

      stats.totalSizeMb = parseFloat(stats.totalSizeMb.toFixed(2));

      return {
        success: true,
        message: 'Estadísticas del curso obtenidas',
        data: stats
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas del curso: ${error.message}`, error.stack);
      throw error;
    }
  }

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


  private mapToListItemDto(content: ChapterContent): ContentListItemDto {
    return {
      id: content.id,
      title: content.title,
      fileUrl: content.fileUrl,
      fileSizeMb: content.fileSizeMb,
      orderIndex: content.orderIndex,
      contentTypeName: content.contentType.name,
      contentTypeIcon: this.contentTypeIcons[content.contentType.name] || '📦'
    };
  }
}