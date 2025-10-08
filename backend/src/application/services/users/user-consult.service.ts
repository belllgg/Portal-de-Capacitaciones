import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserConsultDao } from '../../../domain/users/dao/user-consult.dao';
import { CreateUserDto, UserResponseDto } from '../../../domain/users/dto/user.dto';
import { User } from '../../../domain/users/entity/users.entity';

@Injectable()
export class UserConsultService {
  private readonly logger = new Logger(UserConsultService.name);
 
  constructor(private readonly UserConsultDao: UserConsultDao) {}

  async findAll(): Promise<{ success: boolean; message: string; data?: UserResponseDto[] }> {
    try {
      const users = await this.UserConsultDao.findAll();
     
      return {
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: users.map(user => this.mapToResponseDto(user))
      };
    } catch (error) {
      this.logger.error(`Error al obtener usuarios: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: number): Promise<{ success: boolean; message: string; data?: UserResponseDto }> {
    try {
      const user = await this.UserConsultDao.findById(id);
     
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        message: 'Usuario encontrado',
        data: this.mapToResponseDto(user)
      };
    } catch (error) {
      this.logger.error(`Error al buscar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapToResponseDto(user: User): UserResponseDto {
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