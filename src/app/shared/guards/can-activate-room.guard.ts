import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UsersService } from '../users.service';
import { AuthService } from 'src/app/auth/auth.service';

export const canActivateRoomGuard: CanActivateFn = () => {
  const userService = inject(UsersService);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    authService.retrieveUserFromStorage();
  }

  const user = userService.getUser();

  if (!user) {
    alert('User is not logged in');
    return false;
  }

  return true;
};
