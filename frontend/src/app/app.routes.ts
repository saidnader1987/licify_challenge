import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/proyectos', pathMatch: 'full' },
  {
    path: 'proyectos',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./routes/project.routing').then((m) => m.PROJECT_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./routes/auth.routing').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/error/error.component').then(
        (m) => m.ErrorComponent
      ),
  },
];
