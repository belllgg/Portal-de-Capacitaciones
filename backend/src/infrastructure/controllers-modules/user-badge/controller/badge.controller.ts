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

  @Get('types')
  @HttpCode(HttpStatus.OK)
  async findAllBadgeTypes() {
    return await this.badgeConsultService.findAllBadgeTypes();
  }

  @Get('types/stats')
  @HttpCode(HttpStatus.OK)
  async findAllBadgeTypesWithStats() {
    return await this.badgeConsultService.findAllBadgeTypesWithStats();
  }

  @Get('types/:id')
  @HttpCode(HttpStatus.OK)
  async findBadgeTypeById(@Param('id', ParseIntPipe) id: number) {
    return await this.badgeConsultService.findBadgeTypeById(id);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyBadges() {
    const userId = 1; 
    return await this.badgeConsultService.findUserBadges(userId);
  }

  @Get('me/recent')
  @HttpCode(HttpStatus.OK)
  async getMyRecentBadges(@Query('limit', ParseIntPipe) limit: number = 5) {
    const userId = 1; 
    return await this.badgeConsultService.findRecentUserBadges(userId, limit);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserBadges(@Param('userId', ParseIntPipe) userId: number) {
    return await this.badgeConsultService.findUserBadges(userId);
  }

  @Get('ranking')
  @HttpCode(HttpStatus.OK)
  async getBadgeRanking(@Query('limit', ParseIntPipe) limit: number = 10) {
    return await this.badgeConsultService.getBadgeRanking(limit);
  }

  @Get('course/:courseId')
  @HttpCode(HttpStatus.OK)
  async findBadgesByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.badgeConsultService.findBadgesByCourse(courseId);
  }

  @Get('type/:badgeTypeId/users')
  @HttpCode(HttpStatus.OK)
  async findUsersWithBadge(@Param('badgeTypeId', ParseIntPipe) badgeTypeId: number) {
    return await this.badgeConsultService.findUsersWithBadge(badgeTypeId);
  }

  @Put('types/:id')

  @HttpCode(HttpStatus.OK)
  async updateBadgeType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBadgeTypeDto: UpdateBadgeTypeDto
  ) {
    return await this.badgeMutationService.updateBadgeType(id, updateBadgeTypeDto);
  }

  @Delete('types/:id')

  @HttpCode(HttpStatus.OK)
  async deleteBadgeType(@Param('id', ParseIntPipe) id: number) {
    return await this.badgeMutationService.deleteBadgeType(id);
  }

  @Post('award')

  @HttpCode(HttpStatus.CREATED)
  async awardBadge(@Body() awardBadgeDto: AwardBadgeDto) {
    return await this.badgeMutationService.awardBadgeManually(
      awardBadgeDto.userId,
      awardBadgeDto.badgeTypeId,
      awardBadgeDto.courseId
    );
  }

  @Delete(':userBadgeId')
 
  @HttpCode(HttpStatus.OK)
  async revokeBadge(@Param('userBadgeId', ParseIntPipe) userBadgeId: number) {
    return await this.badgeMutationService.revokeBadge(userBadgeId);
  }

  @Delete('user/:userId/all')
  @HttpCode(HttpStatus.OK)
  async revokeAllUserBadges(@Param('userId', ParseIntPipe) userId: number) {
    return await this.badgeMutationService.revokeAllUserBadges(userId);
  }
}