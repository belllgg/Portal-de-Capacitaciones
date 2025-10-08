import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeType,UserBadge } from '../entity/badge.entity';

@Injectable()
export class BadgeConsultDao {
  private readonly logger = new Logger(BadgeConsultDao.name);

  constructor(
    @InjectRepository(BadgeType)
    private readonly badgeTypeRepository: Repository<BadgeType>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
  ) {}

  /**
   * Obtener todos los tipos de insignias
   */
  async findAllBadgeTypes(): Promise<BadgeType[]> {
    try {
      return await this.badgeTypeRepository.find({
        order: { id: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener tipos de insignias: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar tipos de insignias',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener un tipo de insignia por ID
   */
  async findBadgeTypeById(id: number): Promise<BadgeType | null> {
    try {
      return await this.badgeTypeRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Error al buscar tipo de insignia: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar tipo de insignia',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verificar si existe un tipo de insignia por nombre
   */
  async existsBadgeTypeByName(name: string): Promise<boolean> {
    try {
      const count = await this.badgeTypeRepository.count({ where: { name } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar tipo de insignia: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar tipo de insignia',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==========================================
  // CONSULTAS DE USER BADGES
  // ==========================================

  /**
   * Obtener todas las insignias de un usuario
   */
  async findUserBadges(userId: number): Promise<UserBadge[]> {
    try {
      return await this.userBadgeRepository.find({
        where: { userId },
        relations: ['badgeType', 'course', 'course.module'],
        order: { earnedAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener insignias del usuario: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al consultar insignias',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verificar si un usuario ya tiene una insignia específica
   */
  async userHasBadge(
    userId: number, 
    badgeTypeId: number, 
    courseId?: number
  ): Promise<boolean> {
    try {
      const where: any = { userId, badgeTypeId };
      
      if (courseId !== undefined) {
        where.courseId = courseId;
      }

      const count = await this.userBadgeRepository.count({ where });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar insignia del usuario: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al verificar insignia',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar insignias de un usuario
   */
  async countUserBadges(userId: number): Promise<number> {
    try {
      return await this.userBadgeRepository.count({ where: { userId } });
    } catch (error) {
      this.logger.error(`Error al contar insignias: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar insignias',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Contar insignias por tipo para un usuario
   */
  async countUserBadgesByType(userId: number): Promise<any[]> {
    try {
      return await this.userBadgeRepository
        .createQueryBuilder('badge')
        .innerJoin('badge.badgeType', 'type')
        .select('type.id', 'badgeTypeId')
        .addSelect('type.name', 'badgeTypeName')
        .addSelect('type.icon_url', 'iconUrl')
        .addSelect('COUNT(badge.id)', 'count')
        .where('badge.user_id = :userId', { userId })
        .groupBy('type.id')
        .addGroupBy('type.name')
        .addGroupBy('type.icon_url')
        .getRawMany();
    } catch (error) {
      this.logger.error(`Error al contar insignias por tipo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al contar insignias por tipo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener insignias recientes de un usuario
   */
  async findRecentUserBadges(userId: number, limit: number = 5): Promise<UserBadge[]> {
    try {
      return await this.userBadgeRepository.find({
        where: { userId },
        relations: ['badgeType', 'course'],
        order: { earnedAt: 'DESC' },
        take: limit
      });
    } catch (error) {
      this.logger.error(`Error al obtener insignias recientes: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener insignias recientes',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==========================================
  // ESTADÍSTICAS Y ANALYTICS
  // ==========================================

  /**
   * Obtener estadísticas de un tipo de insignia
   */
  async getBadgeTypeStats(badgeTypeId: number): Promise<any> {
    try {
      const result = await this.userBadgeRepository
        .createQueryBuilder('badge')
        .select('COUNT(badge.id)', 'totalAwarded')
        .addSelect('COUNT(DISTINCT badge.user_id)', 'uniqueUsers')
        .where('badge.badge_type_id = :badgeTypeId', { badgeTypeId })
        .getRawOne();
      
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas de insignia: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener ranking de usuarios por cantidad de insignias
   */
  async getBadgeRanking(limit: number = 10): Promise<any[]> {
    try {
      return await this.userBadgeRepository
        .createQueryBuilder('badge')
        .innerJoin('badge.user', 'user')
        .select('user.id', 'userId')
        .addSelect('user.name', 'userName')
        .addSelect('user.email', 'userEmail')
        .addSelect('COUNT(badge.id)', 'totalBadges')
        .groupBy('user.id')
        .addGroupBy('user.name')
        .addGroupBy('user.email')
        .orderBy('totalBadges', 'DESC')
        .limit(limit)
        .getRawMany();
    } catch (error) {
      this.logger.error(`Error al obtener ranking de insignias: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener ranking',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener todas las insignias otorgadas para un curso específico
   */
  async findBadgesByCourse(courseId: number): Promise<UserBadge[]> {
    try {
      return await this.userBadgeRepository.find({
        where: { courseId },
        relations: ['badgeType', 'user', 'course'],
        order: { earnedAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener insignias del curso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener insignias del curso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener usuarios que tienen una insignia específica
   */
  async findUsersWithBadge(badgeTypeId: number): Promise<UserBadge[]> {
    try {
      return await this.userBadgeRepository.find({
        where: { badgeTypeId },
        relations: ['user', 'badgeType', 'course'],
        order: { earnedAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener usuarios con insignia: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al obtener usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}