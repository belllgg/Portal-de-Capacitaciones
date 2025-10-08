import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserCreateDao } from '../../../domain/users/dao/user-create.dao';

import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(4, { message: 'La contraseña es demasiado corta' })
  password: string;
}

export class LoginResponseDto {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    user: {
      id: number;
      email: string;
      name: string;
      role: {
        id: number;
        name: string;
      };
      state: {
        id: number;
        name: string;
      };
      isAdmin: boolean;
    };
  };
}

@Injectable()
export class UserLoginService {
  private readonly logger = new Logger(UserLoginService.name);

  constructor(
    private readonly userCreateDao: UserCreateDao,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const user = await this.userCreateDao.findByEmail(loginDto.email);
      
      if (!user) {
        this.logger.warn(`Intento de login fallido: usuario no encontrado (${loginDto.email})`);
        return {
          success: false,
          message: 'Email o contraseña incorrectos'
        };
      }

      if (user.state.id !== 1) {
        this.logger.warn(`Intento de login con usuario inactivo: ${loginDto.email}`);
        return {
          success: false,
          message: 'Usuario inactivo. Contacte al administrador.'
        };
      }
console.log('JWT_SECRET:', this.jwtService['options'].secret);

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      
      if (!isPasswordValid) {
        this.logger.warn(`Intento de login fallido: contraseña incorrecta (${loginDto.email})`);
        return {
          success: false,
          message: 'Email o contraseña incorrectos'
        };
      }

      const payload = {
        email: user.email,
        sub: user.id,
        roleId: user.role.id,
        roleName: user.role.name
      };
      console.log('JWT_SECRET:', this.jwtService['options'].secret);

      const access_token = this.jwtService.sign(payload);

      const isAdmin = user.role.id === 1 || user.role.name.toLowerCase() === 'admin';

      this.logger.log(`Login exitoso: ${user.email} (${user.role.name})`);

      return {
        success: true,
        message: 'Login exitoso',
        data: {
          access_token,
          user: {
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
            isAdmin
          }
        }
      };

    } catch (error) {
      this.logger.error(`Error en login: ${error.message}`, error.stack);
      throw new HttpException(
        'Error al procesar el login',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userCreateDao.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }
}