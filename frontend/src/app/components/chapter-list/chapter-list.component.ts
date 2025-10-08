import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChapterService, Chapter } from '../../services/chapter.service';
import { CourseService, Course } from '../../services/course.service';
import { ProgressService, ChapterProgress } from '../../services/progress.service';

// Importar Bootstrap para el modal
declare var bootstrap: any;

@Component({
  selector: 'app-chapter-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chapter-list.component.html',
  styleUrls: ['./chapter-list.component.css']
})
export class ChapterListComponent implements OnInit {
  chapters: Chapter[] = [];
  courses: Course[] = [];
  loading = false;
  error = '';
  
  // Filtro por curso
  selectedCourseId: number | null = null;
  selectedCourseName = '';
  
  // Variable para el modal de completar
  chapterToComplete: Chapter | null = null;
  
  // Set de IDs de capítulos completados
  completedChapterIds: Set<number> = new Set();
  
  // Estados disponibles
  states = [
    { id: 1, name: 'DRAFT', class: 'bg-warning' },      // Borrador
    { id: 2, name: 'PUBLISHED', class: 'bg-success' },  // Publicado
    { id: 3, name: 'ARCHIVED', class: 'bg-secondary' }  // Archivado
  ];

  constructor(
    private chapterService: ChapterService,
    private courseService: CourseService,
    private ProgressService: ProgressService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    
    // Verificar si viene un courseId por parámetro
    this.route.queryParams.subscribe(params => {
      if (params['courseId']) {
        this.selectedCourseId = +params['courseId'];
        this.loadChaptersByCourse(this.selectedCourseId);
        this.loadUserProgress(this.selectedCourseId);
      }
    });
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
      }
    });
  }

  loadChaptersByCourse(courseId: number): void {
    this.loading = true;
    this.error = '';
    
    const selectedCourse = this.courses.find(c => c.id === courseId);
    this.selectedCourseName = selectedCourse ? selectedCourse.title : '';
    
    this.chapterService.getChaptersByCourse(courseId).subscribe({
      next: (data) => {
        this.chapters = data.sort((a, b) => a.orderIndex - b.orderIndex);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los capítulos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // Cargar progreso del usuario para el curso actual
  loadUserProgress(courseId: number): void {
    this.ProgressService.getMyCourseProgress(courseId).subscribe({
      next: (progress) => {
        // Limpiar el Set antes de llenarlo
        this.completedChapterIds.clear();
        
        // Si hay capítulos en el progreso, agregarlos al Set
        if (progress.chapters && progress.chapters.length > 0) {
          progress.chapters.forEach((chapter: ChapterProgress) => {
            if (chapter.isCompleted) {
              this.completedChapterIds.add(chapter.chapterId);
            }
          });
        }
        
        console.log('Capítulos completados:', Array.from(this.completedChapterIds));
      },
      error: (error) => {
        console.log('No se encontró progreso previo:', error);
        // No mostramos error porque puede que el usuario no haya iniciado el curso
      }
    });
  }

  onCourseChange(): void {
    if (this.selectedCourseId) {
      this.loadChaptersByCourse(this.selectedCourseId);
      this.loadUserProgress(this.selectedCourseId);
      
      // Actualizar URL sin recargar
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { courseId: this.selectedCourseId },
        queryParamsHandling: 'merge'
      });
    } else {
      this.chapters = [];
      this.selectedCourseName = '';
      this.completedChapterIds.clear();
    }
  }

  getStateBadgeClass(stateId: number): string {
    const state = this.states.find(s => s.id === stateId);
    return state ? state.class : 'bg-secondary';
  }

  // Verificar si un capítulo está completado
  isChapterCompleted(chapterId: number): boolean {
    return this.completedChapterIds.has(chapterId);
  }

  createChapter(): void {
    if (this.selectedCourseId) {
      this.router.navigate(['/chapters/create'], { 
        queryParams: { courseId: this.selectedCourseId } 
      });
    } else {
      this.router.navigate(['/chapters/create']);
    }
  }

  editChapter(chapter: Chapter): void {
    this.router.navigate(['/chapters/edit', chapter.id]);
  }

  publishChapter(chapter: Chapter): void {
    if (confirm(`¿Deseas publicar el capítulo "${chapter.title}"?`)) {
      this.chapterService.publishChapter(chapter.id).subscribe({
        next: () => {
          if (this.selectedCourseId) {
            this.loadChaptersByCourse(this.selectedCourseId);
          }
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al publicar el capítulo';
          console.error('Error:', error);
        }
      });
    }
  }

  moveUp(chapter: Chapter): void {
    const index = this.chapters.findIndex(c => c.id === chapter.id);
    if (index > 0) {
      const newOrder = [...this.chapters];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      this.reorderChapters(newOrder);
    }
  }

  moveDown(chapter: Chapter): void {
    const index = this.chapters.findIndex(c => c.id === chapter.id);
    if (index < this.chapters.length - 1) {
      const newOrder = [...this.chapters];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      this.reorderChapters(newOrder);
    }
  }

  reorderChapters(newOrder: Chapter[]): void {
    if (!this.selectedCourseId) return;
    
    const chapterIds = newOrder.map(c => c.id);
    this.chapterService.reorderChapters(this.selectedCourseId, chapterIds).subscribe({
      next: () => {
        this.loadChaptersByCourse(this.selectedCourseId!);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al reordenar capítulos';
        console.error('Error:', error);
      }
    });
  }

  deleteChapter(chapter: Chapter): void {
    if (confirm(`¿Estás seguro de archivar el capítulo "${chapter.title}"?`)) {
      this.chapterService.softDeleteChapter(chapter.id).subscribe({
        next: () => {
          if (this.selectedCourseId) {
            this.loadChaptersByCourse(this.selectedCourseId);
          }
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al archivar el capítulo';
          console.error('Error:', error);
        }
      });
    }
  }

// Método simplificado: toggle directo sin modal
toggleChapterComplete(chapter: Chapter): void {
  const isCompleted = this.isChapterCompleted(chapter.id);
  
  if (isCompleted) {
    // Si está completado, desmarcar
    this.ProgressService.uncompleteChapter(chapter.id).subscribe({
      next: (response) => {
        console.log('Capítulo desmarcado:', response);
        this.completedChapterIds.delete(chapter.id);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al desmarcar el capítulo';
        console.error('Error:', error);
      }
    });
  } else {
    // Si no está completado, marcar
    this.ProgressService.completeChapter(chapter.id).subscribe({
      next: (response) => {
        console.log('Capítulo completado:', response);
        this.completedChapterIds.add(chapter.id);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al completar el capítulo';
        console.error('Error:', error);
      }
    });
  }
}
 


}