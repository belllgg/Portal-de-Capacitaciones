import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Chapter {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
  stateId: number;
  stateName?: string;
  courseName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  contentsCount?: number;
  course?: {
    id: number;
    title: string;
  };
  state?: {
    id: number;
    name: string;
  };
}

export interface CreateChapterDto {
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
  stateId?: number;
}

export interface UpdateChapterDto {
  title?: string;
  description?: string;
  orderIndex?: number;
  durationMinutes?: number;
  stateId?: number;
}

export interface ReorderChaptersDto {
  chapterIds: number[];
}

export interface ChangeChapterStateDto {
  stateId: number;
}

export interface ChapterStats {
  totalChapters: number;
  publishedChapters: number;
  draftChapters: number;
  totalMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  private apiUrl = 'http://localhost:3000/api/chapters';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Crear capítulo
  createChapter(chapter: CreateChapterDto): Observable<Chapter> {
    return this.http.post<{ success: boolean; message: string; data: Chapter }>(
      `${this.apiUrl}/create`,
      chapter,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Crear capítulo con orden automático
  createAutoOrdered(courseId: number, title: string, description?: string, durationMinutes?: number): Observable<Chapter> {
    return this.http.post<{ success: boolean; message: string; data: Chapter }>(
      `${this.apiUrl}/auto-ordered`,
      { courseId, title, description, durationMinutes },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener capítulos por curso
  getChaptersByCourse(courseId: number): Observable<Chapter[]> {
    return this.http.get<{ success: boolean; message: string; data: Chapter[] }>(
      `${this.apiUrl}/course/${courseId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener capítulos publicados por curso
  getPublishedChaptersByCourse(courseId: number): Observable<Chapter[]> {
    return this.http.get<{ success: boolean; message: string; data: Chapter[] }>(
      `${this.apiUrl}/course/${courseId}/published`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }




  // Obtener estadísticas de capítulos de un curso
  getCourseChapterStats(courseId: number): Observable<ChapterStats> {
    return this.http.get<{ success: boolean; message: string; data: ChapterStats }>(
      `${this.apiUrl}/course/${courseId}/stats`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener capítulos por estado
  getChaptersByState(stateId: number): Observable<Chapter[]> {
    return this.http.get<{ success: boolean; message: string; data: Chapter[] }>(
      `${this.apiUrl}/state/${stateId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener capítulo por ID
  getChapterById(id: number): Observable<Chapter> {
    return this.http.get<{ success: boolean; message: string; data: Chapter }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Actualizar capítulo
  updateChapter(id: number, chapter: UpdateChapterDto): Observable<Chapter> {
    return this.http.put<{ success: boolean; message: string; data: Chapter }>(
      `${this.apiUrl}/${id}`,
      chapter,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Reordenar capítulos
  reorderChapters(courseId: number, chapterIds: number[]): Observable<any> {
    return this.http.patch<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/course/${courseId}/reorder`,
      { chapterIds },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Cambiar estado del capítulo
  changeState(id: number, stateId: number): Observable<Chapter> {
    return this.http.patch<{ success: boolean; message: string; data: Chapter }>(
      `${this.apiUrl}/${id}/state`,
      { stateId },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Publicar capítulo
  publishChapter(id: number): Observable<Chapter> {
    return this.http.patch<{ success: boolean; message: string; data: Chapter }>(
      `${this.apiUrl}/${id}/publish`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Eliminar capítulo (soft delete)
  softDeleteChapter(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}/soft`,
      { headers: this.getHeaders() }
    );
  }

  // Eliminar capítulo permanentemente
  deleteChapter(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}