// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModuleService, Module } from '../../services/module.service';
import { AuthService } from '../../services/auth.service';

interface DashboardStats {
  totalModules: number;
  totalCourses: number;
  activeCourses: number;
  totalChapters: number; // aunque ahora no lo uses
  totalUsers: number;    // aunque ahora no lo uses
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-home">
      
      <!-- Bienvenida personalizada por rol -->
      <div class="welcome-banner" [class]="getWelcomeClass()">
        <div class="welcome-content">
          <i [class]="getWelcomeIcon()"></i>
          <div>
            <h4>{{ getWelcomeTitle() }}</h4>
            <p class="mb-0">{{ getWelcomeMessage() }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Cargando estadísticas...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Stats Cards -->
      <div *ngIf="!loading && stats" class="row g-4">
        <!-- Tarjeta Módulos -->
        <div class="col-md-6 col-lg-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-cubes"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalModules }}</h3>
              <p>Módulos</p>
            </div>
          </div>
        </div>

        <!-- Tarjeta Total Cursos -->
        <div class="col-md-6 col-lg-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-book"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalCourses }}</h3>
              <p>Total Cursos</p>
            </div>
          </div>
        </div>

        <!-- Tarjeta Cursos Activos -->
        <div class="col-md-6 col-lg-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-play-circle"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.activeCourses }}</h3>
              <p>Cursos Activos</p>
            </div>
          </div>
        </div>

        <!-- Tarjeta Progreso -->
        <div class="col-md-6 col-lg-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <h3>{{ getAverageCoursesPerModule() }}</h3>
              <p>Promedio por Módulo</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Módulos con Detalles -->
      <div *ngIf="!loading && modules.length > 0" class="mt-5">
        <h3 class="mb-3">Módulos del Sistema</h3>
        <div class="row g-3">
          <div *ngFor="let module of modules" class="col-md-6 col-lg-4">
            <div class="module-card">
              <div class="module-header">
                <i [class]="module.icon || 'fas fa-folder'"></i>
                <h5>{{ module.name }}</h5>
              </div>
              <div class="module-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ module.coursesCount || 0 }}</span>
                  <span class="stat-label">Cursos</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ module.activeCoursesCount || 0 }}</span>
                  <span class="stat-label">Activos</span>
                </div>
              </div>
              <div class="module-actions">
                <!-- Solo admin puede editar módulos -->
                <button *ngIf="authService.canEditModules()" 
                        [routerLink]="['/modules/edit', module.id]" 
                        class="btn btn-sm btn-outline-primary">
                  <i class="fas fa-edit"></i> Editar
                </button>
                
                <!-- Solo admin puede eliminar módulos -->
                <button *ngIf="authService.canDeleteModules()" 
                        (click)="deleteModule(module)"
                        class="btn btn-sm btn-outline-danger">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
                
                <!-- Todos pueden ver cursos -->
                <a [routerLink]="['/courses']" [queryParams]="{module: module.id}" 
                   class="btn btn-sm btn-outline-success">
                  <i class="fas fa-eye"></i> Ver Cursos
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Accesos Rápidos -->
      <div class="mt-5">
        <h3 class="mb-3">Gestión del Sistema</h3>
        <div class="row g-3">
          <!-- Solo admin puede gestionar módulos -->
          <div class="col-md-3" *ngIf="authService.canEditModules()">
            <a routerLink="/modules" class="quick-link">
              <i class="fas fa-cubes"></i>
              <span>Gestionar Módulos</span>
            </a>
          </div>

          <!-- Todos pueden ver cursos -->
          <div class="col-md-3">
            <a routerLink="/courses" class="quick-link">
              <i class="fas fa-book"></i>
              <span>Gestionar Cursos</span>
            </a>
          </div>

          <!-- Solo admin y collaborator pueden crear contenido -->
          <div class="col-md-3" *ngIf="authService.canCreateContent()">
            <a routerLink="/modules/create" class="quick-link">
              <i class="fas fa-plus"></i>
              <span>Nuevo Módulo</span>
            </a>
          </div>

          <!-- Solo admin puede gestionar usuarios -->
          <div class="col-md-3" *ngIf="authService.canAccessUsers()">
            <a routerLink="/users" class="quick-link">
              <i class="fas fa-users"></i>
              <span>Gestionar Usuarios</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Información del Rol Actual -->
      <div class="mt-4">
        <div class="role-info">
          <small class="text-muted">
            <i class="fas fa-user-shield me-1"></i>
            Rol actual: <strong>{{ authService.getUserRole() }}</strong> | 
            Permisos: 
            <span *ngIf="authService.isAdmin()" class="badge bg-primary">Administrador Completo</span>
            <span *ngIf="authService.isCollaborator()" class="badge bg-success">Colaborador</span>
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-home {
      padding: 1rem;
    }

    .welcome-banner {
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .welcome-banner.admin {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .welcome-banner.collaborator {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .welcome-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome-content i {
      font-size: 2rem;
    }

    .welcome-content h4 {
      margin: 0;
      font-weight: 600;
    }

    .welcome-content p {
      margin: 0;
      opacity: 0.9;
    }

    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #fff;
    }

    .stat-info h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: #1e293b;
    }

    .stat-info p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .module-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.2s;
      height: 100%;
    }

    .module-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .module-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .module-header i {
      font-size: 1.5rem;
      color: #3b82f6;
      width: 40px;
    }

    .module-header h5 {
      margin: 0;
      color: #1e293b;
      font-weight: 600;
    }

    .module-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .stat-item {
      text-align: center;
      flex: 1;
    }

    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }

    .module-actions {
      display: flex;
      gap: 0.5rem;
    }

    .module-actions .btn {
      flex: 1;
      font-size: 0.75rem;
    }

    .quick-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: #fff;
      border-radius: 12px;
      text-decoration: none;
      color: #1e293b;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.2s;
      height: 100%;
    }

    .quick-link:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      color: #3b82f6;
    }

    .quick-link i {
      font-size: 1.5rem;
      color: #3b82f6;
    }

    .quick-link span {
      font-weight: 500;
    }

    .role-info {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    h2, h3 {
      color: #1e293b;
    }

    /* Colores para los iconos */
    .bg-primary { background: #3b82f6; }
    .bg-success { background: #10b981; }
    .bg-info { background: #06b6d4; }
    .bg-warning { background: #f59e0b; }
  `]
})
export class DashboardComponent implements OnInit {
  modules: Module[] = [];
  stats: DashboardStats | null = null;
  loading = false;
  error = '';

  constructor(
    private moduleService: ModuleService,
    public authService: AuthService // ✅ Hacer público para usar en template
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.loading = true;
    this.error = '';

    this.moduleService.getAllModules().subscribe({
      next: (modules) => {
        this.modules = modules;
        this.calculateStats(modules);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al cargar los módulos y estadísticas';
        console.error('❌ Error:', error);
      }
    });
  }

  calculateStats(modules: Module[]): void {
    const totalCourses = modules.reduce((sum, module) => sum + (module.coursesCount || 0), 0);
    const activeCourses = modules.reduce((sum, module) => sum + (module.activeCoursesCount || 0), 0);

    this.stats = {
      totalModules: modules.length,
      totalCourses: totalCourses,
      activeCourses: activeCourses,
      totalChapters: 0,
      totalUsers: 0
    };
  }

  getAverageCoursesPerModule(): string {
    if (!this.stats || this.stats.totalModules === 0) return '0';
    return (this.stats.totalCourses / this.stats.totalModules).toFixed(1);
  }

  deleteModule(module: Module): void {
    if (confirm(`¿Estás seguro de eliminar el módulo "${module.name}"?`)) {
      this.moduleService.deleteModule(module.id).subscribe({
        next: () => {
          this.loadModules(); // Recargar la lista
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el módulo';
        }
      });
    }
  }

  // ✅ Métodos para la bienvenida personalizada
  getWelcomeClass(): string {
    return this.authService.isAdmin() ? 'welcome-banner admin' : 'welcome-banner collaborator';
  }

  getWelcomeIcon(): string {
    return this.authService.isAdmin() ? 'fas fa-crown' : 'fas fa-user-check';
  }

  getWelcomeTitle(): string {
    return this.authService.isAdmin() ? 'Administrador del Sistema' : 'Colaborador';
  }

  getWelcomeMessage(): string {
    if (this.authService.isAdmin()) {
      return 'Tienes acceso completo a todas las funcionalidades del sistema.';
    } else {
      return 'Puedes visualizar contenido y crear nuevos cursos, pero no gestionar usuarios.';
    }
  }
}