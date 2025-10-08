import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/users.entity';

@Injectable()
export class UserCreateDao {
  private readonly logger = new Logger(UserCreateDao.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

 async create(userData: Partial<User>): Promise<User> {
  try {
    const user = this.userRepository.create({
      ...userData,
      role: { id: userData.roleId },
      state: { id: userData.stateId },
    });
    return await this.userRepository.save(user);
  } catch (error) {
    this.logger.error(`Error al crear usuario en BD: ${error.message}`, error.stack);
    throw new HttpException(
      error.message,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}


  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.state', 'state')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOne();
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email en BD: ${error.message}`, error.stack);
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}