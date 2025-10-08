import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgressService, CourseProgress, ChapterProgress } from '../../services/progress.service';

@Component({
  selector: 'app-course-progress-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-progress-detail.component.html',
  styleUrls: ['./course-progress-detail.component.css']
})
export class CourseProgressDetailComponent implements OnInit {
  courseProgress: CourseProgress | null = null;
  courseId: number | null = null;
  loading = false;
  error = '';
  processingChapter: number | null = null;

  constructor(
    private progressService: ProgressService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['courseId']) {
        this.courseId = +params['courseId'];
        this.loadCourseProgress();
      }
    });
  }

  loadCourseProgress(): void {
    if (!this.courseId) return;

    this.loading = true;
    this.error = '';

    this.progressService.getMyCourseProgress(this.courseId).subscribe({
      next: (data) => {
        this.courseProgress = data;
        this.loading = false;
        console.log('✅ Progreso del curso cargado:', data);
      },
      error: (error) => {
        this.error = 'Error al cargar el progreso del curso';
        this.loading = false;
        console.error('❌ Error:', error);
      }
    });
  }

  toggleChapterCompletion(chapter: ChapterProgress): void {
    this.processingChapter = chapter.chapterId;

    if (chapter.isCompleted) {
      // Desmarcar como completado
      this.progressService.uncompleteChapter(chapter.chapterId).subscribe({
        next: () => {
          console.log('✅ Capítulo desmarcado');
          this.loadCourseProgress();
          this.processingChapter = null;
        },
        error: (error) => {
          this.error = 'Error al desmarcar el capítulo';
          console.error('❌ Error:', error);
          this.processingChapter = null;
        }
      });
    } else {
      // Marcar como completado
      this.progressService.completeChapter(chapter.chapterId).subscribe({
        next: () => {
          console.log('✅ Capítulo completado');
          this.loadCourseProgress();
          this.processingChapter = null;
        },
        error: (error) => {
          this.error = 'Error al marcar el capítulo como completado';
          console.error('❌ Error:', error);
          this.processingChapter = null;
        }
      });
    }
  }

  resetProgress(): void {
    if (!this.courseId) return;

    const courseName = this.courseProgress?.courseTitle || 'este curso';
    
    if (confirm(`¿Estás seguro de reiniciar tu progreso en "${courseName}"? Esta acción no se puede deshacer.`)) {
      this.progressService.resetCourseProgress(this.courseId).subscribe({
        next: () => {
          console.log('✅ Progreso reiniciado');
          this.router.navigate(['/progress/dashboard']);
        },
        error: (error) => {
          this.error = 'Error al reiniciar el progreso';
          console.error('❌ Error:', error);
        }
      });
    }
  }

  getProgressBarWidth(percentage: number): string {
    return `${Math.min(100, Math.max(0, percentage))}%`;
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'info';
    if (percentage >= 25) return 'warning';
    return 'danger';
  }

  isProcessing(chapterId: number): boolean {
    return this.processingChapter === chapterId;
  }
}