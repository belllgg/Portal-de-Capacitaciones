import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BadgeConsultDao } from '../../../domain/user-badge/dao/badge-consult.dao';
import { BadgeTypeResponseDto,UserBadgeDto,UserBadgeSummaryDto,BadgeTypeWithStatsDto} from '../../../domain/user-badge/dto/badge.dto';
import { BadgeType ,UserBadge} from '../../../domain/user-badge/entity/badge.entity';

@Injectable()
export class BadgeConsultService {
  private readonly logger = new Logger(BadgeConsultService.name);

  constructor(
    private readonly badgeConsultDao: BadgeConsultDao
  ) {}

  /**
   * Obtener todos los tipos de insignias
   */
  async findAllBadgeTypes(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: BadgeTypeResponseDto[] 
  }> {
    try {
      const badgeTypes = await this.badgeConsultDao.findAllBadgeTypes();

      return {
        success: true,
        message: 'Tipos de insignias obtenidos',
        data: badgeTypes.map(type => this.mapToBadgeTypeDto(type))
      };
    } catch (error) {
      this.logger.error(`Error al obtener tipos de insignias: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener un tipo de insignia por ID
   */
  async findBadgeTypeById(id: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: BadgeTypeResponseDto 
  }> {
    try {
      const badgeType = await this.badgeConsultDao.findBadgeTypeById(id);

      if (!badgeType) {
        return {
          success: false,
          message: 'Tipo de insignia no encontrado'
        };
      }

      return {
        success: true,
        message: 'Tipo de insignia encontrado',
        data: this.mapToBadgeTypeDto(badgeType)
      };
    } catch (error) {
      this.logger.error(`Error al buscar tipo de insignia: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener todos los tipos de insignias con estadísticas
   */
  async findAllBadgeTypesWithStats(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: BadgeTypeWithStatsDto[] 
  }> {
    try {
      const badgeTypes = await this.badgeConsultDao.findAllBadgeTypes();

      const badgeTypesWithStats = await Promise.all(
        badgeTypes.map(async (type) => {
          const stats = await this.badgeConsultDao.getBadgeTypeStats(type.id);
          
          return {
            ...this.mapToBadgeTypeDto(type),
            totalAwarded: parseInt(stats.totalAwarded || 0),
            uniqueUsers: parseInt(stats.uniqueUsers || 0)
          };
        })
      );

      return {
        success: true,
        message: 'Tipos de insignias con estadísticas obtenidos',
        data: badgeTypesWithStats
      };
    } catch (error) {
      this.logger.error(`Error al obtener tipos con estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener todas las insignias de un usuario
   */
  async findUserBadges(userId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: UserBadgeSummaryDto 
  }> {
    try {
      const badges = await this.badgeConsultDao.findUserBadges(userId);
      const totalBadges = badges.length;
      const badgesByType = await this.badgeConsultDao.countUserBadgesByType(userId);

      const summary: UserBadgeSummaryDto = {
        userId,
        userName: badges[0]?.user?.name || 'Usuario',
        totalBadges,
        badges: badges.map(badge => this.mapToUserBadgeDto(badge)),
        badgesByType: badgesByType.map(type => ({
          badgeTypeName: type.badgeTypeName,
          count: parseInt(type.count),
          icon: type.iconUrl || '🏅'
        }))
      };

      return {
        success: true,
        message: 'Insignias del usuario obtenidas',
        data: summary
      };
    } catch (error) {
      this.logger.error(`Error al obtener insignias del usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener insignias recientes de un usuario
   */
  async findRecentUserBadges(userId: number, limit: number = 5): Promise<{ 
    success: boolean; 
    message: string; 
    data?: UserBadgeDto[] 
  }> {
    try {
      const badges = await this.badgeConsultDao.findRecentUserBadges(userId, limit);

      return {
        success: true,
        message: 'Insignias recientes obtenidas',
        data: badges.map(badge => this.mapToUserBadgeDto(badge))
      };
    } catch (error) {
      this.logger.error(`Error al obtener insignias recientes: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener ranking de usuarios por insignias
   */
  async getBadgeRanking(limit: number = 10): Promise<{ 
    success: boolean; 
    message: string; 
    data?: any[] 
  }> {
    try {
      const ranking = await this.badgeConsultDao.getBadgeRanking(limit);

      const rankingWithPosition = ranking.map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        totalBadges: parseInt(user.totalBadges)
      }));

      return {
        success: true,
        message: 'Ranking obtenido',
        data: rankingWithPosition
      };
    } catch (error) {
      this.logger.error(`Error al obtener ranking: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener insignias otorgadas para un curso
   */
  async findBadgesByCourse(courseId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: any[] 
  }> {
    try {
      const badges = await this.badgeConsultDao.findBadgesByCourse(courseId);

      const badgesData = badges.map(badge => ({
        id: badge.id,
        user: {
          id: badge.user.id,
          name: badge.user.name,
          email: badge.user.email
        },
        badgeType: {
          id: badge.badgeType.id,
          name: badge.badgeType.name,
          iconUrl: badge.badgeType.iconUrl
        },
        earnedAt: badge.earnedAt
      }));

      return {
        success: true,
        message: 'Insignias del curso obtenidas',
        data: badgesData
      };
    } catch (error) {
      this.logger.error(`Error al obtener insignias del curso: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener usuarios que tienen una insignia específica
   */
  async findUsersWithBadge(badgeTypeId: number): Promise<{ 
    success: boolean; 
    message: string; 
    data?: any[] 
  }> {
    try {
      const badges = await this.badgeConsultDao.findUsersWithBadge(badgeTypeId);

      const users = badges.map(badge => ({
        userId: badge.user.id,
        userName: badge.user.name,
        userEmail: badge.user.email,
        earnedAt: badge.earnedAt,
        courseTitle: badge.course?.title || null
      }));

      return {
        success: true,
        message: 'Usuarios con la insignia obtenidos',
        data: users
      };
    } catch (error) {
      this.logger.error(`Error al obtener usuarios con insignia: ${error.message}`, error.stack);
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

  /**
   * Mapear UserBadge a DTO
   */
  private mapToUserBadgeDto(userBadge: UserBadge): UserBadgeDto {
    return {
      id: userBadge.id,
      badgeType: {
        id: userBadge.badgeType.id,
        name: userBadge.badgeType.name,
        description: userBadge.badgeType.description,
        iconUrl: userBadge.badgeType.iconUrl
      },
      course: userBadge.course ? {
id: userBadge.course.id,
        title: userBadge.course.title,
        moduleName: userBadge.course.module?.name || ''
      } : undefined,
      earnedAt: userBadge.earnedAt
    };
  }
}