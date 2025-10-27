import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

export interface LoginDto {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: {
    id: number;
    name: string;
  };
  state: {
    id: number;
    name: string;
  };
  isAdmin: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    user: User;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(credentials: LoginDto): Observable<LoginResponse> {
    console.log('Enviando login a:', `${this.apiUrl}/users/login`);
    
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/users/login`,
      credentials,
      { headers }
    ).pipe(
      tap((response) => {
        console.log('Login exitoso:', response);
        if (response.success && response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }),
      catchError((error) => {
        console.error('Error en login:', error);
        throw error;
      })
    );
  }

  getWithAuth<T>(endpoint: string): Observable<T> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json'
    });

    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers });
  }

  postWithAuth<T>(endpoint: string, data: any): Observable<T> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    });

    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, { headers });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logout realizado');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  getUserRole(): string {
    const user = this.getUser();
    return user?.role?.name || '';
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.isAdmin || user?.role?.name === 'ADMIN';
  }

  isCollaborator(): boolean {
    const user = this.getUser();
    return user?.role?.name === 'COLLABORATOR';
  }

  canAccessUsers(): boolean {
    return this.isAdmin(); 
  }

  canEditModules(): boolean {
    return this.isAdmin(); 
  }

  canDeleteModules(): boolean {
    return this.isAdmin(); }

  canCreateContent(): boolean {
    return this.isAdmin(); 
  }
}