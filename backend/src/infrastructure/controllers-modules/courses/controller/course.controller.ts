import { Controller, Get, Post, Put, Delete,Patch,Body, Param, Query,ParseIntPipe,HttpCode,HttpStatus,UseGuards,Req} from '@nestjs/common';
import { CourseConsultService } from '../../../../application/services/courses/course-consult.service';
import { CourseCreateService } from '../../../../application/services/courses/course-create.service';
import { CourseUpdateService } from '../../../../application/services/courses/course-update.service';
import { CourseDeleteService } from '../../../../application/services/courses/course-delete.service';
import { CreateCourseDto,ChangeStateDto,CourseResponseDto,UpdateCourseDto} from '../../../../domain/courses/dto/course.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@ApiTags('Administracion de Cursos')
@Controller('api/courses')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth')
@Controller('api/courses')
export class CoursesController {
  constructor(
    private readonly courseConsultService: CourseConsultService,
    private readonly CourseCreateService: CourseCreateService,
    private readonly CourseUpdateService: CourseUpdateService,
    private readonly CourseDeleteService: CourseDeleteService


  ) {}


   @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo modulo' })
 @ApiBody({
    type: CreateCourseDto,
    examples: {
      ejemplo1: {
        summary: 'Curso con todos los campos',
        description: 'Incluye descripción, instructor, miniatura y duración',
        value: {
          title: 'NestJS Avanzado',
          description: 'Curso completo sobre el framework NestJS',
          moduleId: 2,
          instructorName: 'Juan Pérez',
          thumbnailUrl: 'https://mi-servidor.com/img/nestjs.png',
          durationHours: 15.5,
          stateId: 1
      },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente', type: CourseResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' }) 
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCourseDto: CreateCourseDto) {
     const createdBy = 2;
    return await this.CourseCreateService.create(createCourseDto, createdBy);
  }

  @Get('consult-all')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.courseConsultService.findAll();
  }

  @Get('consult-active')
  @HttpCode(HttpStatus.OK)
  async findActiveOnly() {
    return await this.courseConsultService.findActiveOnly();
  }

 
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchByText(@Query('text') text: string) {
    if (!text || text.trim() === '') {
      return {
        success: false,
        message: 'Debe proporcionar un texto de búsqueda'
      };
    }
    return await this.courseConsultService.searchByText(text);
  }

 
  @Get('state/:stateId')
  @HttpCode(HttpStatus.OK)
  async findByStateId(@Param('stateId', ParseIntPipe) stateId: number) {
    return await this.courseConsultService.findByStateId(stateId);
  }


  @Get('module/:moduleId')
  @HttpCode(HttpStatus.OK)
  async findByModuleId(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return await this.courseConsultService.findByModuleId(moduleId);
  }


  @Get('module/:moduleId/active')
  @HttpCode(HttpStatus.OK)
  async findActiveByModuleId(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return await this.courseConsultService.findActiveByModuleId(moduleId);
  }

 
  @Get('consult-creator/:creatorId')
  @HttpCode(HttpStatus.OK)
  async findByCreatorId(@Param('creatorId', ParseIntPipe) creatorId: number) {
    return await this.courseConsultService.findByCreatorId(creatorId);
  }

  @Get('consult:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.courseConsultService.findById(id);
  }

  @Put('update/:id')

  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto
  ) {
    return await this.CourseUpdateService.update(id, updateCourseDto);
  }

  @Patch(':id/state')

  @HttpCode(HttpStatus.OK)
  async changeState(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStateDto: ChangeStateDto
  ) {
    return await this.CourseUpdateService.changeState(id, changeStateDto.stateId);
  }

  @Patch(':id/publish')
  
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id', ParseIntPipe) id: number) {
    return await this.CourseUpdateService.publish(id);
  }

  @Patch(':id/pause')

  @HttpCode(HttpStatus.OK)
  async pause(@Param('id', ParseIntPipe) id: number) {
    return await this.CourseUpdateService.pause(id);
  }

  @Delete('delete:id/soft')
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.CourseDeleteService.softDelete(id);
  }

  @Delete('delete:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.CourseDeleteService.delete(id);
  }
}