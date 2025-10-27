import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ModuleListComponent } from './components/module-list/module-list.component';
import { ModuleFormComponent } from './components/module-form/module-form.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { ChapterListComponent } from './components/chapter-list/chapter-list.component';
import { ChapterFormComponent } from './components/chapter-form/chapter-form.component';
import { ContentListComponent } from './components/content-list/content-list.component';
import { ContentFormComponent } from './components/content-form/content-form.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ModulesProgressComponent } from './components/module-progress/modules-progress.component';
import { CoursesCompletedComponent } from './components/courses-completed/courses-completed.component';
import { CourseProgressDetailComponent } from './components/course-progress-detail/course-progress-detail.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  
  { path: 'login', component: LoginComponent },
  
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  

  { 
    path: 'progress/completed', 
    component: CoursesCompletedComponent,
    canActivate: [AuthGuard],
    data: { title: 'Cursos Completados' }
  },
  { 
    path: 'progress/course/:courseId', 
    component: CourseProgressDetailComponent,
    canActivate: [AuthGuard],
    data: { title: 'Detalle del Progreso' }
  },
  { 
    path: 'progress', 
    redirectTo: 'progress/dashboard',
    pathMatch: 'full'
  },

  { 
    path: 'users', 
    component: UserListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'users/create', 
    component: UserFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'users/edit/:email', 
    component: UserFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  { 
    path: 'modules', 
    component: ModuleListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'modules/create', 
    component: ModuleFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  { 
    path: 'modules/edit/:id', 
    component: ModuleFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
{
    path: 'progress/modules',
    component: ModulesProgressComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }

  },
  { 
    path: 'courses', 
    component: CourseListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  { 
    path: 'courses/create', 
    component: CourseFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  { 
    path: 'courses/edit/:id', 
    component: CourseFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },

  { 
    path: 'chapters', 
    component: ChapterListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  { 
    path: 'chapters/create', 
    component: ChapterFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  { 
    path: 'chapters/edit/:id', 
    component: ChapterFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  

  { 
    path: 'contents', 
    component: ContentListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  { 
    path: 'contents/create', 
    component: ContentFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  { 
    path: 'contents/edit/:id', 
    component: ContentFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COLLABORATOR'] }
  },
  
  { path: '**', redirectTo: '' }
];