import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContentService, Content, ContentType } from '../../services/content.service';
import { ChapterService, Chapter } from '../../services/chapter.service';
import { CourseService, Course } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';

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
  
  selectedCourseId: number | null = null;
  selectedChapterId: number | null = null;
  selectedChapterName = '';
  
  viewingContent: Content | null = null;
  safeUrl: SafeResourceUrl | null = null;
  
  contentTypeIcons: { [key: number]: string } = {
    1: 'fas fa-video',
    2: 'fas fa-file-pdf',
    3: 'fas fa-file-powerpoint',
    4: 'fas fa-file-word',
    5: 'fas fa-link'
  };

  constructor(
    private contentService: ContentService,
    private chapterService: ChapterService,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadContentTypes();
    
    this.route.queryParams.subscribe(params => {
      if (params['courseId']) {
        this.selectedCourseId = +params['courseId'];
        this.onCourseChange();
      }
      
      if (params['chapterId']) {
        this.selectedChapterId = +params['chapterId'];
        setTimeout(() => {
          this.loadContentsByChapter(this.selectedChapterId!);
        }, 500);
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
    this.closeViewer();
    
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
    this.closeViewer();
    if (this.selectedChapterId) {
      this.loadContentsByChapter(this.selectedChapterId);
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
        console.log('Contenidos recibidos:', data); // Para debug
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
    this.viewingContent = content;
    
    let url = content.fileUrl;
    
    if (this.isYouTubeUrl(url)) {
      url = this.convertToYouTubeEmbed(url);
    }
    
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    
    setTimeout(() => {
      document.getElementById('content-viewer')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  }

  closeViewer(): void {
    this.viewingContent = null;
    this.safeUrl = null;
  }

  isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  convertToYouTubeEmbed(url: string): string {
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  }

  isVideoContent(content: Content): boolean {
    if (content.contentTypeId === 1) return true;
    
    const url = content.fileUrl.toLowerCase();
    return url.endsWith('.mp4') || 
           url.endsWith('.webm') || 
           url.endsWith('.ogg') ||
           url.endsWith('.mov') ||
           url.includes('youtube.com') || 
           url.includes('youtu.be') ||
           url.includes('vimeo.com');
  }

  isPdfContent(content: Content): boolean {
    if (content.contentTypeId === 2) return true;
    
    const url = content.fileUrl.toLowerCase();
    return url.endsWith('.pdf') || url.includes('.pdf');
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

  goToChapters(): void {
    if (this.selectedCourseId) {
      this.router.navigate(['/chapters'], {
        queryParams: { courseId: this.selectedCourseId }
      });
    } else {
      this.router.navigate(['/chapters']);
    }
  }

  deleteContent(content: Content): void {
    if (confirm(`¿Estás seguro de eliminar el contenido "${content.title || 'Sin título'}"?`)) {
      this.contentService.deleteContent(content.id).subscribe({
        next: () => {
          if (this.selectedChapterId) {
            this.loadContentsByChapter(this.selectedChapterId);
          }
          if (this.viewingContent?.id === content.id) {
            this.closeViewer();
          }
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el contenido';
          console.error('Error:', error);
        }
      });
    }
  }

  formatFileSize(sizeMb: any): string {
    if (sizeMb === null || sizeMb === undefined || sizeMb === '') {
      return '-';
    }
    
    let size: number;
    if (typeof sizeMb === 'string') {
      size = parseFloat(sizeMb);
    } else {
      size = Number(sizeMb);
    }
    
    if (isNaN(size) || !isFinite(size)) {
      return '-';
    }
    
    if (size === 0) {
      return '0 MB';
    }
    

    if (size < 1) {
      return `${(size * 1024).toFixed(0)} KB`;
    }
    
    return `${size.toFixed(2)} MB`;
  }
}