import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContentService, CreateContentDto, UpdateContentDto, Content, ContentType } from '../../services/content.service';
import { ChapterService, Chapter } from '../../services/chapter.service';
import { CourseService, Course } from '../../services/course.service';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './content-form.component.html',
  styleUrls: ['./content-form.component.css']
})
export class ContentFormComponent implements OnInit {
  contentForm: FormGroup;
  isEditMode = false;
  loading = false;
  error = '';
  contentId: number | null = null;
  courses: Course[] = [];
  chapters: Chapter[] = [];
  contentTypes: ContentType[] = [];
  preselectedChapterId: number | null = null;
  
  contentTypeIcons: { [key: number]: string } = {
    1: 'fas fa-video',
    2: 'fas fa-file-pdf',
    3: 'fas fa-file-powerpoint',
    4: 'fas fa-file-word',
    5: 'fas fa-link'
  };

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService,
    private chapterService: ChapterService,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.contentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadContentTypes();
    
    this.route.queryParams.subscribe(params => {
      if (params['chapterId']) {
        this.preselectedChapterId = +params['chapterId'];
        this.contentForm.patchValue({ chapterId: this.preselectedChapterId });
        this.loadChapterInfo(this.preselectedChapterId);
      }
    });
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.contentId = +params['id'];
        this.loadContent();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      courseId: [null, Validators.required],
      chapterId: [null, Validators.required],
      contentTypeId: [1, Validators.required],
      title: ['', Validators.maxLength(255)],
      fileUrl: ['', [Validators.required, Validators.maxLength(500)]],
      fileSizeMb: [null, Validators.min(0)],
      orderIndex: [1, [Validators.required, Validators.min(1)]]
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
    const courseId = this.contentForm.get('courseId')?.value;
    this.contentForm.patchValue({ chapterId: null });
    this.chapters = [];
    
    if (courseId) {
      this.chapterService.getChaptersByCourse(courseId).subscribe({
        next: (data) => {
          this.chapters = data.sort((a, b) => a.orderIndex - b.orderIndex);
        },
        error: (error) => {
          console.error('Error al cargar capítulos:', error);
        }
      });
    }
  }

  loadChapterInfo(chapterId: number): void {
    this.chapterService.getChapterById(chapterId).subscribe({
      next: (chapter) => {
        this.contentForm.patchValue({ courseId: chapter.courseId });
        this.onCourseChange();
      },
      error: (error) => {
        console.error('Error al cargar información del capítulo:', error);
      }
    });
  }

  loadContent(): void {
    if (this.contentId) {
      this.contentService.getContentById(this.contentId).subscribe({
        next: (content: Content) => {
          if (content.chapter) {
            this.contentForm.patchValue({ courseId: content.chapter.courseId });
            this.onCourseChange();
          }
          
          this.contentForm.patchValue({
            chapterId: content.chapterId,
            contentTypeId: content.contentTypeId,
            title: content.title || '',
            fileUrl: content.fileUrl,
            fileSizeMb: content.fileSizeMb || null,
            orderIndex: content.orderIndex
          });
        },
        error: (error) => {
          this.error = 'Error al cargar el contenido';
          console.error('Error:', error);
        }
      });
    }
  }

  getContentTypeIcon(contentTypeId: number): string {
    return this.contentTypeIcons[contentTypeId] || 'fas fa-file';
  }

  onSubmit(): void {
    if (!this.contentForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const formData = this.contentForm.value;

    const cleanedData = {
      chapterId: Number(formData.chapterId),
      contentTypeId: Number(formData.contentTypeId),
      title: formData.title || undefined,
      fileUrl: formData.fileUrl,
      fileSizeMb: formData.fileSizeMb ? Number(formData.fileSizeMb) : undefined,
      orderIndex: Number(formData.orderIndex)
    };

    if (this.isEditMode && this.contentId) {
      const updateData: UpdateContentDto = {
        title: cleanedData.title,
        fileUrl: cleanedData.fileUrl,
        fileSizeMb: cleanedData.fileSizeMb,
        orderIndex: cleanedData.orderIndex,
        contentTypeId: cleanedData.contentTypeId
      };

      this.contentService.updateContent(this.contentId, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/contents'], { 
            queryParams: { chapterId: formData.chapterId } 
          });
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al actualizar el contenido';
          console.error('Error:', error);
        }
      });
    } else {
      const createData: CreateContentDto = {
        chapterId: cleanedData.chapterId,
        contentTypeId: cleanedData.contentTypeId,
        fileUrl: cleanedData.fileUrl,
        orderIndex: cleanedData.orderIndex,
        title: cleanedData.title,
        fileSizeMb: cleanedData.fileSizeMb
      };

      this.contentService.createContent(createData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/contents'], { 
            queryParams: { chapterId: formData.chapterId } 
          });
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al crear el contenido';
          console.error('Error:', error);
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.contentForm.controls).forEach(key => {
      this.contentForm.get(key)?.markAsTouched();
    });
  }

  get courseId() { return this.contentForm.get('courseId'); }
  get chapterId() { return this.contentForm.get('chapterId'); }
  get contentTypeId() { return this.contentForm.get('contentTypeId'); }
  get title() { return this.contentForm.get('title'); }
  get fileUrl() { return this.contentForm.get('fileUrl'); }
  get fileSizeMb() { return this.contentForm.get('fileSizeMb'); }
  get orderIndex() { return this.contentForm.get('orderIndex'); }
}