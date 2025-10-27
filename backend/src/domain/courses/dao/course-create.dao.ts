import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entity/course.entity';
import { CreateCourseDto } from '../dto/course.dto';

@Injectable()
export class CourseCreateDao {
  private readonly logger = new Logger(CourseCreateDao.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto, createdBy: number): Promise<Course> {
  try {
    const course = this.courseRepository.create({
      ...createCourseDto,
      createdBy,
    });

    const savedCourse = await this.courseRepository.save(course);

    const courseWithRelations = await this.courseRepository.findOne({
      where: { id: savedCourse.id },
      relations: ['module', 'state', 'creator'],
    });

    if (!courseWithRelations) {
      throw new HttpException(
        'Curso no encontrado después de guardar',
        HttpStatus.NOT_FOUND,
      );
    }

    return courseWithRelations;

  } catch (error) {
    this.logger.error(`Error al crear curso en BD: ${error.message}`, error.stack);

    if (error.code === '23503') {
      throw new HttpException(
        'Error de clave foránea, revisa los IDs relacionados',
        HttpStatus.BAD_REQUEST,
      );
    }

    throw new HttpException(
      'Error interno al crear curso',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}