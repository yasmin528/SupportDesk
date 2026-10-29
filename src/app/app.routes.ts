import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Log in · SupportDesk',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    title: 'Sign up · SupportDesk',
    loadComponent: () => import('./features/auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: '',
        title: 'Overview · SupportDesk',
        loadComponent: () =>
          import('./features/dashboard/overview/overview.component').then((m) => m.OverviewComponent),
      },
      {
        path: 'tickets',
        title: 'Tickets · SupportDesk',
        loadComponent: () =>
          import('./features/dashboard/tickets/ticket-list/ticket-list.component').then(
            (m) => m.TicketListComponent,
          ),
      },
      {
        path: 'tickets/:id',
        title: 'Ticket · SupportDesk',
        loadComponent: () =>
          import('./features/dashboard/tickets/ticket-detail/ticket-detail.component').then(
            (m) => m.TicketDetailComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
