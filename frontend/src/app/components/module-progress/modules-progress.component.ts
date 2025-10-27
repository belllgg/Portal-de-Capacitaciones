import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgressService, ModuleProgress } from '../../services/progress.service';

@Component({
  selector: 'app-modules-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modules-progress.component.html',
  styleUrls: ['./modules-progress.component.css']
})
export class ModulesProgressComponent implements OnInit {
  modules: ModuleProgress[] = [];
  loading = false;
  error = '';

  stats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    totalProgress: 0
  };

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    this.loadModulesProgress();
  }

  loadModulesProgress(): void {
    this.loading = true;
    this.error = '';

    this.progressService.getMyModulesProgress().subscribe({
      next: (data) => {
        this.modules = data;
        this.calculateStats();
        this.loading = false;
        console.log('Progreso de módulos cargado:', data);
      },
      error: (error) => {
        this.error = 'Error al cargar el progreso de módulos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.modules.length;
    this.stats.completed = this.modules.filter(m => m.status === 'completed').length;
    this.stats.inProgress = this.modules.filter(m => m.status === 'in_progress').length;
    this.stats.notStarted = this.modules.filter(m => m.status === 'not_started').length;
    
    if (this.modules.length > 0) {
      const totalProgress = this.modules.reduce((sum, m) => sum + m.progressPercentage, 0);
      this.stats.totalProgress = Math.round(totalProgress / this.modules.length);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'not_started':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En Progreso';
      case 'not_started':
        return 'No Iniciado';
      default:
        return 'Desconocido';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'fas fa-check-circle';
      case 'in_progress':
        return 'fas fa-clock';
      case 'not_started':
        return 'fas fa-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  get sortedModules(): ModuleProgress[] {
    return [...this.modules].sort((a, b) => {
      const statusOrder = { 'in_progress': 1, 'completed': 2, 'not_started': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }
}