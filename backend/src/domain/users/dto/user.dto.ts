import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsOptional()
  @IsNumber({}, { message: 'El roleId debe ser un número' })
  roleId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El stateId debe ser un número' })
  stateId?: number;
}

export class UserResponseDto {
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

