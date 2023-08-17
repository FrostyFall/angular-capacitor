import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { canActivateRoomGuard } from './shared/guards/can-activate-room.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'rooms/:room',
    canActivate: [canActivateRoomGuard],
    loadComponent: () =>
      import('./room/room.component').then((m) => m.RoomComponent),
  },
  { path: '**', redirectTo: '' },
];
