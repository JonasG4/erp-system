import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { Login } from './features/auth/login/login';
import { DashboardHome } from './features/dashboard/dashboard-home/dashboard-home';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        component: DashboardHome,
      },
    ],
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: Login,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
