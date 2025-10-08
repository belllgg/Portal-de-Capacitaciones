import { IsString, IsNotEmpty, IsNumber, IsOptional, Min,MaxLength,IsInt} from 'class-validator';

// ============================================
// DTOs para CREAR y ACTUALIZAR
// ============================================

export class CreateChapterDto {
  @IsInt({ message: 'El ID del curso debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del curso es obligatorio' })
  courseId: number;

  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El orden es obligatorio' })
  orderIndex: number;

  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración debe ser mayor a 0' })
  @IsOptional()
  durationMinutes?: number;

  @IsInt()
  @IsOptional()
  stateId?: number; // Por defecto será 2 (PUBLISHED) en la BD
}

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  orderIndex?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @IsInt()
  @IsOptional()
  stateId?: number;
}

// DTO para reordenar capítulos
export class ReorderChaptersDto {
  @IsNotEmpty({ message: 'El array de IDs es obligatorio' })
  chapterIds: number[]; // Array de IDs en el nuevo orden
}

// ============================================
// DTOs de RESPUESTA
// ============================================

export class ChapterResponseDto {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  durationMinutes: number;
  course: {
    id: number;
    title: string;
  };
  state: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ChapterListItemDto {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  durationMinutes: number;
  stateName: string;
  contentsCount?: number; // Cantidad de contenidos (videos, PDFs, etc.)
}

export class ChapterSimpleDto {
  id: number;
  title: string;
  orderIndex: number;
  durationMinutes: number;
}

export class ChapterWithContentsDto extends ChapterResponseDto {
  contents: any[]; // TODO: Definir cuando creemos ChapterContent
}

// DTO para cambiar solo el estado
export class ChangeChapterStateDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del estado es obligatorio' })
  stateId: number;
}