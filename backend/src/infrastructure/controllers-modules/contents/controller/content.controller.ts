import { Controller, Get, Post, Put, Delete,Patch,Body, Param, ParseIntPipe,HttpCode,HttpStatus,UseGuards} from '@nestjs/common';
import { ContentConsultService } from '../../../../application/services/contents/content-consult.service';
import { ContentCreateService } from '../../../../application/services/contents/content-create.service';
import { ContentUpdateService } from '../../../../application/services/contents/content-update.service';
import { ContentDeleteService } from '../../../../application/services/contents/content-delete.service';
import { CreateContentDto, UpdateContentDto,ReorderContentsDto,ContentResponseDto} from '../../../../domain/contents/dto/content.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Subir Contenido')
@Controller('api/contents')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth')
@Controller('api/contents')

export class ContentsController {
  constructor(
    private readonly contentConsultService: ContentConsultService,
    private readonly ContentCreateService: ContentCreateService,
    private readonly ContentUpdateService: ContentUpdateService,
    private readonly ContentDeleteService: ContentDeleteService

  ) {}

   /**
   * POST /api/contents
   * Crear un nuevo contenido (solo ADMIN)
   */

    @Post('create')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Crear un nuevo contenido' })
@ApiBody({
  type: CreateContentDto,
  examples: {
    ejemplo1: {
      summary: 'Registro básico de Video',
      value: {
        chapterId: 1,
        contentTypeId: 1, 
        title: 'Introducción a NestJS',
        fileUrl: 'https://mi-servidor.com/videos/nestjs-intro.mp4',
        orderIndex: 1
      },
    },
    ejemplo2: {
      summary: 'Registro de PDF',
      value: {
        chapterId: 1,
        contentTypeId: 2, 
        title: 'Guía NestJS',
        fileUrl: 'https://mi-servidor.com/docs/nestjs-guide.pdf',
        fileSizeMb: 2.5,
        orderIndex: 2
      },
    },
    ejemplo3: {
      summary: 'Registro de Link externo',
      value: {
        chapterId: 2,
        contentTypeId: 5, 
        title: 'Documentación oficial',
        fileUrl: 'https://docs.nestjs.com',
        orderIndex: 1
      },
    },
  },
})
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente', type: ContentResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' }) 
    @ApiResponse({ status: 409, description: 'El email ya está registrado' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContentDto: CreateContentDto) {
    return await this.ContentCreateService.create(createContentDto);
  }

  /**
   * POST /api/contents/auto-ordered
   * Crear un contenido con orden automático al final (solo ADMIN)
   */
 @Post('create/auto-ordered')
@HttpCode(HttpStatus.CREATED)
async createAutoOrdered(
  @Body() dto: CreateContentDto
) {
  return await this.ContentCreateService.createAutoOrdered(
    dto.chapterId,
    dto.contentTypeId,
    dto.title,
    dto.fileUrl,
    dto.fileSizeMb
  );
}

  /**
   * GET /api/contents/types
   * Obtener todos los tipos de contenido disponibles
   */
  @Get('types')
  @HttpCode(HttpStatus.OK)
  async findAllContentTypes() {
    return await this.contentConsultService.findAllContentTypes();
  }

  /**
   * GET /api/contents/chapter/:chapterId
   * Obtener todos los contenidos de un capítulo
   */
  @Get('chapter/:chapterId')
  @HttpCode(HttpStatus.OK)
  async findByChapterId(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return await this.contentConsultService.findByChapterId(chapterId);
  }

  /**
   * GET /api/contents/chapter/:chapterId/stats
   * Obtener estadísticas de contenidos de un capítulo
   */
  @Get('chapter/:chapterId/stats')
  @HttpCode(HttpStatus.OK)
  async getChapterContentStats(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return await this.contentConsultService.getChapterContentStats(chapterId);
  }

  /**
   * GET /api/contents/course/:courseId/stats
   * Obtener estadísticas de contenidos de un curso completo
   */
  @Get('course/:courseId/stats')
  @HttpCode(HttpStatus.OK)
  async getCourseContentStats(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.contentConsultService.getCourseContentStats(courseId);
  }

  /**
   * GET /api/contents/type/:contentTypeId
   * Obtener contenidos por tipo
   */
  @Get('type/:contentTypeId')
  @HttpCode(HttpStatus.OK)
  async findByContentTypeId(@Param('contentTypeId', ParseIntPipe) contentTypeId: number) {
    return await this.contentConsultService.findByContentTypeId(contentTypeId);
  }

  /**
   * GET /api/contents/:id
   * Obtener un contenido por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.contentConsultService.findById(id);
  }

 

  /**
   * PUT /api/contents/:id
   * Actualizar un contenido (solo ADMIN)
   */
  @Put(':id')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentDto: UpdateContentDto
  ) {
    return await this.ContentUpdateService.update(id, updateContentDto);
  }

  /**
   * PATCH /api/contents/chapter/:chapterId/reorder
   * Reordenar contenidos de un capítulo (solo ADMIN)
   */
  @Patch('chapter/:chapterId/reorder')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async reorder(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @Body() reorderDto: ReorderContentsDto
  ) {
    return await this.ContentUpdateService.reorder(chapterId, reorderDto);
  }

  /**
   * DELETE /api/contents/:id
   * Eliminar un contenido permanentemente (solo ADMIN)
   */
  @Delete(':id')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.ContentDeleteService.delete(id);
  }

  /**
   * DELETE /api/contents/chapter/:chapterId/all
   * Eliminar todos los contenidos de un capítulo (solo ADMIN)
   */
  @Delete('chapter/:chapterId/all')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async deleteByChapterId(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return await this.ContentDeleteService.deleteByChapterId(chapterId);
  }
}