import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChapterService, CreateChapterDto, UpdateChapterDto, Chapter } from '../../services/chapter.service';
import { CourseService, Course } from '../../services/course.service';

@Component({
  selector: 'app-chapter-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './chapter-form.component.html',
  styleUrls: ['./chapter-form.component.css']
})
export class ChapterFormComponent implements OnInit {
  chapterForm: FormGroup;
  isEditMode = false;
  loading = false;
  error = '';
  chapterId: number | null = null;
  courses: Course[] = [];
  preselectedCourseId: number | null = null;

  // Estados disponibles
  states = [
    { id: 1, name: 'DRAFT' },
    { id: 2, name: 'PUBLISHED' },
    { id: 3, name: 'ARCHIVED' }
  ];

  constructor(
    private fb: FormBuilder,
    private chapterService: ChapterService,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.chapterForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCourses();
    
    this.route.queryParams.subscribe(params => {
      if (params['courseId']) {
        this.preselectedCourseId = +params['courseId'];
        this.chapterForm.patchValue({ courseId: this.preselectedCourseId });
      }
    });
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.chapterId = +params['id'];
        this.loadChapter();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      courseId: [null, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      orderIndex: [1, [Validators.required, Validators.min(1)]],
      durationMinutes: [null, Validators.min(1)],
      stateId: [3] 
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

  loadChapter(): void {
    if (this.chapterId) {
      this.chapterService.getChapterById(this.chapterId).subscribe({
        next: (chapter: Chapter) => {
          this.chapterForm.patchValue({
            courseId: chapter.courseId,
            title: chapter.title,
            description: chapter.description || '',
            orderIndex: chapter.orderIndex,
            durationMinutes: chapter.durationMinutes || null,
            stateId: chapter.stateId
          });
        },
        error: (error) => {
          this.error = 'Error al cargar el capítulo';
          console.error('Error:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.chapterForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const formData = this.chapterForm.value;

    formData.courseId = Number(formData.courseId);
    formData.stateId = Number(formData.stateId);

    const cleanedData = {
      ...formData,
      description: formData.description || undefined,
      durationMinutes: formData.durationMinutes || undefined
    };

    if (this.isEditMode && this.chapterId) {
      const updateData: UpdateChapterDto = {
        title: cleanedData.title,
        description: cleanedData.description,
        orderIndex: cleanedData.orderIndex,
        durationMinutes: cleanedData.durationMinutes,
        stateId: cleanedData.stateId
      };

      this.chapterService.updateChapter(this.chapterId, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/chapters'], { 
            queryParams: { courseId: formData.courseId } 
          });
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al actualizar el capítulo';
          console.error('Error:', error);
        }
      });
    } else {
      const createData: CreateChapterDto = cleanedData;

      this.chapterService.createChapter(createData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/chapters'], { 
            queryParams: { courseId: formData.courseId } 
          });
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al crear el capítulo';
          console.error('Error:', error);
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.chapterForm.controls).forEach(key => {
      this.chapterForm.get(key)?.markAsTouched();
    });
  }

  get courseId() { return this.chapterForm.get('courseId'); }
  get title() { return this.chapterForm.get('title'); }
  get orderIndex() { return this.chapterForm.get('orderIndex'); }
  get durationMinutes() { return this.chapterForm.get('durationMinutes'); }
}
