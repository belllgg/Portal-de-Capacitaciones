import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentService, Content, ContentType } from '../../services/content.service';
import { ChapterService, Chapter } from '../../services/chapter.service';
import { CourseService, Course } from '../../services/course.service';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.css']
})
export class ContentListComponent implements OnInit {
  contents: Content[] = [];
  courses: Course[] = [];
  chapters: Chapter[] = [];
  contentTypes: ContentType[] = [];
  loading = false;
  error = '';
  
  // Filtros
  selectedCourseId: number | null = null;
  selectedChapterId: number | null = null;
  selectedChapterName = '';
  
  // Iconos por tipo de contenido
  contentTypeIcons: { [key: number]: string } = {
    1: 'fas fa-video',        // VIDEO
    2: 'fas fa-file-pdf',      // PDF
    3: 'fas fa-file-powerpoint', // PRESENTATION
    4: 'fas fa-file-word',     // DOCUMENT
    5: 'fas fa-link'           // LINK
  };

  constructor(
    private contentService: ContentService,
    private chapterService: ChapterService,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadContentTypes();
    
    // Verificar si viene un chapterId por parámetro
    this.route.queryParams.subscribe(params => {
      if (params['chapterId']) {
        this.selectedChapterId = +params['chapterId'];
        this.loadContentsByChapter(this.selectedChapterId);
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

  loadContentTypes(): void {
    this.contentService.getContentTypes().subscribe({
      next: (data) => {
        this.contentTypes = data;
      },
      error: (error) => {
        console.error('Error al cargar tipos de contenido:', error);
      }
    });
  }

  onCourseChange(): void {
    this.selectedChapterId = null;
    this.contents = [];
    this.chapters = [];
    
    if (this.selectedCourseId) {
      this.chapterService.getChaptersByCourse(this.selectedCourseId).subscribe({
        next: (data) => {
          this.chapters = data.sort((a, b) => a.orderIndex - b.orderIndex);
        },
        error: (error) => {
          console.error('Error al cargar capítulos:', error);
        }
      });
    }
  }

  onChapterChange(): void {
    if (this.selectedChapterId) {
      this.loadContentsByChapter(this.selectedChapterId);
      // Actualizar URL sin recargar
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { chapterId: this.selectedChapterId },
        queryParamsHandling: 'merge'
      });
    } else {
      this.contents = [];
      this.selectedChapterName = '';
    }
  }

  loadContentsByChapter(chapterId: number): void {
    this.loading = true;
    this.error = '';
    
    const selectedChapter = this.chapters.find(c => c.id === chapterId);
    this.selectedChapterName = selectedChapter ? selectedChapter.title : '';
    
    this.contentService.getContentsByChapter(chapterId).subscribe({
      next: (data) => {
        this.contents = data.sort((a, b) => a.orderIndex - b.orderIndex);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los contenidos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  getContentTypeIcon(contentTypeId: number): string {
    return this.contentTypeIcons[contentTypeId] || 'fas fa-file';
  }

  getContentTypeName(contentTypeId: number): string {
    const type = this.contentTypes.find(t => t.id === contentTypeId);
    return type ? type.name : 'Desconocido';
  }

  createContent(): void {
    if (this.selectedChapterId) {
      this.router.navigate(['/contents/create'], { 
        queryParams: { chapterId: this.selectedChapterId } 
      });
    } else {
      this.router.navigate(['/contents/create']);
    }
  }

  editContent(content: Content): void {
    this.router.navigate(['/contents/edit', content.id]);
  }

  viewContent(content: Content): void {
    window.open(content.fileUrl, '_blank');
  }

  moveUp(content: Content): void {
    const index = this.contents.findIndex(c => c.id === content.id);
    if (index > 0) {
      const newOrder = [...this.contents];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      this.reorderContents(newOrder);
    }
  }

  moveDown(content: Content): void {
    const index = this.contents.findIndex(c => c.id === content.id);
    if (index < this.contents.length - 1) {
      const newOrder = [...this.contents];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      this.reorderContents(newOrder);
    }
  }

  reorderContents(newOrder: Content[]): void {
    if (!this.selectedChapterId) return;
    
    const contentIds = newOrder.map(c => c.id);
    this.contentService.reorderContents(this.selectedChapterId, contentIds).subscribe({
      next: () => {
        this.loadContentsByChapter(this.selectedChapterId!);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al reordenar contenidos';
        console.error('Error:', error);
      }
    });
  }

  deleteContent(content: Content): void {
    if (confirm(`¿Estás seguro de eliminar el contenido "${content.title || 'Sin título'}"?`)) {
      this.contentService.deleteContent(content.id).subscribe({
        next: () => {
          if (this.selectedChapterId) {
            this.loadContentsByChapter(this.selectedChapterId);
          }
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el contenido';
          console.error('Error:', error);
        }
      });
    }
  }

  formatFileSize(sizeMb?: number): string {
    if (!sizeMb) return '-';
    if (sizeMb < 1) return `${(sizeMb * 1024).toFixed(0)} KB`;
    return `${sizeMb.toFixed(2)} MB`;
  }
}