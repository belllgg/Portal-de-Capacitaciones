import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../services/course.service';
import { ModuleService, Module } from '../../services/module.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  modules: Module[] = [];
  loading = false;
  error = '';
  private routerSubscription?: Subscription;
  
  // Filtros
  searchText = '';
  selectedModule: number | null = null;
  selectedState: number | null = null;
  
  // Estados disponibles
  states = [
    { id: 1, name: 'Borrador', class: 'bg-warning' },
    { id: 2, name: 'Activo', class: 'bg-success' },
    { id: 3, name: 'Inactivo', class: 'bg-secondary' },
    { id: 4, name: 'Archivado', class: 'bg-dark' }
  ];

  constructor(
    private courseService: CourseService,
    private moduleService: ModuleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔄 Componente de cursos inicializado');
    this.loadModules();
    this.loadCourses();
    
    // ✅ Recargar cada vez que navegamos a esta ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/courses' || event.url.startsWith('/courses?')) {
          console.log('🔄 Recargando cursos por navegación');
          this.loadCourses();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  loadModules(): void {
    this.moduleService.getAllModules().subscribe({
      next: (data) => {
        this.modules = data;
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      }
    });
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';
    
    console.log('📡 Cargando cursos con conteo de capítulos...');
    
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.applyFilters();
        this.loading = false;
        console.log('✅ Cursos cargados:', data);
      },
      error: (error) => {
        this.error = 'Error al cargar los cursos';
        this.loading = false;
        console.error('❌ Error:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = !this.searchText || 
        course.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(this.searchText.toLowerCase()));
      
      const matchesModule = !this.selectedModule || course.moduleId === this.selectedModule;
      const matchesState = !this.selectedState || course.stateId === this.selectedState;
      
      return matchesSearch && matchesModule && matchesState;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onModuleFilterChange(): void {
    this.applyFilters();
  }

  onStateFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedModule = null;
    this.selectedState = null;
    this.applyFilters();
  }

  getStateBadgeClass(stateId: number): string {
    const state = this.states.find(s => s.id === stateId);
    return state ? state.class : 'bg-secondary';
  }

  editCourse(course: Course): void {
    this.router.navigate(['/courses/edit', course.id]);
  }

  viewCourse(course: Course): void {
    this.router.navigate(['/courses/view', course.id]);
  }

  publishCourse(course: Course): void {
    if (confirm(`¿Deseas publicar el curso "${course.title}"?`)) {
      this.courseService.publishCourse(course.id).subscribe({
        next: () => {
          console.log('✅ Curso publicado, recargando lista...');
          this.loadCourses();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al publicar el curso';
          console.error('Error:', error);
        }
      });
    }
  }

  pauseCourse(course: Course): void {
    if (confirm(`¿Deseas pausar el curso "${course.title}"?`)) {
      this.courseService.pauseCourse(course.id).subscribe({
        next: () => {
          console.log('✅ Curso pausado, recargando lista...');
          this.loadCourses();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al pausar el curso';
          console.error('Error:', error);
        }
      });
    }
  }

  deleteCourse(course: Course): void {
    if (confirm(`¿Estás seguro de archivar el curso "${course.title}"? Esta acción puede revertirse.`)) {
      this.courseService.softDeleteCourse(course.id).subscribe({
        next: () => {
          console.log('✅ Curso archivado, recargando lista...');
          this.loadCourses();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al archivar el curso';
          console.error('Error:', error);
        }
      });
    }
  }

  permanentDelete(course: Course): void {
    if (confirm(`¿Estás ABSOLUTAMENTE seguro de eliminar permanentemente el curso "${course.title}"? Esta acción NO puede revertirse.`)) {
      this.courseService.deleteCourse(course.id).subscribe({
        next: () => {
          console.log('✅ Curso eliminado, recargando lista...');
          this.loadCourses();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el curso';
          console.error('Error:', error);
        }
      });
    }
  }
}