import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserCreateDao } from '../../../domain/users/dao/user-create.dao';
import { CreateUserDto, UserResponseDto } from '../../../domain/users/dto/user.dto';
import { User } from '../../../domain/users/entity/users.entity';

@Injectable()
export class UserCreateService {
  private readonly logger = new Logger(UserCreateService.name);
 
  constructor(private readonly UserCreateDao: UserCreateDao) {}

  async register(createUserDto: CreateUserDto): Promise<{ success: boolean; message: string; data?: UserResponseDto }> {
    try {
      const existingUser = await this.UserCreateDao.findByEmail(createUserDto.email);
      if (existingUser) {
        return {
          success: false,
          message: 'El email ya está registrado'
        };
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
     
      const user = await this.UserCreateDao.create({
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        roleId: createUserDto.roleId || 2,
        stateId: createUserDto.stateId || 1,
      });

      this.logger.log(`Usuario registrado exitosamente: ${user.email}`);
     
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: this.mapToResponseDto(user)
      };
    } catch (error) {
      this.logger.error(`Error al registrar usuario: ${error.message}`, error.stack);
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