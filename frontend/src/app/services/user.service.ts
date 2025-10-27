import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable ,map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface User {
  id?: number;
  email: string;
  name: string;
  role?: {
    id: number;
    name: string;
  };
  state?: {
    id: number;
    name: string;
  };
  roleId?: number;  
  stateId?: number; 
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  roleId: string | number;
  stateId:string | number;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  roleId?: number;
  stateId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
private apiUrl = `${API_CONFIG.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // POST /api/users/register
  register(user: CreateUserDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { 
      headers: this.getHeaders() 
    });
  }

  // GET /api/users/consult-all
getAllUsers(): Observable<User[]> {
  return this.http.get<any>(`${this.apiUrl}/consult-all`).pipe(
    map(response => response.data) 
  );
}

  // GET /api/users/consult/
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/consult/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // PUT /api/users/update/:email
  updateUser(email: string, userData: UpdateUserDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${email}`, userData, { 
      headers: this.getHeaders() 
    });
  }

  // DELETE /api/users/delete/:email
  deleteUser(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${email}`, { 
      headers: this.getHeaders() 
    });
  }
}