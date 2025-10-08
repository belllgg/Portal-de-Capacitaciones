import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.error = 'No autorizado. Por favor inicie sesión.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Error al cargar los usuarios: ' + (error.error?.message || error.message);
        }
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  editUser(user: User): void {
    this.router.navigate(['/users/edit', user.email]);
  }

  deleteUser(user: User): void {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.name}?`)) {
      this.userService.deleteUser(user.email).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          alert('Error al eliminar el usuario: ' + (error.error?.message || error.message));
          console.error('Error eliminando usuario:', error);
        }
      });
    }
  }
}