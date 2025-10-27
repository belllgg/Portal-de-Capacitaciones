import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entity/course.entity';

@Injectable()
export class CourseDeleteDao {
  private readonly logger = new Logger(CourseDeleteDao.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}


  async softDelete(id: number): Promise<Course | null> {
    try {
      await this.courseRepository.update(id, { stateId: 4 }); // 4 = ARCHIVED
      
      return await this.courseRepository.findOne({
        where: { id },
        relations: ['module', 'state']
      });
    } catch (error) {
      this.logger.error(`Error al archivar curso en BD: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al archivar curso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

 
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.courseRepository.delete(id);
      return (result.affected ??0)> 0;
    } catch (error) {
      this.logger.error(`Error al eliminar curso en BD: ${error.message}`, error.stack);
      
      if (error.code === '23503') {
        throw new HttpException(
          'No se puede eliminar el curso porque tiene capítulos asociados',
          HttpStatus.CONFLICT
        );
      }
      
      throw new HttpException(
        'Error al eliminar curso en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}