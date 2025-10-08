import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/users.entity';

@Injectable()
export class UserDeleteDao {
  private readonly logger = new Logger(UserDeleteDao.name);
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async delete(email: string): Promise<boolean> {
    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('email = :email', { email })
        .execute();

      return (result.affected ?? 0)>0;
    } catch (error) {
      this.logger.error(`Error al eliminar usuario en BD: ${error.message}`, error.stack);
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}