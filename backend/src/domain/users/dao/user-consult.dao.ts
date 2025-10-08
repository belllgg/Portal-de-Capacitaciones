import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/users.entity';

@Injectable()
export class UserConsultDao {
  private readonly logger = new Logger(UserConsultDao.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ 
        where: { id },
        relations: ['role', 'state']
      });
    } catch (error) {
      this.logger.error(`Error al buscar usuario por ID en BD: ${error.message}`, error.stack);
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        relations: ['role', 'state']
      });
    } catch (error) {
      this.logger.error(`Error al obtener todos los usuarios en BD: ${error.message}`, error.stack);
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}