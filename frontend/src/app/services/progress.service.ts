import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { API_CONFIG } from '../config/api.config';

export interface ModuleProgress {
  moduleId: number;
  moduleName: string;
  moduleDescription?: string;
  moduleIcon?: string;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  progressPercentage: number;
  status: 'completed' | 'in_progress' | 'not_started';
  startedAt?: Date;
  lastCompletedAt?: Date;
  hasBadge: boolean;
}
export interface ModuleCompleted {
  moduleId: number;
  moduleName: string;
  moduleIcon?: string;
  moduleDescription?: string;
  totalCourses: number;
  completedAt: Date;
  badgeTypeId?: number;
  badgeName?: string;
  badgeIconUrl?: string;
}
export interface TrainingHistoryItem {
  type: 'course' | 'module';
  id: number;
  title: string;
  moduleName?: string;
  thumbnail?: string;
  completedAt: Date;
  totalChapters?: number;
  totalCourses?: number;
  badgeType: {
    id: number;
    name: string;
    iconUrl: string;
  };
}
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
private apiUrl = `${API_CONFIG.apiUrl}/api/progress`;

  constructor(private http: HttpClient,
  private authService: AuthService 

  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  
  getMyProgress(): Observable<CourseProgress[]> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress[] }>(
      `${this.apiUrl}/me`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  
  getMyDashboard(): Observable<DashboardStats> {
    return this.http.get<{ success: boolean; message: string; data: DashboardStats }>(
      `${this.apiUrl}/me/dashboard`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  
  getMyCoursesInProgress(): Observable<CourseProgress[]> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress[] }>(
      `${this.apiUrl}/me/courses/in-progress`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }



getMyCoursesCompleted(): Observable<CourseProgress[]> {
  const user = this.authService.getUser(); 
  if (!user) {
    throw new Error('Usuario no logueado');
  }

  const userId = user.id; 

  return this.http.get<{ success: boolean; message: string; data: CourseProgress[] }>(
    `${this.apiUrl}/me/courses/completed/${userId}`, 
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data)
  );
}

  
  getMyCourseProgress(courseId: number): Observable<CourseProgress> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress }>(
      `${this.apiUrl}/me/course/${courseId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }


  getUserProgress(userId: number): Observable<CourseProgress[]> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress[] }>(
      `${this.apiUrl}/user/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  
  getUserCourseProgress(userId: number, courseId: number): Observable<CourseProgress> {
    return this.http.get<{ success: boolean; message: string; data: CourseProgress }>(
      `${this.apiUrl}/user/${userId}/course/${courseId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  
  getCourseAnalytics(courseId: number): Observable<CourseAnalytics> {
    return this.http.get<{ success: boolean; message: string; data: CourseAnalytics }>(
      `${this.apiUrl}/course/${courseId}/analytics`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  
  getUserRanking(limit: number = 10): Observable<UserRanking[]> {
    return this.http.get<{ success: boolean; message: string; data: UserRanking[] }>(
      `${this.apiUrl}/ranking?limit=${limit}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

 
 startCourse(courseId: number): Observable<ChapterProgress> {
  const user = this.authService.getUser(); 

  if (!user || !user.id) {
    throw new Error('Usuario no autenticado');
  }

  return this.http.post<{ success: boolean; message: string; data: ChapterProgress }>(
    `${this.apiUrl}/start-course`,
    { courseId, userId: user.id }, 
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data)
  );
}


  
  
  completeChapter(chapterId: number): Observable<ChapterProgress> {
      const user = this.authService.getUser(); 
      if (!user || !user.id) {
    throw new Error('Usuario no autenticado');
  }
    return this.http.post<{ success: boolean; message: string; data: ChapterProgress }>(
      `${this.apiUrl}/complete-chapter`,
      { chapterId,userId: user.id },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  
uncompleteChapter(chapterId: number): Observable<ChapterProgress> {
  const user = this.authService.getUser(); 
  
  if (!user || !user.id) {
    throw new Error('Usuario no autenticado');
  }

  return this.http.patch<{ success: boolean; message: string; data: ChapterProgress }>(
    `${this.apiUrl}/uncomplete-chapter/${chapterId}`,
    { userId: user.id },  
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data)
  );
}

  resetCourseProgress(courseId: number): Observable<any> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/course/${courseId}/reset`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }
  getMyTrainingHistory(): Observable<TrainingHistoryItem[]> {
  return this.http.post<{ success: boolean; message: string; data: TrainingHistoryItem[] }>(
      `${this.apiUrl}/complete-chapter`,
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data)
  );
}
getMyModulesCompleted(): Observable<ModuleCompleted[]> {
  const user = this.authService.getUser();
  if (!user) {
    throw new Error('Usuario no logueado');
  }

  const userId = user.id;

  return this.http.get<{ success: boolean; message: string; data: ModuleCompleted[] }>(
    `${this.apiUrl}/me/modules/completed/${userId}`,
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data)
  );
}
getMyModulesProgress(): Observable<ModuleProgress[]> {
  const user = this.authService.getUser();
  if (!user) {
    throw new Error('Usuario no logueado');
  }

  const userId = user.id;

  return this.http.get<{ success: boolean; message: string; data: ModuleProgress[] }>(
    `${this.apiUrl}/me/modules/progress/${userId}`,
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data)
  );
}
}