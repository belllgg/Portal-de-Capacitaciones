
import { IsOptional, IsEmail, IsString, IsNumber, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El roleId debe ser un número' })
  roleId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El stateId debe ser un número' })
  stateId?: number;
}

export class UserUpdateResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}