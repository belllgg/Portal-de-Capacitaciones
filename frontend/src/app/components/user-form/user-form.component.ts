import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService, CreateUserDto, UpdateUserDto, User } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  loading = false;
  error = '';
  userEmail = '';

  roles = [
    { value: 1, label: 'ADMIN' },
    { value: 2, label: 'COLABORATOR' }
  ];

  states = [
    { value: 1, label: 'ACTIVE' },
    { value: 2, label: 'INACTIVE' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['email']) {
        this.isEditMode = true;
        this.userEmail = params['email'];

        // Quitar validación requerida de password en edición
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();

        this.userService.getAllUsers().subscribe((users: User[]) => {
          const user = users.find(u => u.email === this.userEmail);
          if (user) {
            // Usar setTimeout para asegurar que el DOM esté listo
            setTimeout(() => {
              this.userForm.patchValue({
                email: user.email,
                name: user.name,
               role: user.role?.id,    
               state: user.state?.id  
              });
            }, 0);
          }
        });
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [null, Validators.required],
      state: [null]
    });
  }

  onSubmit(): void {
    if (!this.userForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const formData = this.userForm.value;

    if (this.isEditMode) {
      const updateData: UpdateUserDto = {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        roleId: typeof formData.role === 'number' ? formData.role : undefined,
        stateId: Number(formData.state)
      };

      this.userService.updateUser(this.userEmail, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al actualizar el usuario';
          console.error('Error:', error);
        }
      });
    } else {
      const createData: CreateUserDto = {
        email: formData.email,
        name: formData.name.trim(),
        password: formData.password,
        roleId: Number(formData.role),
        stateId: Number(formData.state)
      };

      this.userService.register(createData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al crear el usuario';
          console.error('Error:', error);
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  get email() { return this.userForm.get('email'); }
  get name() { return this.userForm.get('name'); }
  get password() { return this.userForm.get('password'); }
  get role() { return this.userForm.get('role'); }
}