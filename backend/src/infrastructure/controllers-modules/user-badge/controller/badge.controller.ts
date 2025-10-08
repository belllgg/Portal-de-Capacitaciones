import { Controller, Get, Post, Put, Delete,Body, Param, Query,ParseIntPipe,HttpCode,HttpStatus,UseGuards} from '@nestjs/common';
import { BadgeConsultService } from '../../../../application/services/user-badge/badge-consult.service';
import { BadgeMutationService } from '../../../../application/services/user-badge/badge-mutation.service';
import { CreateBadgeTypeDto, UpdateBadgeTypeDto,AwardBadgeDto,BadgeTypeResponseDto} from '../../../../domain/user-badge/dto/badge.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@ApiTags('Administraccion de Insignias')
@Controller('api/badges')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth')
@Controller('api/badges')
export class BadgesController {
  constructor(
    private readonly badgeConsultService: BadgeConsultService,
    private readonly badgeMutationService: BadgeMutationService
  ) {}

@Post('create-types')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear' })
    @ApiBody({
        type: CreateBadgeTypeDto,
        examples: {
          ejemplo1: {
            summary: 'Actualizar modulo',
            value: {
              name: 'nuevo',
              description: 'nuevo',
              iconUrl: 'https://miicono.com/icon.png',
              criteria: 'nuevo',

            },
          },
        },
      })
      @ApiResponse({ status: 200, description: 'Modulo actualizado exitosamente', type: BadgeTypeResponseDto })
      @ApiResponse({ status: 400, description: 'Datos inválidos' })
      @ApiResponse({ status: 401, description: 'No autorizado' })
      @ApiResponse({ status: 404, description: 'Moduylo no encontrado' })
      @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async createBadgeType(@Body() createBadgeTypeDto: CreateBadgeTypeDto) {
    return await this.badgeMutationService.createBadgeType(createBadgeTypeDto);
  }
  // ==========================================
  // ENDPOINTS DE CONSULTA
  // ==========================================

  /**
   * GET /api/badges/types
   * Obtener todos los tipos de insignias
   */
  @Get('types')
  @HttpCode(HttpStatus.OK)
  async findAllBadgeTypes() {
    return await this.badgeConsultService.findAllBadgeTypes();
  }

  /**
   * GET /api/badges/types/stats
   * Obtener tipos de insignias con estadísticas
   */
  @Get('types/stats')
  @HttpCode(HttpStatus.OK)
  async findAllBadgeTypesWithStats() {
    return await this.badgeConsultService.findAllBadgeTypesWithStats();
  }

  /**
   * GET /api/badges/types/:id
   * Obtener un tipo de insignia por ID
   */
  @Get('types/:id')
  @HttpCode(HttpStatus.OK)
  async findBadgeTypeById(@Param('id', ParseIntPipe) id: number) {
    return await this.badgeConsultService.findBadgeTypeById(id);
  }

  /**
   * GET /api/badges/me
   * Obtener mis insignias
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyBadges() {
    const userId = 1; // TODO: Obtener de req.user.id
    return await this.badgeConsultService.findUserBadges(userId);
  }

  /**
   * GET /api/badges/me/recent
   * Obtener mis insignias recientes
   */
  @Get('me/recent')
  @HttpCode(HttpStatus.OK)
  async getMyRecentBadges(@Query('limit', ParseIntPipe) limit: number = 5) {
    const userId = 1; // TODO: Obtener de req.user.id
    return await this.badgeConsultService.findRecentUserBadges(userId, limit);
  }

  /**
   * GET /api/badges/user/:userId
   * Obtener insignias de un usuario específico
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserBadges(@Param('userId', ParseIntPipe) userId: number) {
    return await this.badgeConsultService.findUserBadges(userId);
  }

  /**
   * GET /api/badges/ranking
   * Obtener ranking de usuarios por insignias
   */
  @Get('ranking')
  @HttpCode(HttpStatus.OK)
  async getBadgeRanking(@Query('limit', ParseIntPipe) limit: number = 10) {
    return await this.badgeConsultService.getBadgeRanking(limit);
  }

  /**
   * GET /api/badges/course/:courseId
   * Obtener insignias otorgadas para un curso
   */
  @Get('course/:courseId')
  @HttpCode(HttpStatus.OK)
  async findBadgesByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.badgeConsultService.findBadgesByCourse(courseId);
  }

  /**
   * GET /api/badges/type/:badgeTypeId/users
   * Obtener usuarios que tienen una insignia específica
   */
  @Get('type/:badgeTypeId/users')
  @HttpCode(HttpStatus.OK)
  async findUsersWithBadge(@Param('badgeTypeId', ParseIntPipe) badgeTypeId: number) {
    return await this.badgeConsultService.findUsersWithBadge(badgeTypeId);
  }

  // ==========================================
  // ENDPOINTS DE MUTACIÓN (ADMIN)
  // ==========================================

  /**
   * PUT /api/badges/types/:id
   * Actualizar un tipo de insignia (solo ADMIN)
   */
  @Put('types/:id')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async updateBadgeType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBadgeTypeDto: UpdateBadgeTypeDto
  ) {
    return await this.badgeMutationService.updateBadgeType(id, updateBadgeTypeDto);
  }

  /**
   * DELETE /api/badges/types/:id
   * Eliminar un tipo de insignia (solo ADMIN)
   */
  @Delete('types/:id')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async deleteBadgeType(@Param('id', ParseIntPipe) id: number) {
    return await this.badgeMutationService.deleteBadgeType(id);
  }

  /**
   * POST /api/badges/award
   * Otorgar una insignia manualmente (solo ADMIN)
   */
  @Post('award')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async awardBadge(@Body() awardBadgeDto: AwardBadgeDto) {
    return await this.badgeMutationService.awardBadgeManually(
      awardBadgeDto.userId,
      awardBadgeDto.badgeTypeId,
      awardBadgeDto.courseId
    );
  }

  /**
   * DELETE /api/badges/:userBadgeId
   * Revocar una insignia específica (solo ADMIN)
   */
  @Delete(':userBadgeId')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async revokeBadge(@Param('userBadgeId', ParseIntPipe) userBadgeId: number) {
    return await this.badgeMutationService.revokeBadge(userBadgeId);
  }

  /**
   * DELETE /api/badges/user/:userId/all
   * Revocar todas las insignias de un usuario (solo ADMIN)
   */
  @Delete('user/:userId/all')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async revokeAllUserBadges(@Param('userId', ParseIntPipe) userId: number) {
    return await this.badgeMutationService.revokeAllUserBadges(userId);
  }
}