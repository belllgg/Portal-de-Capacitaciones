import { Controller, Get, Post, Put, Delete,Patch,Body, Param, Query,ParseIntPipe,HttpCode,HttpStatus,UseGuards} from '@nestjs/common';
import { ChapterConsultService } from '../../../../application/services/chapters/chapter-consult.service';
import { ChapterCreateService } from '../../../../application/services/chapters/chapter-create.service';
import { ChapterUpdateService } from '../../../../application/services/chapters/chapter-update.service';
import { ChapterDeleteService } from '../../../../application/services/chapters/chapter-delete.service';
import { CreateChapterDto, UpdateChapterDto,ChangeChapterStateDto,ReorderChaptersDto,ChapterResponseDto} from '../../../../domain/chapters/dto/chapter.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@ApiTags('Administracion de Contenido')
@Controller('api/chapters')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth')
@Controller('api/chapters')
export class ChaptersController {
  constructor(
    private readonly chapterConsultService: ChapterConsultService,
    private readonly ChapterCreateService: ChapterCreateService,
    private readonly ChapterUpdateService: ChapterUpdateService,
    private readonly ChapterDeleteService: ChapterDeleteService


  ) {}



  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo modulo' })
@ApiBody({
  type: CreateChapterDto,
  examples: {
    ejemplo1: {
      summary: 'Registro básico',
      value: {
        courseId: 1,
        title: 'Introducción a NestJS',
        description: 'Primer capítulo del curso de NestJS',
        orderIndex: 1,
        durationMinutes: 10,
        stateId: 1
      },
    },
    ejemplo2: {
      summary: 'Capítulo con descripción opcional omitida',
      value: {
        courseId: 1,
        title: 'Instalación de dependencias',
        orderIndex: 2,
        durationMinutes: 15,
        stateId: 2
      },
    },
  },
})

    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente', type: ChapterResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' }) 
    @ApiResponse({ status: 409, description: 'El email ya está registrado' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createChapterDto: CreateChapterDto) {
    return await this.ChapterCreateService.create(createChapterDto);
  }


  @Post('auto-ordered')

  @HttpCode(HttpStatus.CREATED)
  async createAutoOrdered(
    @Body() body: { 
      courseId: number; 
      title: string; 
      description?: string;
      durationMinutes?: number;
    }
  ) {
    return await this.ChapterCreateService.createAutoOrdered(
      body.courseId,
      body.title,
      body.description,
      body.durationMinutes
    );
  }

  @Get('course/:courseId')
  @HttpCode(HttpStatus.OK)
  async findByCourseId(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.chapterConsultService.findByCourseId(courseId);
  }


  @Get('course/:courseId/published')
  @HttpCode(HttpStatus.OK)
  async findPublishedByCourseId(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.chapterConsultService.findPublishedByCourseId(courseId);
  }

 
  @Get('course/:courseId/stats')
  @HttpCode(HttpStatus.OK)
  async getCourseChapterStats(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.chapterConsultService.getCourseChapterStats(courseId);
  }

  
  @Get('state/:stateId')
  @HttpCode(HttpStatus.OK)
  async findByStateId(@Param('stateId', ParseIntPipe) stateId: number) {
    return await this.chapterConsultService.findByStateId(stateId);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.chapterConsultService.findById(id);
  }


  @Put(':id')

  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChapterDto: UpdateChapterDto
  ) {
    return await this.ChapterUpdateService.update(id, updateChapterDto);
  }

 
  @Patch('course/:courseId/reorder')

  @HttpCode(HttpStatus.OK)
  async reorder(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() reorderDto: ReorderChaptersDto
  ) {
    return await this.ChapterUpdateService.reorder(courseId, reorderDto);
  }

  @Patch(':id/state')

  @HttpCode(HttpStatus.OK)
  async changeState(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStateDto: ChangeChapterStateDto
  ) {
    return await this.ChapterUpdateService.changeState(id, changeStateDto.stateId);
  }

 
  @Patch(':id/publish')

  @HttpCode(HttpStatus.OK)
  async publish(@Param('id', ParseIntPipe) id: number) {
    return await this.ChapterUpdateService.publish(id);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.ChapterDeleteService.softDelete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.ChapterDeleteService.delete(id);
  }
}