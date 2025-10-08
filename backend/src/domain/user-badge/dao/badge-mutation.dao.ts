import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeType,UserBadge } from '../entity/badge.entity';
import { CreateBadgeTypeDto, UpdateBadgeTypeDto } from '../dto/badge.dto';

@Injectable()
export class BadgeMutationDao {
  private readonly logger = new Logger(BadgeMutationDao.name);

  constructor(
    @InjectRepository(BadgeType)
    private readonly badgeTypeRepository: Repository<BadgeType>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
  ) {}

  // ==========================================
  // MUTACIONES DE BADGE TYPES
  // ==========================================

  /**
   * Crear un nuevo tipo de insignia
   */
  async createBadgeType(createBadgeTypeDto: CreateBadgeTypeDto): Promise<BadgeType> {
    try {
      const badgeType = this.badgeTypeRepository.create(createBadgeTypeDto);
      return await this.badgeTypeRepository.save(badgeType);
    } catch (error) {
      this.logger.error(`Error al crear tipo de insignia: ${error.message}`, error.stack);
      
      if (error.code === '23505') {
        throw new HttpException(
          'Ya existe un tipo de insignia con ese nombre',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al crear tipo de insignia',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Actualizar un tipo de insignia
   */
  async updateBadgeType(
    id: number, 
    updateBadgeTypeDto: UpdateBadgeTypeDto
  ): Promise<BadgeType | null> {
    try {
      const result = await this.badgeTypeRepository.update(id, updateBadgeTypeDto);
      
      if (result.affected === 0) {
        return null;
      }
      
      return await this.badgeTypeRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Error al actualizar tipo de insignia: ${error.message}`, error.stack);
      
      if (error.code === '23505') {
        throw new HttpException(
          'Ya existe un tipo de insignia con ese nombre',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al actualizar tipo de insignia',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Eliminar un tipo de insignia
   */
  async deleteBadgeType(id: number): Promise<boolean> {
    try {
      const result = await this.badgeTypeRepository.delete(id);
      return (result.affected??0) > 0;
    } catch (error) {
      this.logger.error(`Error al eliminar tipo de insignia: ${error.message}`, error.stack);
      
      if (error.code === '23503') {
        throw new HttpException(
          'No se puede eliminar porque hay insignias otorgadas de este tipo',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al eliminar tipo de insignia',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==========================================
  // MUTACIONES DE USER BADGES
  // ==========================================

  /**
   * Otorgar una insignia a un usuario
   */
  async awardBadge(
    userId: number, 
    badgeTypeId: number, 
    courseId?: number
  ): Promise<UserBadge> {
    try {
      const userBadge = this.userBadgeRepository.create({
        userId,
        badgeTypeId,
        courseId
      });
      
      return await this.userBadgeRepository.save(userBadge);
    } catch (error) {
      this.logger.error(`Error al otorgar insignia: ${error.message}`, error.stack);
      
      if (error.code === '23505') {
        throw new HttpException(
          'El usuario ya tiene esta insignia',
          HttpStatus.CONFLICT
        );
      }
      
      if (error.code === '23503') {
        throw new HttpException(
          'El usuario, tipo de insignia o curso no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al otorgar insignia',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Revocar una insignia de un usuario
   */
  async revokeBadge(userBadgeId: number): Promise<boolean> {
    try {
      const result = await this.userBadgeRepository.delete(userBadgeId);
      return (result.affected??0) > 0;
    } catch (error) {
      this.logger.error(`Error al revocar insignia: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al revocar insignia',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Revocar todas las insignias de un usuario
   */
  async revokeAllUserBadges(userId: number): Promise<boolean> {
    try {
      const result = await this.userBadgeRepository.delete({ userId });
      return (result.affected??0) > 0;
    } catch (error) {
      this.logger.error(`Error al revocar todas las insignias: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al revocar insignias',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}