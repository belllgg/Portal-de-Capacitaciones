import { IsString, IsNotEmpty, IsOptional,MaxLength,IsUrl,IsInt} from 'class-validator';

// ============================================
// DTOs para CREAR y ACTUALIZAR Badge Types
// ============================================

export class CreateBadgeTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'La URL del icono debe ser válida' })
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  criteria?: string;
}

export class UpdateBadgeTypeDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  criteria?: string;
}

// ============================================
// DTOs para OTORGAR Badges Manualmente
// ============================================

export class AwardBadgeDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  userId: number;

  @IsInt()
  @IsNotEmpty({ message: 'El ID del tipo de insignia es obligatorio' })
  badgeTypeId: number;

  @IsInt()
  @IsOptional()
  courseId?: number;
}

// ============================================
// DTOs de RESPUESTA
// ============================================

export class BadgeTypeResponseDto {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  criteria: string;
}

export class UserBadgeDto {
  id: number;
  badgeType: {
    id: number;
    name: string;
    description: string;
    iconUrl: string;
  };
  course?: {
    id: number;
    title: string;
    moduleName?: string;
  };
  earnedAt: Date;
}

export class UserBadgeSummaryDto {
  userId: number;
  userName: string;
  totalBadges: number;
  badges: UserBadgeDto[];
  badgesByType: {
    badgeTypeName: string;
    count: number;
    icon: string;
  }[];
}

export class BadgeTypeWithStatsDto extends BadgeTypeResponseDto {
  totalAwarded: number;
  uniqueUsers: number;
}

// ============================================
// DTOs para Logros y Gamificación
// ============================================

export class UserAchievementsDto {
  userId: number;
  userName: string;
  level: number;
  experiencePoints: number;
  totalBadges: number;
  recentBadges: UserBadgeDto[];
  nextBadges: {
    badgeTypeName: string;
    description: string;
    progress: number;
    requirement: string;
  }[];
}