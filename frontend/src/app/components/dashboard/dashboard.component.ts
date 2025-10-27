import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModuleService, Module } from '../../services/module.service';
import { CourseService, Course } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { ProgressService } from '../../services/progress.service';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  totalModules: number;
  totalCourses: number;
  activeCourses: number;
  totalChapters: number;
  totalUsers: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  modules: Module[] = [];
  courses: Course[] = [];
  stats: DashboardStats | null = null;
  loading = false;
  error = '';

  private readonly STATES = {
    DRAFT: 1,
    ACTIVE: 2,
    INACTIVE: 3,
    ARCHIVED: 4
  };

  constructor(
    private moduleService: ModuleService,
    private courseService: CourseService,
    private progressService: ProgressService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';
    console.log('Iniciando carga del dashboard...');

    forkJoin({
      modules: this.moduleService.getAllModules(),
      courses: this.courseService.getAllCourses()
    }).subscribe({
      next: ({ modules, courses }) => {
        console.log('Datos cargados:', { modules, courses });
        this.modules = modules;
        this.courses = this.normalizeCourses(courses);
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.loading = false;
        this.error = 'Error al cargar los datos del dashboard';
      }
    });
  }


  private normalizeCourses(courses: Course[]): Course[] {
    return courses.map(course => ({
      ...course,
      moduleId: this.mapModuleNameToId(course.moduleName || ''),
      stateId: this.mapStateNameToId(course.stateName || '')
    }));
  }


  private mapModuleNameToId(moduleName: string): number {
    const module = this.modules.find(m => 
      m.name.toLowerCase() === moduleName.toLowerCase()
    );
    return module ? module.id : 0;
  }

  private mapStateNameToId(stateName: string): number {
    const stateMap: { [key: string]: number } = {
      'DRAFT': this.STATES.DRAFT,
      'ACTIVE': this.STATES.ACTIVE,
      'INACTIVE': this.STATES.INACTIVE,
      'ARCHIVED': this.STATES.ARCHIVED
    };
    return stateMap[stateName.toUpperCase()] || this.STATES.INACTIVE;
  }

  calculateStats(): void {
    console.log('Calculando estadísticas...', {
      modulesCount: this.modules.length,
      coursesCount: this.courses.length
    });

    const totalCourses = this.courses.length;
    
    const activeCourses = this.courses.filter(
      course => course.stateId === this.STATES.ACTIVE
    ).length;

    this.stats = {
      totalModules: this.modules.length,
      totalCourses: totalCourses,
      activeCourses: activeCourses,
      totalChapters: 0,
      totalUsers: 0
    };

    console.log('Estadísticas finales:', this.stats);
    console.log(`Cursos activos: ${activeCourses} de ${totalCourses} totales`);
  }

  getAverageCoursesPerModule(): string {
    if (!this.stats || this.stats.totalModules === 0) return '0';
    return (this.stats.totalCourses / this.stats.totalModules).toFixed(1);
  }

  getActiveCoursesForModule(moduleId: number): number {
    return this.courses.filter(
      course => course.moduleId === moduleId && course.stateId === this.STATES.ACTIVE
    ).length;
  }

  getTotalCoursesForModule(moduleId: number): number {
    return this.courses.filter(
      course => course.moduleId === moduleId
    ).length;
  }

  deleteModule(module: Module): void {
    if (confirm(`¿Estás seguro de eliminar el módulo "${module.name}"?`)) {
      this.moduleService.deleteModule(module.id).subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el módulo';
        }
      });
    }
  }

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

  reloadDashboard(): void {
    this.loadDashboardData();
  }
}