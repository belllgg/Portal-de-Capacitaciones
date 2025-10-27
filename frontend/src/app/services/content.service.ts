import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface Content {
  id: number;
  chapterId: number;
  contentTypeId: number;
  title?: string;
  fileUrl: string;
  fileSizeMb?: number;
  orderIndex: number;
  contentTypeName?: string;
  contentTypeIcon?: string;
  chapterTitle?: string;
  createdAt?: Date;
  contentType?: {
    id: number;
    name: string;
  };
  chapter?: {
    id: number;
    title: string;
    courseId: number;
  };
}

export interface ContentType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface CreateContentDto {
  chapterId: number;
  contentTypeId: number;
  title?: string;
  fileUrl: string;
  fileSizeMb?: number;
  orderIndex: number;
}

export interface UpdateContentDto {
  title?: string;
  fileUrl?: string;
  fileSizeMb?: number;
  orderIndex?: number;
  contentTypeId?: number;
}

export interface ReorderContentsDto {
  contentIds: number[];
}

export interface ContentStats {
  totalContents: number;
  videoCount: number;
  pdfCount: number;
  presentationCount: number;
  documentCount: number;
  linkCount: number;
  totalSizeMb: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
private apiUrl = `${API_CONFIG.apiUrl}/api/contents`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener tipos de contenido disponibles
  getContentTypes(): Observable<ContentType[]> {
    return this.http.get<{ success: boolean; message: string; data: ContentType[] }>(
      `${this.apiUrl}/types`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Crear contenido
  createContent(content: CreateContentDto): Observable<Content> {
    return this.http.post<{ success: boolean; message: string; data: Content }>(
      `${this.apiUrl}/create`,
      content,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Crear contenido con orden automático
  createAutoOrdered(chapterId: number, contentTypeId: number, title: string, fileUrl: string, fileSizeMb?: number): Observable<Content> {
    return this.http.post<{ success: boolean; message: string; data: Content }>(
      `${this.apiUrl}/create/auto-ordered`,
      { chapterId, contentTypeId, title, fileUrl, fileSizeMb },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener contenidos por capítulo
  getContentsByChapter(chapterId: number): Observable<Content[]> {
    return this.http.get<{ success: boolean; message: string; data: Content[] }>(
      `${this.apiUrl}/chapter/${chapterId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener estadísticas de contenidos de un capítulo
  getChapterContentStats(chapterId: number): Observable<ContentStats> {
    return this.http.get<{ success: boolean; message: string; data: ContentStats }>(
      `${this.apiUrl}/chapter/${chapterId}/stats`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener estadísticas de contenidos de un curso
  getCourseContentStats(courseId: number): Observable<ContentStats> {
    return this.http.get<{ success: boolean; message: string; data: ContentStats }>(
      `${this.apiUrl}/course/${courseId}/stats`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener contenidos por tipo
  getContentsByType(contentTypeId: number): Observable<Content[]> {
    return this.http.get<{ success: boolean; message: string; data: Content[] }>(
      `${this.apiUrl}/type/${contentTypeId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Obtener contenido por ID
  getContentById(id: number): Observable<Content> {
    return this.http.get<{ success: boolean; message: string; data: Content }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Actualizar contenido
  updateContent(id: number, content: UpdateContentDto): Observable<Content> {
    return this.http.put<{ success: boolean; message: string; data: Content }>(
      `${this.apiUrl}/${id}`,
      content,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Reordenar contenidos
  reorderContents(chapterId: number, contentIds: number[]): Observable<any> {
    return this.http.patch<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/chapter/${chapterId}/reorder`,
      { contentIds },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  // Eliminar contenido permanentemente
  deleteContent(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Eliminar todos los contenidos de un capítulo
  deleteContentsByChapter(chapterId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/chapter/${chapterId}/all`,
      { headers: this.getHeaders() }
    );
  }
}