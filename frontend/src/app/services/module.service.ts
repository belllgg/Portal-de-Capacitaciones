import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CourseService } from './course.service';
import { API_CONFIG } from '../config/api.config';

export interface Module {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  createdAt?: Date;
  coursesCount?: number;
  activeCoursesCount?: number;
}

export interface CreateModuleDto {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateModuleDto {
  name?: string;
  description?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
private apiUrl = `${API_CONFIG.apiUrl}/api/modules`;

  constructor(
    private http: HttpClient,
    private courseService: CourseService 
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllModules(): Observable<Module[]> {
    return this.http
      .get<{ success: boolean; message: string; data: Module[] }>(
        `${this.apiUrl}/consult-all`,
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => response.data || []),
        switchMap((modules) => {
          if (!modules.length) return of(modules);

          const requests = modules.map((mod) =>
            this.courseService.getCoursesByModule(mod.id).pipe(
              map((courses) => ({
                ...mod,
                coursesCount: courses.length,
                activeCoursesCount: courses.filter((c: any) => c.active === true || c.status === 'active').length,
              })),
              catchError((err) => {
                console.error(`Error al contar cursos del módulo ${mod.id}`, err);
                return of({
                  ...mod,
                  coursesCount: 0,
                  activeCoursesCount: 0,
                });
              })
            )
          );

          return forkJoin(requests);
        }),
        catchError((err) => {
          console.error('Error al cargar módulos:', err);
          return of([]);
        })
      );
  }

  getModuleById(id: number): Observable<Module> {
    return this.http
      .get<{ success: boolean; message: string; data: Module }>(
        `${this.apiUrl}/consult${id}`,
        { headers: this.getHeaders() }
      )
      .pipe(map((response) => response.data));
  }

  // Crear módulo
  createModule(module: CreateModuleDto): Observable<Module> {
    return this.http.post<Module>(`${this.apiUrl}/create`, module, {
      headers: this.getHeaders(),
    });
  }

  // Actualizar módulo
  updateModule(id: number, module: UpdateModuleDto): Observable<Module> {
    return this.http.put<Module>(`${this.apiUrl}/update/${id}`, module, {
      headers: this.getHeaders(),
    });
  }

  // Eliminar módulo
  deleteModule(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.getHeaders(),
    });
  }
}