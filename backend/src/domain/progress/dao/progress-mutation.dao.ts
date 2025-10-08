import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCourseProgress,UserChapterProgress } from '../entity/progress.entity';
import { strict } from 'assert';

@Injectable()
export class ProgressMutationDao {
  private readonly logger = new Logger(ProgressMutationDao.name);

  constructor(
    @InjectRepository(UserCourseProgress)
    private readonly courseProgressRepository: Repository<UserCourseProgress>,
    @InjectRepository(UserChapterProgress)
    private readonly chapterProgressRepository: Repository<UserChapterProgress>,
  ) {}

  // ==========================================
  // MUTACIONES DE PROGRESO DE CURSO
  // ==========================================

  /**
   * Iniciar un curso (crear registro de progreso)
   */
  async startCourse(userId: number, courseId: number): Promise<UserCourseProgress> {
    try {
      const progress = this.courseProgressRepository.create({
        userId,
        courseId,
        progressPercentage: 0
      });
      
      return await this.courseProgressRepository.save(progress);
    } catch (error) {
      this.logger.error(`Error al iniciar curso: ${error.message}`, error.stack);
      
      // Error de duplicado (ya inició el curso)
      if (error.code === '23505') {
        throw new HttpException(
          'El usuario ya inició este curso',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al iniciar curso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Actualizar porcentaje de progreso de un curso
   */
  async updateCourseProgress(
    userId: number, 
    courseId: number, 
    progressPercentage: number
  ): Promise<UserCourseProgress | null> {
    try {
      await this.courseProgressRepository.update(
        { userId, courseId },
        { progressPercentage }
      );
      
      return await this.courseProgressRepository.findOne({
        where: { userId, courseId },
        relations: ['course']
      });
    } catch (error) {
      this.logger.error(`Error al actualizar progreso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al actualizar progreso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Marcar un curso como completado
   */
  async completeCourse(userId: number, courseId: number): Promise<UserCourseProgress | null> {
    try {
      await this.courseProgressRepository.update(
        { userId, courseId },
        { 
          progressPercentage: 100,
          completedAt: new Date()
        }
      );
      
      return await this.courseProgressRepository.findOne({
        where: { userId, courseId },
        relations: ['course', 'course.module']
      });
    } catch (error) {
      this.logger.error(`Error al completar curso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al completar curso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==========================================
  // MUTACIONES DE PROGRESO DE CAPÍTULO
  // ==========================================

  /**
   * Marcar un capítulo como completado
   */
  async completeChapter(userId: number, chapterId: number): Promise<UserChapterProgress> {
    try {
      // Buscar si ya existe el registro
      let progress = await this.chapterProgressRepository.findOne({
        where: { userId, chapterId }
      });

      if (progress) {
        // Si ya existe, actualizar
        progress.completed = true;
        progress.completedAt = new Date();
        return await this.chapterProgressRepository.save(progress);
      } else {
        // Si no existe, crear nuevo
        progress = this.chapterProgressRepository.create({
          userId,
          chapterId,
          completed: true,
          completedAt: new Date()
        });
        return await this.chapterProgressRepository.save(progress);
      }
    } catch (error) {
      this.logger.error(`Error al completar capítulo: ${error.message}`, error.stack);
      
      if (error.code === '23503') {
        throw new HttpException(
          'El capítulo o usuario no existe',
          HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Error al completar capítulo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Desmarcar un capítulo como completado
   */
  async uncompleteChapter(userId: number, chapterId: number): Promise<UserChapterProgress | null> {
  try {
    // Primero verificar si existe el registro
    const existingProgress = await this.chapterProgressRepository.findOne({
      where: { userId, chapterId }
    });

    if (!existingProgress) {
      this.logger.warn(`No se encontró progreso para userId: ${userId}, chapterId: ${chapterId}`);
      throw new HttpException(
        'No se encontró el progreso del capítulo',
        HttpStatus.NOT_FOUND
      );
    }

    // Log antes de actualizar
    this.logger.log(`Desmarcando capítulo ${chapterId} para usuario ${userId}`);
    this.logger.log(`Estado antes: completed=${existingProgress.completed}`);

    // Actualizar
    const updateResult = await this.chapterProgressRepository.update(
      { userId, chapterId },
      { 
        completed: false,
        completedAt: null
      }
    );

    this.logger.log(`Filas afectadas: ${updateResult.affected}`);

    // Obtener el registro actualizado
    const updatedProgress = await this.chapterProgressRepository.findOne({
      where: { userId, chapterId }
    });

    this.logger.log(`Estado después: completed=${updatedProgress?.completed}`);

    return updatedProgress;
  } catch (error) {
    this.logger.error(`Error al desmarcar capítulo: ${error.message}`, error.stack);
    
    if (error instanceof HttpException) {
      throw error;
    }
    
    throw new HttpException(
      'Error al desmarcar capítulo',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

  /**
   * Eliminar progreso de un curso (por si el usuario quiere reiniciarlo)
   */
  async deleteCourseProgress(userId: number, courseId: number): Promise<boolean> {
    try {
      const result = await this.courseProgressRepository.delete({ userId, courseId });
      return (result.affected ??0)> 0;
    } catch (error) {
      this.logger.error(`Error al eliminar progreso: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al eliminar progreso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Eliminar progreso de un capítulo
   */
  async deleteChapterProgress(userId: number, chapterId: number): Promise<boolean> {
    try {
      const result = await this.chapterProgressRepository.delete({ userId, chapterId });
      return (result.affected ??0)> 0;
    } catch (error) {
      this.logger.error(`Error al eliminar progreso del capítulo: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al eliminar progreso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}