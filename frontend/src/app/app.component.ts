import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Portal de Capacitaciones';
  sidebarCollapsed = false;

menuItems = [
  {
    route: '/dashboard',
    icon: 'fas fa-home',
    label: 'Inicio',
    badge: null
  },
   
  {
    route: '/users',
    icon: 'fas fa-users',
    label: 'Usuarios',
    badge: null
  },
  {
    route: '/contents',
    icon: 'fas fa-file-alt',
    label: 'Capacitaciones',
    badge: null
  },
  {
    route: '/modules',
    icon: 'fas fa-folder',
    label: 'Módulos',
    badge: null
  },
    {
    route: '/chapters',
    icon: 'fas fa-book',
    label: 'Capítulos',
    badge: null
  },
  {
    route: '/courses',
    icon: 'fas fa-graduation-cap',
    label: 'Cursos',
    badge: null
  },
     { 
      label: 'Cursos Completados', 
      route: '/progress/completed', 
      icon: 'fas fa-trophy',
          badge: null

    },


];

  constructor(
    public authService: AuthService,
    public router: Router  
  ) {}

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}