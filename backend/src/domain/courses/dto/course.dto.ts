import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min,MaxLength,IsInt} from 'class-validator';

// ============================================
// DTOs para CREAR y ACTUALIZAR
// ============================================

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'El ID del módulo debe ser un número entero' })
  @IsNotEmpty({ message: 'El módulo es obligatorio' })
  moduleId: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  instructorName?: string;

  @IsUrl({}, { message: 'La URL de la miniatura debe ser válida' })
  @IsOptional()
  thumbnailUrl?: string;

  @IsNumber({}, { message: 'La duración debe ser un número' })
  @Min(0.1, { message: 'La duración debe ser mayor a 0' })
  @IsOptional()
  durationHours?: number;

  @IsInt()
  @IsOptional()
  stateId?: number; 
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  moduleId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  instructorName?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsNumber()
  @IsOptional()
  durationHours?: number;

  @IsInt()
  @IsOptional()
  stateId?: number;
}

// ============================================
// DTOs de RESPUESTA
// ============================================

export class CourseResponseDto {
  id: number;
  title: string;
  description: string;
  instructorName: string;
  thumbnailUrl: string;
  durationHours: number;
  module: {
    id: number;
    name: string;
    icon: string;
  };
  state: {
    id: number;
    name: string;
    description: string;
  };
  creator: {
    id: number;
    name: string;
    email: string;
  } | null;   
  createdAt: Date;
  updatedAt: Date;
}

export class CourseWithStatsDto extends CourseResponseDto {
  chaptersCount: number;
  publishedChaptersCount: number;
  totalMinutes: number;
}

export class CourseListItemDto {
  id: number;
  title: string;
  description: string;
  instructorName: string;
  thumbnailUrl: string;
  durationHours: number;
  moduleName: string;
  moduleIcon: string;
  stateName: string;
  chaptersCount?: number;
}

export class CourseSimpleDto {
  id: number;
  title: string;
  moduleName: string;
  stateName: string;
}

// DTO para cambiar solo el estado
export class ChangeStateDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del estado es obligatorio' })
  stateId: number;
}