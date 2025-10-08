import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ModuleService, CreateModuleDto, UpdateModuleDto, Module } from '../../services/module.service';

@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './module-form.component.html',
  styleUrls: ['./module-form.component.css']
})
export class ModuleFormComponent implements OnInit {
  moduleForm: FormGroup;
  isEditMode = false;
  loading = false;
  error = '';
  moduleId: number | null = null;

  // Lista de iconos disponibles (Font Awesome)
  availableIcons = [
    { value: 'fas fa-code', label: 'Código', icon: 'fas fa-code' },
    { value: 'fas fa-laptop-code', label: 'Laptop Código', icon: 'fas fa-laptop-code' },
    { value: 'fas fa-database', label: 'Base de Datos', icon: 'fas fa-database' },
    { value: 'fas fa-server', label: 'Servidor', icon: 'fas fa-server' },
    { value: 'fas fa-mobile-alt', label: 'Móvil', icon: 'fas fa-mobile-alt' },
    { value: 'fas fa-paint-brush', label: 'Diseño', icon: 'fas fa-paint-brush' },
    { value: 'fas fa-chart-line', label: 'Análisis', icon: 'fas fa-chart-line' },
    { value: 'fas fa-shield-alt', label: 'Seguridad', icon: 'fas fa-shield-alt' },
    { value: 'fas fa-cloud', label: 'Nube', icon: 'fas fa-cloud' },
    { value: 'fas fa-brain', label: 'IA', icon: 'fas fa-brain' },
    { value: 'fas fa-folder', label: 'Carpeta', icon: 'fas fa-folder' }
  ];

  constructor(
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.moduleForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.moduleId = +params['id'];
        this.loadModule();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      icon: ['fas fa-folder']
    });
  }

  loadModule(): void {
    if (this.moduleId) {
      this.moduleService.getModuleById(this.moduleId).subscribe({
        next: (module: Module) => {
          this.moduleForm.patchValue({
            name: module.name,
            description: module.description || '',
            icon: module.icon || 'fas fa-folder'
          });
        },
        error: (error) => {
          this.error = 'Error al cargar el módulo';
          console.error('Error:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.moduleForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const formData = this.moduleForm.value;

    if (this.isEditMode && this.moduleId) {
      const updateData: UpdateModuleDto = {
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon
      };

      this.moduleService.updateModule(this.moduleId, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/modules']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al actualizar el módulo';
          console.error('Error:', error);
        }
      });
    } else {
      const createData: CreateModuleDto = {
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon
      };

      this.moduleService.createModule(createData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/modules']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al crear el módulo';
          console.error('Error:', error);
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.moduleForm.controls).forEach(key => {
      this.moduleForm.get(key)?.markAsTouched();
    });
  }
}