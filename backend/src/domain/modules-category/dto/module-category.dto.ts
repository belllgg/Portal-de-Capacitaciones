import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

// DTO para crear un módulo (solo admin)
export class CreateModuleDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;
}

export class UpdateModuleDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;
}

// DTO de respuesta básico
export class ModuleResponseDto {
  id: number;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
}

// DTO de respuesta con conteo de cursos
export class ModuleWithStatsDto extends ModuleResponseDto {
  coursesCount: number;
  activeCoursesCount: number;
}

// DTO simplificado para listados
export class ModuleListItemDto {
  id: number;
  name: string;
  icon: string;
  coursesCount: number;
}