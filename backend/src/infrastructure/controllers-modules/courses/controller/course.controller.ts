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


  /**
   * GET /api/courses
   * Obtener todos los cursos
   */
  @Get('consult-all')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.courseConsultService.findAll();
  }

  /**
   * GET /api/courses/active
   * Obtener solo cursos activos
   */
  @Get('consult-active')
  @HttpCode(HttpStatus.OK)
  async findActiveOnly() {
    return await this.courseConsultService.findActiveOnly();
  }

  /**
   * GET /api/courses/search?text=react
   * Buscar cursos por texto
   */
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

  /**
   * GET /api/courses/state/:stateId
   * Obtener cursos por estado
   */
  @Get('state/:stateId')
  @HttpCode(HttpStatus.OK)
  async findByStateId(@Param('stateId', ParseIntPipe) stateId: number) {
    return await this.courseConsultService.findByStateId(stateId);
  }

  /**
   * GET /api/courses/module/:moduleId
   * Obtener cursos por módulo
   */
  @Get('module/:moduleId')
  @HttpCode(HttpStatus.OK)
  async findByModuleId(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return await this.courseConsultService.findByModuleId(moduleId);
  }

  /**
   * GET /api/courses/module/:moduleId/active
   * Obtener cursos ACTIVOS por módulo
   */
  @Get('module/:moduleId/active')
  @HttpCode(HttpStatus.OK)
  async findActiveByModuleId(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return await this.courseConsultService.findActiveByModuleId(moduleId);
  }

  /**
   * GET /api/courses/creator/:creatorId
   * Obtener cursos creados por un usuario
   */
  @Get('consult-creator/:creatorId')
  @HttpCode(HttpStatus.OK)
  async findByCreatorId(@Param('creatorId', ParseIntPipe) creatorId: number) {
    return await this.courseConsultService.findByCreatorId(creatorId);
  }

  /**
   * GET /api/courses/:id
   * Obtener un curso por ID
   */
  @Get('consult:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.courseConsultService.findById(id);
  }

  /**
   * PUT /api/courses/:id
   * Actualizar un curso (solo ADMIN o CREADOR)
   */
  @Put('update/:id')

  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto
  ) {
    return await this.CourseUpdateService.update(id, updateCourseDto);
  }

  /**
   * PATCH /api/courses/:id/state
   * Cambiar el estado de un curso
   */
  @Patch(':id/state')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async changeState(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStateDto: ChangeStateDto
  ) {
    return await this.CourseUpdateService.changeState(id, changeStateDto.stateId);
  }

  /**
   * PATCH /api/courses/:id/publish
   * Publicar un curso (DRAFT -> ACTIVE)
   */
  @Patch(':id/publish')
  
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id', ParseIntPipe) id: number) {
    return await this.CourseUpdateService.publish(id);
  }

  /**
   * PATCH /api/courses/:id/pause
   * Pausar un curso (ACTIVE -> INACTIVE)
   */
  @Patch(':id/pause')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async pause(@Param('id', ParseIntPipe) id: number) {
    return await this.CourseUpdateService.pause(id);
  }

  /**
   * DELETE /api/courses/:id/soft
   * Archivar un curso (soft delete)
   */
  @Delete('delete:id/soft')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.CourseDeleteService.softDelete(id);
  }

  /**
   * DELETE /api/courses/:id
   * Eliminar un curso permanentemente (solo ADMIN)
   */
  @Delete('delete:id')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.CourseDeleteService.delete(id);
  }
}