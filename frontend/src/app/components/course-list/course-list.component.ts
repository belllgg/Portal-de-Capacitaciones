import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../services/course.service';
import { ModuleService, Module } from '../../services/module.service';
import { filter, Subscription, forkJoin } from 'rxjs';
import { ProgressService } from '../../services/progress.service';
import { AuthService } from '../../services/auth.service';

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
    { id: 1, name: 'Borrador', backendName: 'DRAFT', class: 'bg-warning' },
    { id: 2, name: 'Activo', backendName: 'ACTIVE', class: 'bg-success' },
    { id: 3, name: 'Inactivo', backendName: 'INACTIVE', class: 'bg-secondary' },
    { id: 4, name: 'Archivado', backendName: 'ARCHIVED', class: 'bg-dark' }
  ];

  // Cursos iniciados por el usuario
  startedCourses: number[] = [];

  constructor(
    private courseService: CourseService,
    private moduleService: ModuleService,
    private progressService: ProgressService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    console.log('🔄 Componente de cursos inicializado');
    
    // 🔥 Leer query params de la URL primero y convertir a number
    const moduleParam = this.route.snapshot.queryParams['module'];
    const stateParam = this.route.snapshot.queryParams['state'];
    
    if (moduleParam) {
      this.selectedModule = Number(moduleParam);
      console.log('📦 Filtro de módulo desde URL:', this.selectedModule, 'tipo:', typeof this.selectedModule);
    }
    if (stateParam) {
      this.selectedState = Number(stateParam);
      console.log('🏷️ Filtro de estado desde URL:', this.selectedState, 'tipo:', typeof this.selectedState);
    }
    
    // Cargar todos los datos
    this.loadAllData();
    
    // Escuchar cambios de navegación
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/courses' || event.url.startsWith('/courses?')) {
          console.log('🔄 Recargando cursos por navegación');
          
          // Leer nuevos parámetros y convertir a number
          const newModuleParam = this.route.snapshot.queryParams['module'];
          const newStateParam = this.route.snapshot.queryParams['state'];
          
          this.selectedModule = newModuleParam ? Number(newModuleParam) : null;
          this.selectedState = newStateParam ? Number(newStateParam) : null;
          
          console.log('📦 Nuevo filtro módulo:', this.selectedModule, 'tipo:', typeof this.selectedModule);
          console.log('🏷️ Nuevo filtro estado:', this.selectedState, 'tipo:', typeof this.selectedState);
          
          this.loadAllData();
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
        console.log('📦 Módulos cargados:', data);
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      }
    });
  }

  /**
   * Carga módulos y cursos en paralelo usando forkJoin
   */
  loadAllData(): void {
    this.loading = true;
    this.error = '';
    console.log('🔄 Iniciando carga de datos...');
    
    // Cargar módulos y cursos EN PARALELO
    forkJoin({
      modules: this.moduleService.getAllModules(),
      courses: this.courseService.getAllCourses()
    }).subscribe({
      next: ({ modules, courses }) => {
        console.log('✅ Datos cargados:', { modules, courses });
        
        // Primero guardamos los módulos
        this.modules = modules;
        
        // Luego normalizamos los cursos (ahora tenemos módulos disponibles)
        this.courses = courses.map(course => {
          const moduleId = this.mapModuleNameToId(course.moduleName || '');
          const stateId = this.mapStateNameToId(course.stateName || '');
          
          return {
            ...course,
            moduleId: moduleId || 0,
            stateId: stateId || 3,
            moduleName: course.moduleName ?? 'N/A',
            stateName: course.stateName ?? 'Desconocido',
            moduleIcon: course.moduleIcon ?? 'fas fa-folder'
          };
        });
        
        console.log('📚 Cursos normalizados:', this.courses);
        console.log('📚 Primer curso:', this.courses[0]);
        
        // Aplicar filtros
        this.applyFilters();
        
        // Cargar progreso del usuario
        this.loadStartedCourses();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar datos:', error);
        this.error = 'Error al cargar los datos';
        this.loading = false;
      }
    });
  }

  /**
   * Mapea el nombre del estado del backend a su ID
   */
  private mapStateNameToId(stateName: string): number {
    const state = this.states.find(s => 
      s.backendName.toLowerCase() === stateName.toLowerCase()
    );
    return state ? state.id : 3; // Default: Inactivo
  }

  /**
   * Mapea el nombre del módulo a su ID buscando en la lista de módulos
   */
  private mapModuleNameToId(moduleName: string): number | null {
    const module = this.modules.find(m => 
      m.name.toLowerCase() === moduleName.toLowerCase()
    );
    return module ? module.id : null;
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';
    
    console.log('📡 Cargando cursos con conteo de capítulos...');
    
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        // 🔧 MAPEAR nombres a IDs
        this.courses = data.map(course => {
          const moduleId = this.mapModuleNameToId(course.moduleName || '');
          const stateId = this.mapStateNameToId(course.stateName || '');
          
          return {
            ...course,
            moduleId: moduleId || 0,
            stateId: stateId
          };
        });
        
        console.log('📚 Cursos cargados y mapeados:', this.courses);
        console.log('📚 Ejemplo de curso mapeado:', this.courses[0]);
        
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los cursos';
        this.loading = false;
        console.error('❌ Error:', error);
      }
    });
  }

  loadStartedCourses(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.startedCourses = [];
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id;

    this.progressService.getUserProgress(userId).subscribe({
      next: (progressData: any) => {
        const coursesInProgress = progressData?.coursesInProgress || [];
        const coursesCompleted = progressData?.coursesCompleted || [];
        const allStartedCourses = [...coursesInProgress, ...coursesCompleted];
        
        this.startedCourses = allStartedCourses.map((course: any) => {
          return course.courseId || course.course_id || course.id;
        }).filter(id => id !== undefined);
      },
      error: (error) => {
        console.error('Error al cargar progreso de usuario:', error);
        this.startedCourses = [];
      }
    });
  }

  startCourse(course: Course): void {
    if (confirm(`¿Deseas iniciar el curso "${course.title}"?`)) {
      this.loading = true;
      this.progressService.startCourse(course.id).subscribe({
        next: (response) => {
          console.log('Curso iniciado exitosamente:', response);
          alert(`¡Curso "${course.title}" iniciado! Ya puedes comenzar a ver los capítulos.`);
          this.loading = false;

          if (!this.startedCourses.includes(course.id)) {
            this.startedCourses.push(course.id);
          }
        },
        error: (error) => {
          this.loading = false;
          const errorMsg = error.error?.message || 'Error al iniciar el curso';
          this.error = errorMsg;
          alert(errorMsg);
          console.error('Error al iniciar curso:', error);
        }
      });
    }
  }

  applyFilters(): void {
    console.log('=== INICIO DE FILTRADO ===');
    console.log('🔍 Valores de filtros:', {
      searchText: this.searchText,
      selectedModule: this.selectedModule,
      selectedModuleType: typeof this.selectedModule,
      selectedState: this.selectedState,
      selectedStateType: typeof this.selectedState
    });

    this.filteredCourses = this.courses.filter(course => {
      console.log(`\n--- Evaluando curso: ${course.title} ---`);
      console.log('Curso moduleId:', course.moduleId, 'tipo:', typeof course.moduleId);
      console.log('Curso stateId:', course.stateId, 'tipo:', typeof course.stateId);
      console.log('Comparando selectedModule:', this.selectedModule, 'con course.moduleId:', course.moduleId);
      
      const matchesSearch = !this.searchText || 
        course.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(this.searchText.toLowerCase()));
      
      const matchesModule = this.selectedModule === null || 
        Number(course.moduleId) === Number(this.selectedModule);
      
      const matchesState = this.selectedState === null || 
        Number(course.stateId) === Number(this.selectedState);
      
      console.log('Matches:', { matchesSearch, matchesModule, matchesState });
      
      return matchesSearch && matchesModule && matchesState;
    });

    console.log(`\n=== FIN FILTRADO ===`);
    console.log(`Total filtrados: ${this.filteredCourses.length} de ${this.courses.length} cursos`);
  }

  onSearchChange(): void {
    console.log('Búsqueda cambiada:', this.searchText);
    this.applyFilters();
  }

  onModuleFilterChange(event: any): void {
    console.log('selectedModule después del cambio:', this.selectedModule, 'tipo:', typeof this.selectedModule);
    this.applyFilters();
  }

  onStateFilterChange(event: any): void {
    console.log('selectedState después del cambio:', this.selectedState, 'tipo:', typeof this.selectedState);
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedModule = null;
    this.selectedState = null;
    console.log(' Filtros limpiados');
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
          console.log('Curso publicado, recargando lista...');
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
          console.log('Curso pausado, recargando lista...');
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
          console.log('Curso archivado, recargando lista...');
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
          console.log('Curso eliminado, recargando lista...');
          this.loadCourses();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el curso';
          console.error('Error:', error);
        }
      });
    }
  }

  goToCourseChapters(courseId: number): void {
    this.router.navigate(['/chapters'], { 
      queryParams: { courseId: courseId } 
    });
  }
}