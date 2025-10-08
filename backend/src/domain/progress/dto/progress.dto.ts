import { IsInt, IsNotEmpty,IsOptional,IsBoolean} from 'class-validator';

// ============================================
// DTOs para MARCAR PROGRESO
// ============================================

export class CompleteChapterDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del capítulo es obligatorio' })
  chapterId: number;
}

export class StartCourseDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del curso es obligatorio' })
  courseId: number;
}

// ============================================
// DTOs de RESPUESTA - Progreso de Capítulo
// ============================================

export class ChapterProgressDto {
  id: number;
  chapterId: number;
  chapterTitle: string;
  chapterOrderIndex: number;
  completed: boolean;
  completedAt: Date | null;
}

// ============================================
// DTOs de RESPUESTA - Progreso de Curso
// ============================================

export class CourseProgressDto {
  id: number;
  courseId: number;
  courseTitle: string;
  moduleName: string;
  moduleIcon: string;
  instructorName: string;
  thumbnailUrl: string;
  progressPercentage: number;
  completedChapters: number;
  totalChapters: number;
  startedAt: Date;
  completedAt: Date | null;
  isCompleted: boolean;
}

export class CourseProgressDetailDto extends CourseProgressDto {
  chapters: ChapterProgressDto[];
}

// ============================================
// DTOs de RESPUESTA - Progreso General
// ============================================

export class UserProgressSummaryDto {
  userId: number;
  userName: string;
  userEmail: string;
  totalCoursesStarted: number;
  totalCoursesCompleted: number;
  totalChaptersCompleted: number;
  totalHoursStudied: number;
  coursesInProgress: CourseProgressDto[];
  coursesCompleted: CourseProgressDto[];
}

export class UserHistoryItemDto {
  courseId: number;
  courseTitle: string;
  moduleName: string;
  completedAt: Date | null;
  totalChapters: number;
  durationHours: number;
}

// ============================================
// DTOs de RESPUESTA - Dashboard Stats
// ============================================

export class UserDashboardStatsDto {
  coursesInProgress: number;
  coursesCompleted: number;
  chaptersCompleted: number;
  hoursStudied: number;
  recentActivity: RecentActivityDto[];
  coursesByModule: ModuleStatsDto[];
}

export class RecentActivityDto {
  type: 'chapter_completed' | 'course_started' | 'course_completed';
  courseTitle: string;
  chapterTitle?: string;
  date: Date;
  icon: string;
}

export class ModuleStatsDto {
  moduleId: number;
  moduleName: string;
  moduleIcon: string;
  coursesStarted: number;
  coursesCompleted: number;
  progressPercentage: number;
}

// ============================================
// DTOs para REPORTES (Admin)
// ============================================

export class CourseAnalyticsDto {
  courseId: number;
  courseTitle: string;
  totalStudents: number;
  completedStudents: number;
  averageProgress: number;
  averageCompletionTime: number; // en días
}

export class UserRankingDto {
  userId: number;
  userName: number;
  userEmail: string;
  coursesCompleted: number;
  chaptersCompleted: number;
  hoursStudied: number;
  rank: number;
}