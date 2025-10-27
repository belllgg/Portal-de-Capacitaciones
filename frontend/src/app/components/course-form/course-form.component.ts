import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService, CreateCourseDto, UpdateCourseDto, Course } from '../../services/course.service';
import { ModuleService, Module } from '../../services/module.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css']
})
export class CourseFormComponent implements OnInit {
  courseForm: FormGroup;
  isEditMode = false;
  loading = false;
  error = '';
  courseId: number | null = null;
  modules: Module[] = [];

  
states = [
  { id: 1, name: 'Borrador' },   // DRAFT
  { id: 2, name: 'Activo' },     // ACTIVE
  { id: 3, name: 'Inactivo' },   // INACTIVE
  { id: 4, name: 'Archivado' }   // ARCHIVED
];


  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private moduleService: ModuleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.courseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadModules();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.courseId = +params['id'];
        this.loadCourse();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      moduleId: [null, Validators.required],
      instructorName: ['', Validators.maxLength(100)],
      thumbnailUrl: [''],
      durationHours: [null, [Validators.min(0.1)]],
      stateId: [3] 
    });
  }

  loadModules(): void {
    this.moduleService.getAllModules().subscribe({
      next: (data) => {
        this.modules = data;
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      }
    });
  }

  loadCourse(): void {
    if (this.courseId) {
      this.courseService.getCourseById(this.courseId).subscribe({
        next: (course: Course) => {
          this.courseForm.patchValue({
            title: course.title,
            description: course.description || '',
            moduleId: course.moduleId,
            instructorName: course.instructorName || '',
            thumbnailUrl: course.thumbnailUrl || '',
            durationHours: course.durationHours || null,
            stateId: course.stateId
          });
        },
        error: (error) => {
          this.error = 'Error al cargar el curso';
          console.error('Error:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.courseForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const formData = this.courseForm.value;
formData.moduleId = Number(formData.moduleId);
formData.stateId = Number(formData.stateId);

    const cleanedData = {
      ...formData,
      description: formData.description || undefined,
      instructorName: formData.instructorName || undefined,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      durationHours: formData.durationHours || undefined
    };

if (this.isEditMode && this.courseId) {
  const updateData: UpdateCourseDto = {
    ...cleanedData,
    moduleId: Number(cleanedData.moduleId),
    durationHours: cleanedData.durationHours ? Number(cleanedData.durationHours) : undefined,
    stateId: Number(cleanedData.stateId)
  };


      this.courseService.updateCourse(this.courseId, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al actualizar el curso';
          console.error('Error:', error);
        }
      });
    } else {
      const createData: CreateCourseDto = cleanedData;

      this.courseService.createCourse(createData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al crear el curso';
          console.error('Error:', error);
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.courseForm.controls).forEach(key => {
      this.courseForm.get(key)?.markAsTouched();
    });
  }

  get title() { return this.courseForm.get('title'); }
  get moduleId() { return this.courseForm.get('moduleId'); }
  get instructorName() { return this.courseForm.get('instructorName'); }
  get durationHours() { return this.courseForm.get('durationHours'); }
}