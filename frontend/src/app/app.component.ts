import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string | null;
  roles?: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Portal de Capacitaciones';
  sidebarCollapsed = false;
  userMenuOpen = false; 

  private allMenuItems: MenuItem[] = [
    {
      route: '/dashboard',
      icon: 'fas fa-home',
      label: 'Inicio',
      badge: null,
      roles: ['ADMIN', 'COLLABORATOR']
    },
    {
      route: '/users',
      icon: 'fas fa-users',
      label: 'Usuarios',
      badge: null,
      roles: ['ADMIN']
    },
    {
      route: '/contents',
      icon: 'fas fa-file-alt',
      label: 'Capacitaciones',
      badge: null,
      roles: ['ADMIN', 'COLLABORATOR']
    },
    {
      route: '/modules',
      icon: 'fas fa-folder',
      label: 'Módulos',
      badge: null,
      roles: ['ADMIN', 'COLLABORATOR']
    },
    {
      route: '/courses',
      icon: 'fas fa-graduation-cap',
      label: 'Cursos',
      badge: null,
      roles: ['ADMIN', 'COLLABORATOR']
    },
    {
      route: '/chapters',
      icon: 'fas fa-book',
      label: 'Capítulos',
      badge: null,
      roles: ['ADMIN', 'COLLABORATOR']
    }
  ];

  menuItems: MenuItem[] = [];

  constructor(
    public authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.filterMenuByRole();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.filterMenuByRole();
      this.userMenuOpen = false; 
    });
  }

  filterMenuByRole(): void {
    if (!this.isAuthenticated()) {
      this.menuItems = [];
      return;
    }

    const userRole = this.authService.getUserRole();
    this.menuItems = this.allMenuItems.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      return item.roles.includes(userRole);
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  getUserName(): string {
    const user = this.authService.getUser();
    return user?.name || 'Usuario';
  }

  getUserEmail(): string {
    const user = this.authService.getUser();
    return user?.email || '';
  }

  getUserRole(): string {
    return this.authService.getUserRole();
  }

  getUserInitials(): string {
    const name = this.getUserName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.menuItems = [];
    this.userMenuOpen = false;
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}