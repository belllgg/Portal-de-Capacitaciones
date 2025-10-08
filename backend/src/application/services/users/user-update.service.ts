import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserUpdateDao } from '../../../domain/users/dao/user-update.dao';
import { UpdateUserDto, UserUpdateResponseDto } from '../../../domain/users/dto/user-update.dto';
import { User } from '../../../domain/users/entity/users.entity';

@Injectable()
export class UserUpdateService {
  private readonly logger = new Logger(UserUpdateService.name);
 
  constructor(private readonly userUpdateDao: UserUpdateDao) {}

  async updateByEmail(
    email: string, 
    updateUserDto: UpdateUserDto
  ): Promise<{ success: boolean; message: string; data?: UserUpdateResponseDto }> {
    try {
      const updateData: Partial<User> = {};

      if (updateUserDto.email) updateData.email = updateUserDto.email;
      if (updateUserDto.name) updateData.name = updateUserDto.name;
      if (updateUserDto.roleId) updateData.roleId = updateUserDto.roleId;
      if (updateUserDto.stateId) updateData.stateId = updateUserDto.stateId;
      
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.userUpdateDao.update(email, updateData);

      if (!updatedUser) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      this.logger.log(`Usuario actualizado exitosamente: ${email}`);
     
      return {
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: this.mapToResponseDto(updatedUser)
      };
    } catch (error) {
      this.logger.error(`Error al actualizar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapToResponseDto(user: User): UserUpdateResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      state: {
        id: user.state.id,
        name: user.state.name,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
