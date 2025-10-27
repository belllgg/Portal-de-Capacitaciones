import { Controller, Request,Get, Post, Delete,Patch,Body, Param, Query,ParseIntPipe,HttpCode,HttpStatus,UseGuards,Req} from '@nestjs/common';
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

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProgress(
  ) {
    const userId = 1; 
    return await this.progressConsultService.getUserProgressSummary(userId);
  }


  @Get('me/dashboard')
  @HttpCode(HttpStatus.OK)
  async getMyDashboard() {
    const userId = 1; 
    return await this.progressConsultService.getDashboardStats(userId);
  }


  @Get('me/courses/in-progress')
  @HttpCode(HttpStatus.OK)
  async getMyCoursesInProgress() {
    const userId = 1; 
    return await this.progressConsultService.getCoursesInProgress(userId);
  }


@Get('me/courses/completed/:userId')
@HttpCode(HttpStatus.OK)
async getMyCoursesCompleted(
  @Param('userId', ParseIntPipe) userId: number
) {
  return await this.progressConsultService.getCoursesCompleted(userId);
}


 @Get('me/course/:courseId')
@HttpCode(HttpStatus.OK)
async getMyCourseProgress(
  @Param('courseId', ParseIntPipe) courseId: number,
  @Req() req: any  
) {
  const userId = req.user.id;
  return await this.progressConsultService.getCourseProgressDetail(userId, courseId);
}


  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserProgress(@Param('userId', ParseIntPipe) userId: number) {
    return await this.progressConsultService.getUserProgressSummary(userId);
  }


  @Get('user/:userId/course/:courseId')

  @HttpCode(HttpStatus.OK)
  async getUserCourseProgress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number
  ) {
    return await this.progressConsultService.getCourseProgressDetail(userId, courseId);
  }


  @Get('course/:courseId/analytics')

  @HttpCode(HttpStatus.OK)
  async getCourseAnalytics(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.progressConsultService.getCourseAnalytics(courseId);
  }


  @Get('ranking')

  @HttpCode(HttpStatus.OK)
  async getUserRanking(@Query('limit', ParseIntPipe) limit: number = 10) {
    return await this.progressConsultService.getUserRanking(limit);
  }

  @Post('start-course')
@HttpCode(HttpStatus.CREATED)
@ApiBody({
  type: StartCourseDto,
  examples: {
    ejemplo1: {
      summary: 'Iniciar curso',
      value: {
        courseId: 1,
        userId: 1,
      },
    },
  },
})
@ApiResponse({ status: 201, description: 'Curso iniciado exitosamente', type: ChapterProgressDto })
@ApiResponse({ status: 400, description: 'Datos inválidos' })
@ApiResponse({ status: 401, description: 'No autorizado' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async startCourse(@Body() startCourseDto: StartCourseDto) {
  return await this.progressMutationService.startCourse(
    startCourseDto.userId,
    startCourseDto.courseId
  );
}


  @Post('complete-chapter')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
      type: CompleteChapterDto,
      examples: {
        ejemplo1: {
          summary: 'Marcar capitulo como completado',
          value: {
            chapterId: 1,
            userId: 1,

        },
        },
      },
    })
    @ApiResponse({ status: 201, description: 'Capitulo completado', type: ChapterProgressDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' }) 
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })  @HttpCode(HttpStatus.CREATED)
  async completeChapter(@Body() completeChapterDto: CompleteChapterDto) {
    return await this.progressMutationService.completeChapter(
     completeChapterDto.userId, 
      completeChapterDto.chapterId);
  }

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
  @Body('userId', ParseIntPipe) userId: number  
) {
  return await this.progressMutationService.uncompleteChapter(userId, chapterId);
}


  @Delete('course/:courseId/reset')
  @HttpCode(HttpStatus.OK)
  async resetCourseProgress(@Param('courseId', ParseIntPipe) courseId: number) {
    const userId = 1; 
    return await this.progressMutationService.resetCourseProgress(userId, courseId);
 
  }

  @Get('me/modules/completed/:userId')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Obtener módulos completados' })
@ApiResponse({ status: 200, description: 'Módulos completados obtenidos exitosamente' })
async getMyModulesCompleted(
  @Param('userId', ParseIntPipe) userId: number
) {
  return await this.progressConsultService.getModulesCompleted(userId);
}

@Get('me/modules/progress/:userId')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Obtener progreso de todos los módulos' })
@ApiResponse({ status: 200, description: 'Progreso de módulos obtenido exitosamente' })
async getMyModulesProgress(
  @Param('userId', ParseIntPipe) userId: number
) {
  return await this.progressConsultService.getModuleProgress(userId);
}
}