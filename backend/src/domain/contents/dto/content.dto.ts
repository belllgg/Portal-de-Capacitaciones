import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min,MaxLength,IsInt,IsIn} from 'class-validator';

// ============================================
// DTOs para CREAR y ACTUALIZAR
// ============================================

export class CreateContentDto {
  @IsInt({ message: 'El ID del capítulo debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del capítulo es obligatorio' })
  chapterId: number;

  @IsInt({ message: 'El tipo de contenido debe ser un número entero' })
  @IsNotEmpty({ message: 'El tipo de contenido es obligatorio' })
  @IsIn([1, 2, 3, 4, 5], { message: 'Tipo inválido: 1=VIDEO, 2=PDF, 3=PRESENTATION, 4=DOCUMENT, 5=LINK' })
  contentTypeId: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string |undefined;

  @IsString()
  @IsNotEmpty({ message: 'La URL del archivo es obligatoria' })
  @MaxLength(500)
  fileUrl: string;

  @IsNumber({}, { message: 'El tamaño debe ser un número' })
  @Min(0, { message: 'El tamaño debe ser mayor o igual a 0' })
  @IsOptional()
  fileSizeMb?: number;

  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El orden es obligatorio' })
  orderIndex: number;
}

export class UpdateContentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  fileUrl?: string;

  @IsNumber()
  @IsOptional()
  fileSizeMb?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  orderIndex?: number;

  @IsInt()
  @IsOptional()
  @IsIn([1, 2, 3, 4, 5])
  contentTypeId?: number;
}

export class UploadContentDto {
  @IsInt()
  @IsNotEmpty()
  chapterId: number;

  @IsInt()
  @IsNotEmpty()
  @IsIn([1, 2, 3, 4, 5])
  contentTypeId: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  orderIndex?: number;
}

export class ReorderContentsDto {
  @IsNotEmpty({ message: 'El array de IDs es obligatorio' })
  contentIds: number[]; 
}

// ============================================
// DTOs de RESPUESTA
// ============================================

export class ContentResponseDto {
  id: number;
  title: string;
  fileUrl: string;
  fileSizeMb: number;
  orderIndex: number;
  contentType: {
    id: number;
    name: string;
  };
  chapter: {
    id: number;
    title: string;
    courseId: number;
  };
  createdAt: Date;
}

export class ContentListItemDto {
  id: number;
  title: string;
  fileUrl: string;
  fileSizeMb: number;
  orderIndex: number;
  contentTypeName: string;
  contentTypeIcon?: string; 
}

export class ContentSimpleDto {
  id: number;
  title: string;
  fileUrl: string;
  contentTypeName: string;
}

export class ContentStatsDto {
  totalContents: number;
  videoCount: number;
  pdfCount: number;
  presentationCount: number;
  documentCount: number;
  linkCount: number;
  totalSizeMb: number;
}