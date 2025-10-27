import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ChapterService } from './chapter.service'; 
import { API_CONFIG } from '../config/api.config';

export interface Course {
  id: number;
  title: string;
  description?: string;
  instructorName?: string;
  thumbnailUrl?: string;
  durationHours?: number;
  moduleId: number;
  moduleName?: string;
  moduleIcon?: string;
  stateId: number;
  stateName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  chaptersCount?: number;
  publishedChaptersCount?: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCourseDto {
  title: string;
  description?: string;
  moduleId: number;
  instructorName?: string;
  thumbnailUrl?: string;
  durationHours?: number;
  stateId?: number;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  moduleId?: number;
  instructorName?: string;
  thumbnailUrl?: string;
  durationHours?: number;
  stateId?: number;
}

export interface ChangeStateDto {
  stateId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
private apiUrl = `${API_CONFIG.apiUrl}/api/courses`;

  constructor(
    private http: HttpClient,
    private chapterService: ChapterService 
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<{ success: boolean; message: string; data: Course[] }>(
      `${this.apiUrl}/consult-all`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      switchMap((courses) => {
        if (!courses.length) return of(courses);

        const requests = courses.map((course) =>
          forkJoin({
            allChapters: this.chapterService.getChaptersByCourse(course.id).pipe(
              catchError(() => of([]))
            ),
            publishedChapters: this.chapterService.getPublishedChaptersByCourse(course.id).pipe(
              catchError(() => of([]))
            )
          }).pipe(
            map(({ allChapters, publishedChapters }) => ({
              ...course,
              chaptersCount: allChapters.length,
              publishedChaptersCount: publishedChapters.length,
            })),
            catchError((err) => {
              console.error(`Error al contar capítulos del curso ${course.id}`, err);
              return of({
                ...course,
                chaptersCount: 0,
                publishedChaptersCount: 0,
              });
            })
          )
        );

        return forkJoin(requests);
      }),
      catchError((err) => {
        console.error('Error al cargar cursos:', err);
        return of([]);
      })
    );
  }

  // Obtener solo cursos activos
  getActiveCourses(): Observable<Course[]> {
    return this.http.get<{ success: boolean; message: string; data: Course[] }>(
      `${this.apiUrl}/consult-active`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Buscar cursos por texto
  searchCourses(text: string): Observable<Course[]> {
    return this.http.get<{ success: boolean; message: string; data: Course[] }>(
      `${this.apiUrl}/search?text=${encodeURIComponent(text)}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener cursos por estado
  getCoursesByState(stateId: number): Observable<Course[]> {
    return this.http.get<{ success: boolean; message: string; data: Course[] }>(
      `${this.apiUrl}/state/${stateId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener cursos por módulo
  getCoursesByModule(moduleId: number): Observable<Course[]> {
    return this.http.get<{ success: boolean; message: string; data: Course[] }>(
      `${this.apiUrl}/module/${moduleId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener cursos activos por módulo
  getActiveCoursesByModule(moduleId: number): Observable<Course[]> {
    return this.http.get<{ success: boolean; message: string; data: Course[] }>(
      `${this.apiUrl}/module/${moduleId}/active`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener cursos por creador
  getCoursesByCreator(creatorId: number): Observable<Course[]> {
    return this.http.get<{ success: boolean; message: string; data: Course[] }>(
      `${this.apiUrl}/consult-creator/${creatorId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener curso por ID
  getCourseById(id: number): Observable<Course> {
    return this.http.get<{ success: boolean; message: string; data: Course }>(
      `${this.apiUrl}/consult${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Crear curso
  createCourse(course: CreateCourseDto): Observable<Course> {
    return this.http.post<{ success: boolean; message: string; data: Course }>(
      `${this.apiUrl}/create`,
      course,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Actualizar curso
  updateCourse(id: number, course: UpdateCourseDto): Observable<Course> {
    return this.http.put<{ success: boolean; message: string; data: Course }>(
      `${this.apiUrl}/update/${id}`,
      course,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Cambiar estado del curso
  changeState(id: number, stateId: number): Observable<Course> {
    return this.http.patch<{ success: boolean; message: string; data: Course }>(
      `${this.apiUrl}/${id}/state`,
      { stateId },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Publicar curso
  publishCourse(id: number): Observable<Course> {
    return this.http.patch<{ success: boolean; message: string; data: Course }>(
      `${this.apiUrl}/${id}/publish`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Pausar curso
  pauseCourse(id: number): Observable<Course> {
    return this.http.patch<{ success: boolean; message: string; data: Course }>(
      `${this.apiUrl}/${id}/pause`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Eliminar curso (soft delete)
  softDeleteCourse(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete${id}/soft`,
      { headers: this.getHeaders() }
    );
  }

  // Eliminar curso permanentemente
  deleteCourse(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete${id}`,
      { headers: this.getHeaders() }
    );
  }
}