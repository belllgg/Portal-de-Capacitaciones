import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BadgeConsultDao } from '../../../domain/user-badge/dao/badge-consult.dao';
import { BadgeMutationDao } from '../../../domain/user-badge/dao/badge-mutation.dao';
import { CreateBadgeTypeDto,UpdateBadgeTypeDto,BadgeTypeResponseDto,UserBadgeDto} from '../../../domain/user-badge/dto/badge.dto';
import { BadgeType } from '../../../domain/user-badge/entity/badge.entity';

@Injectable()
export class BadgeMutationService {
  private readonly logger = new Logger(BadgeMutationService.name);

  constructor(
    private readonly badgeConsultDao: BadgeConsultDao,
    private readonly badgeMutationDao: BadgeMutationDao
  ) {}

  // ==========================================
  // GESTIÓN DE BADGE TYPES (ADMIN)
  // ==========================================

  /**
   * Crear un nuevo tipo de insignia (solo ADMIN)
   */
  async createBadgeType(createBadgeTypeDto: CreateBadgeTypeDto): Promise<{ 
    success: boolean; 
    message: string; 
    data?: BadgeTypeResponseDto 
  }> {
    try {
      // Validar que no exista ya
      const exists = await this.badgeConsultDao.existsBadgeTypeByName(createBadgeTypeDto.name);
      
      if (exists) {
        throw new HttpException(
          'Ya existe un tipo de insignia con ese nombre',
          HttpStatus.CONFLICT
        );
      }

      const badgeType = await this.badgeMutationDao.createBadgeType(createBadgeTypeDto);

      return {
        success: true,
        message: 'Tipo de insignia creado exitosamente',
        data: this.mapToBadgeTypeDto(badgeType)
      };
    } catch (error) {
      this.logger.error(`Error al crear tipo de insignia: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualizar un tipo de insignia (solo ADMIN)
   */
  async updateBadgeType(
    id: number, 
    updateBadgeTypeDto: UpdateBadgeTypeDto
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: BadgeTypeResponseDto 
  }> {
    try {
      const badgeType = await this.badgeMutationDao.updateBadgeType(id, updateBadgeTypeDto);

      if (!badgeType) {
        return {
          success: false,
          message: 'Tipo de insignia no encontrado'
        };
      }

      return {
        success: true,
        message: 'Tipo de insignia actualizado',
        data: this.mapToBadgeTypeDto(badgeType)
      };
    } catch (error) {
      this.logger.error(`Error al actualizar tipo de insignia: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Eliminar un tipo de insignia (solo ADMIN)
   */
  async deleteBadgeType(id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const deleted = await this.badgeMutationDao.deleteBadgeType(id);

      if (!deleted) {
        return {
          success: false,
          message: 'Tipo de insignia no encontrado'
        };
      }

      return {
        success: true,
        message: 'Tipo de insignia eliminado'
      };
    } catch (error) {
      this.logger.error(`Error al eliminar tipo de insignia: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ==========================================
  // OTORGAR Y REVOCAR INSIGNIAS
  // ==========================================

  /**
   * Otorgar una insignia a un usuario manualmente (solo ADMIN)
   */
  async awardBadgeManually(
    userId: number, 
    badgeTypeId: number, 
    courseId?: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data?: UserBadgeDto 
  }> {
    try {
      // Verificar si ya tiene la insignia
      const hasIt = await this.badgeConsultDao.userHasBadge(userId, badgeTypeId, courseId);
      
      if (hasIt) {
        return {
          success: false,
          message: 'El usuario ya tiene esta insignia'
        };
      }

      const userBadge = await this.badgeMutationDao.awardBadge(userId, badgeTypeId, courseId);

      return {
        success: true,
        message: 'Insignia otorgada exitosamente',
        data: {
          id: userBadge.id,
          badgeType: userBadge.badgeType,
          course: userBadge.course,
          earnedAt: userBadge.earnedAt
        }
      };
    } catch (error) {
      this.logger.error(`Error al otorgar insignia: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Revocar una insignia específica (solo ADMIN)
   */
  async revokeBadge(userBadgeId: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const revoked = await this.badgeMutationDao.revokeBadge(userBadgeId);

      if (!revoked) {
        return {
          success: false,
          message: 'Insignia no encontrada'
        };
      }

      return {
        success: true,
        message: 'Insignia revocada'
      };
    } catch (error) {
      this.logger.error(`Error al revocar insignia: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Revocar todas las insignias de un usuario (solo ADMIN)
   */
  async revokeAllUserBadges(userId: number): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      const revoked = await this.badgeMutationDao.revokeAllUserBadges(userId);

      if (!revoked) {
        return {
          success: false,
          message: 'El usuario no tiene insignias'
        };
      }

      return {
        success: true,
        message: 'Todas las insignias fueron revocadas'
      };
    } catch (error) {
      this.logger.error(`Error al revocar todas las insignias: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mapear BadgeType a DTO
   */
  private mapToBadgeTypeDto(badgeType: BadgeType): BadgeTypeResponseDto {
    return {
      id: badgeType.id,
      name: badgeType.name,
      description: badgeType.description,
      iconUrl: badgeType.iconUrl,
      criteria: badgeType.criteria
    };
  }
}