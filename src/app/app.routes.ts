import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(c => c.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path: 'teams',
    canActivate: [authGuard],
    loadComponent: () => import('./components/teams/teams.component').then(c => c.TeamsComponent)
  },
  {
    path: 'teams/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/team-details/team-details.component').then(c => c.TeamDetailsComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
      },
      {
        path: 'domains',
        loadComponent: () => import('./components/admin/domain-management/domain-management.component').then(c => c.DomainManagementComponent)
      },
      {
        path: 'teams',
        loadComponent: () => import('./components/admin/team-management/team-management.component').then(c => c.TeamManagementComponent)
      }
    ]
  },
  {
    path: 'activities/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/activity-details/activity-details.component').then(c => c.ActivityDetailsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
