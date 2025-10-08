import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/users.entity';

@Injectable()
export class UserUpdateDao {
  private readonly logger = new Logger(UserUpdateDao.name);
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async update(email: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const updateFields: any = { ...updateData };
      
      if (updateData.roleId) {
        updateFields.role = { id: updateData.roleId };
        delete updateFields.roleId;
      }
      
      if (updateData.stateId) {
        updateFields.state = { id: updateData.stateId };
        delete updateFields.stateId;
      }

      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set(updateFields)
        .where('email = :email', { email })
        .execute();

      if (result.affected === 0) {
        return null;
      }

      return await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.state', 'state')
        .where('user.email = :email', { email: updateData.email || email })
        .getOne();
    } catch (error) {
      this.logger.error(`Error al actualizar usuario en BD: ${error.message}`, error.stack);
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}