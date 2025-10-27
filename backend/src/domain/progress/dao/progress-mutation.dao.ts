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


  async completeChapter(userId: number, chapterId: number): Promise<UserChapterProgress> {
    try {
      let progress = await this.chapterProgressRepository.findOne({
        where: { userId, chapterId }
      });

      if (progress) {
        progress.completed = true;
        progress.completedAt = new Date();
        return await this.chapterProgressRepository.save(progress);
      } else {
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


  async uncompleteChapter(userId: number, chapterId: number): Promise<UserChapterProgress | null> {
  try {
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

    this.logger.log(`Desmarcando capítulo ${chapterId} para usuario ${userId}`);
    this.logger.log(`Estado antes: completed=${existingProgress.completed}`);

    const updateResult = await this.chapterProgressRepository.update(
      { userId, chapterId },
      { 
        completed: false,
        completedAt: null
      }
    );

    this.logger.log(`Filas afectadas: ${updateResult.affected}`);

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