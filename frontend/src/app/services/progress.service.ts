import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
// ==========================================
// INTERFACES
// ==========================================

export interface ChapterProgress {
  id: number;
  userId: number;
  chapterId: number;
  courseId: number;
  completedAt?: Date;
  isCompleted: boolean;
  chapterTitle?: string;
  chapterOrder?: number;
}

export interface CourseProgress {
  courseId: number;
  courseTitle: string;
  courseThumbnail?: string;
  moduleId: number;
  moduleName?: string;
  totalChapters: number;
  completedChapters: number;
  progressPercentage: number;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  chapters?: ChapterProgress[];
}

export interface DashboardStats {
  totalCoursesStarted: number;
  totalCoursesCompleted: number;
  totalChaptersCompleted: number;
  averageProgress: number;
  currentStreak?: number;
  coursesInProgress: CourseProgress[];
  recentActivity?: ChapterProgress[];
}

export interface UserRanking {
  userId: number;
  userName: string;
  userEmail?: string;
  totalCoursesCompleted: number;
  totalChaptersCompleted: number;
  averageProgress: number;
  rank: number;
}

export interface CourseAnalytics {
  courseId: number;
  courseTitle: string;
  totalStudents: number;
  studentsCompleted: number;
  studentsInProgress: number;
  averageProgress: number;
  completionRate: number;
  averageCompletionTime?: number;
  chapterStats?: {
    chapterId: number;
    chapterTitle: string;
    completionRate: number;
    totalCompletions: number;
  }[];
}

export interface StartCourseDto {
  courseId: number;
}

export interface CompleteChapterDto {
  chapterId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:3000/api/progress';

  constructor(private http: HttpClient,
  private authService: AuthService // <-- inyecta AuthService

  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ==========================================
  // ENDPOINTS DE CONSULTA - MI PROGRESO
  // ==========================================

  /**
   * Obtener resumen completo de progreso del usuario autenticado
   */
  getMyProgress(): Observable<CourseProgress[]> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress[] }>(
      `${this.apiUrl}/me`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener estadísticas para el dashboard del usuario
   */
  getMyDashboard(): Observable<DashboardStats> {
    return this.http.get<{ success: boolean; message: string; data: DashboardStats }>(
      `${this.apiUrl}/me/dashboard`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener cursos en progreso del usuario
   */
  getMyCoursesInProgress(): Observable<CourseProgress[]> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress[] }>(
      `${this.apiUrl}/me/courses/in-progress`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener historial de cursos completados
   */


getMyCoursesCompleted(): Observable<CourseProgress[]> {
  const user = this.authService.getUser(); // obtenemos el usuario del localStorage
  if (!user) {
    throw new Error('Usuario no logueado');
  }

  const userId = user.id; // id del usuario logueado

  return this.http.get<{ success: boolean; message: string; data: CourseProgress[] }>(
    `${this.apiUrl}/me/courses/completed/${userId}`, // pasamos el id
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data)
  );
}

  /**
   * Obtener progreso detallado de un curso específico
   */
  getMyCourseProgress(courseId: number): Observable<CourseProgress> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress }>(
      `${this.apiUrl}/me/course/${courseId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // ==========================================
  // ENDPOINTS DE CONSULTA - ADMIN
  // ==========================================

  /**
   * Obtener progreso de un usuario específico (solo ADMIN)
   */
  getUserProgress(userId: number): Observable<CourseProgress[]> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress[] }>(
      `${this.apiUrl}/user/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener progreso de un usuario en un curso (solo ADMIN)
   */
  getUserCourseProgress(userId: number, courseId: number): Observable<CourseProgress> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress }>(
      `${this.apiUrl}/user/${userId}/course/${courseId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener analytics de un curso (solo ADMIN)
   */
  getCourseAnalytics(courseId: number): Observable<CourseAnalytics> {
    return this.http.get<{ success: boolean; message: string; data: CourseAnalytics }>(
      `${this.apiUrl}/course/${courseId}/analytics`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener ranking de usuarios (solo ADMIN)
   */
  getUserRanking(limit: number = 10): Observable<UserRanking[]> {
    return this.http.get<{ success: boolean; message: string; data: UserRanking[] }>(
      `${this.apiUrl}/ranking?limit=${limit}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // ==========================================
  // ENDPOINTS DE MUTACIÓN
  // ==========================================

  /**
   * Iniciar un curso
   */
  startCourse(courseId: number): Observable<ChapterProgress> {
    return this.http.post<{ success: boolean; message: string; data: ChapterProgress }>(
      `${this.apiUrl}/start-course`,
      { courseId },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Marcar un capítulo como completado
   */
  completeChapter(chapterId: number): Observable<ChapterProgress> {
    return this.http.post<{ success: boolean; message: string; data: ChapterProgress }>(
      `${this.apiUrl}/complete-chapter`,
      { chapterId },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Desmarcar un capítulo como completado
   */
uncompleteChapter(chapterId: number): Observable<ChapterProgress> {
  const user = this.authService.getUser(); // Obtener usuario logueado
  
  if (!user || !user.id) {
    throw new Error('Usuario no autenticado');
  }

  return this.http.patch<{ success: boolean; message: string; data: ChapterProgress }>(
    `${this.apiUrl}/uncomplete-chapter/${chapterId}`,
    { userId: user.id },  // ← AGREGAR ESTO
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data)
  );
}

  /**
   * Reiniciar progreso de un curso
   */
  resetCourseProgress(courseId: number): Observable<any> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/course/${courseId}/reset`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }
}