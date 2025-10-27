import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ModuleService, Module } from '../../services/module.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-module-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.css']
})
export class ModuleListComponent implements OnInit, OnDestroy {
  modules: Module[] = [];
  loading = false;
  error = '';
  private routerSubscription?: Subscription;

  constructor(
    private moduleService: ModuleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔄 Componente inicializado');
    this.loadModules();
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/modules' || event.url.startsWith('/modules')) {
          console.log('Recargando por navegación');
          this.loadModules();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  loadModules(): void {
    this.loading = true;
    this.error = '';
    
    console.log('Cargando módulos...');
    
    this.moduleService.getAllModules().subscribe({
      next: (data) => {
        this.modules = data;
        this.loading = false;
        console.log('Módulos cargados:', data);
      },
      error: (error) => {
        this.error = 'Error al cargar los módulos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  editModule(module: Module): void {
    this.router.navigate(['/modules/edit', module.id]);
  }

  deleteModule(module: Module): void {
    if (confirm(`¿Estás seguro de eliminar el módulo "${module.name}"?`)) {
      this.loading = true;
      this.moduleService.deleteModule(module.id).subscribe({
        next: () => {
          console.log('Módulo eliminado, recargando lista...');
          this.loadModules();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el módulo';
          this.loading = false;
          console.error('Error al eliminar:', error);
        }
      });
    }
  }
  viewCourses(moduleId: number): void {
  this.router.navigate(['/courses'], { 
    queryParams: { moduleId: moduleId } 
  });
}
}