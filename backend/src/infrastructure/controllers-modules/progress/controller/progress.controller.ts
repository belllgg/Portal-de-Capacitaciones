import { Controller, Get, Post, Delete,Patch,Body, Param, Query,ParseIntPipe,HttpCode,HttpStatus,UseGuards,Req} from '@nestjs/common';
import { ProgressConsultService } from '../../../../application/services/progress/progress-consult.service';
import { ProgressMutationService } from '../../../../application/services/progress/progress-mutation.service';
import { CompleteChapterDto, StartCourseDto,ChapterProgressDto } from '../../../../domain/progress/dto/progress.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@ApiTags('Progreso de Cursos')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth')
@Controller('api/progress')
export class ProgressController {
  constructor(
    private readonly progressConsultService: ProgressConsultService,
    private readonly progressMutationService: ProgressMutationService
  ) {}

  // ==========================================
  // ENDPOINTS DE CONSULTA
  // ==========================================

  /**
   * GET /api/progress/me
   * Obtener resumen completo de progreso del usuario autenticado
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProgress(
    // @Req() req: any // Descomentar cuando tengas auth
  ) {
    const userId = 1; // TODO: Obtener de req.user.id cuando tengas auth
    return await this.progressConsultService.getUserProgressSummary(userId);
  }

  /**
   * GET /api/progress/me/dashboard
   * Obtener estadísticas para el dashboard del usuario
   */
  @Get('me/dashboard')
  @HttpCode(HttpStatus.OK)
  async getMyDashboard() {
    const userId = 1; // TODO: Obtener de req.user.id
    return await this.progressConsultService.getDashboardStats(userId);
  }

  /**
   * GET /api/progress/me/courses/in-progress
   * Obtener cursos en progreso del usuario
   */
  @Get('me/courses/in-progress')
  @HttpCode(HttpStatus.OK)
  async getMyCoursesInProgress() {
    const userId = 1; // TODO: Obtener de req.user.id
    return await this.progressConsultService.getCoursesInProgress(userId);
  }

  /**
   * GET /api/progress/me/courses/completed
   * Obtener historial de cursos completados
   */
@Get('me/courses/completed/:userId')
@HttpCode(HttpStatus.OK)
async getMyCoursesCompleted(
  @Param('userId', ParseIntPipe) userId: number
) {
  return await this.progressConsultService.getCoursesCompleted(userId);
}


  /**
   * GET /api/progress/me/course/:courseId
   * Obtener progreso detallado de un curso específico
   */
  @Get('me/course/:courseId')
  @HttpCode(HttpStatus.OK)
  async getMyCourseProgress(@Param('courseId', ParseIntPipe) courseId: number) {
    const userId = 1; // TODO: Obtener de req.user.id
    return await this.progressConsultService.getCourseProgressDetail(userId, courseId);
  }

  /**
   * GET /api/progress/user/:userId
   * Obtener progreso de un usuario específico (solo ADMIN)
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserProgress(@Param('userId', ParseIntPipe) userId: number) {
    return await this.progressConsultService.getUserProgressSummary(userId);
  }

  /**
   * GET /api/progress/user/:userId/course/:courseId
   * Obtener progreso de un usuario en un curso (solo ADMIN)
   */
  @Get('user/:userId/course/:courseId')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async getUserCourseProgress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number
  ) {
    return await this.progressConsultService.getCourseProgressDetail(userId, courseId);
  }

  /**
   * GET /api/progress/course/:courseId/analytics
   * Obtener analytics de un curso (solo ADMIN)
   */
  @Get('course/:courseId/analytics')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async getCourseAnalytics(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.progressConsultService.getCourseAnalytics(courseId);
  }

  /**
   * GET /api/progress/ranking
   * Obtener ranking de usuarios (solo ADMIN)
   */
  @Get('ranking')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async getUserRanking(@Query('limit', ParseIntPipe) limit: number = 10) {
    return await this.progressConsultService.getUserRanking(limit);
  }

  // ==========================================
  // ENDPOINTS DE MUTACIÓN
  // ==========================================

  /**
   * POST /api/progress/start-course
   * Iniciar un curso
   */
  @Post('start-course')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    type: StartCourseDto,
    examples: {
      ejemplo1: {
        summary: 'Iniciar curso',
        value: {
          courseId: 1,
      },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Curso iniciado exitosamente', type: ChapterProgressDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' }) 
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })  @HttpCode(HttpStatus.CREATED)
  async startCourse(@Body() startCourseDto: StartCourseDto) {
    const userId = 2; 
    return await this.progressMutationService.startCourse(userId, startCourseDto.courseId);
  }

  /**
   * POST /api/progress/complete-chapter
   * Marcar un capítulo como completado
   */
  @Post('complete-chapter')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
      type: CompleteChapterDto,
      examples: {
        ejemplo1: {
          summary: 'Marcar capitulo como completado',
          value: {
            chapterId: 1,
        },
        },
      },
    })
    @ApiResponse({ status: 201, description: 'Capitulo completado', type: ChapterProgressDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' }) 
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })  @HttpCode(HttpStatus.CREATED)
  async completeChapter(@Body() completeChapterDto: CompleteChapterDto) {
    const userId = 2; 
    return await this.progressMutationService.completeChapter(userId, completeChapterDto.chapterId);
  }

  /**
   * PATCH /api/progress/uncomplete-chapter/:chapterId
   * Desmarcar un capítulo como completado
   */
@Patch('uncomplete-chapter/:chapterId')
@HttpCode(HttpStatus.OK)
@ApiBody({
  type: CompleteChapterDto,
  examples: {
    ejemplo1: {
      summary: 'Desmarcar capítulo como completado',
      value: {
        userId: 1,
      },
    },
  },
})
async uncompleteChapter(
  @Param('chapterId', ParseIntPipe) chapterId: number,
  @Body('userId', ParseIntPipe) userId: number  // ← Recibe del body
) {
  return await this.progressMutationService.uncompleteChapter(userId, chapterId);
}

  /**
   * DELETE /api/progress/course/:courseId/reset
   * Reiniciar progreso de un curso
   */
  @Delete('course/:courseId/reset')
  @HttpCode(HttpStatus.OK)
  async resetCourseProgress(@Param('courseId', ParseIntPipe) courseId: number) {
    const userId = 1; 
    return await this.progressMutationService.resetCourseProgress(userId, courseId);
  }
}