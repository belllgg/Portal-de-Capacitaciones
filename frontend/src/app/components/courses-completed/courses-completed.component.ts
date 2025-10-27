import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProgressService, CourseProgress, ModuleCompleted } from '../../services/progress.service';

@Component({
  selector: 'app-courses-completed',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './courses-completed.component.html',
  styleUrls: ['./courses-completed.component.css']
})
export class CoursesCompletedComponent implements OnInit {
  activeTab: 'courses' | 'modules' = 'courses';
  
  courses: CourseProgress[] = [];
  filteredCourses: CourseProgress[] = [];
  
  modules: ModuleCompleted[] = [];
  filteredModules: ModuleCompleted[] = [];
  
  loading = false;
  error = '';
  
  searchText = '';
  sortBy: 'recent' | 'title' = 'recent';

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    this.loadCoursesCompleted();
    this.loadModulesCompleted();
  }

  switchTab(tab: 'courses' | 'modules'): void {
    this.activeTab = tab;
    this.searchText = '';
    this.applyFiltersAndSort();
  }

 
  loadCoursesCompleted(): void {
    this.loading = true;
    this.error = '';
    
    this.progressService.getMyCoursesCompleted().subscribe({
      next: (data) => {
        this.courses = data;
        this.applyFiltersAndSort();
        this.loading = false;
        console.log('Cursos completados:', data);
      },
      error: (error) => {
        this.error = 'Error al cargar los cursos completados';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  loadModulesCompleted(): void {
    this.progressService.getMyModulesCompleted().subscribe({
      next: (data) => {
        this.modules = data;
        this.applyFiltersAndSort();
        console.log('Módulos completados:', data);
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      }
    });
  }

  applyFiltersAndSort(): void {
    if (this.activeTab === 'courses') {
      this.filterCourses();
    } else {
      this.filterModules();
    }
  }

 
  private filterCourses(): void {
    let filtered = this.courses.filter(course => {
      const searchLower = this.searchText.toLowerCase();
      return course.courseTitle.toLowerCase().includes(searchLower) ||
             (course.moduleName && course.moduleName.toLowerCase().includes(searchLower));
    });

    switch (this.sortBy) {
      case 'recent':
        filtered = filtered.sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'title':
        filtered = filtered.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
        break;
    }

    this.filteredCourses = filtered;
  }


  private filterModules(): void {
    let filtered = this.modules.filter(module => {
      const searchLower = this.searchText.toLowerCase();
      return module.moduleName.toLowerCase().includes(searchLower) ||
             (module.moduleDescription && module.moduleDescription.toLowerCase().includes(searchLower));
    });

    switch (this.sortBy) {
      case 'recent':
        filtered = filtered.sort((a, b) => {
          const dateA = new Date(a.completedAt).getTime();
          const dateB = new Date(b.completedAt).getTime();
          return dateB - dateA;
        });
        break;
      case 'title':
        filtered = filtered.sort((a, b) => a.moduleName.localeCompare(b.moduleName));
        break;
    }

    this.filteredModules = filtered;
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFiltersAndSort();
  }

  calculateDuration(course: CourseProgress): number {
    if (!course.startedAt || !course.completedAt) return 0;
    const start = new Date(course.startedAt).getTime();
    const end = new Date(course.completedAt).getTime();
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  get itemCount(): number {
    return this.activeTab === 'courses' 
      ? this.filteredCourses.length 
      : this.filteredModules.length;
  }
}