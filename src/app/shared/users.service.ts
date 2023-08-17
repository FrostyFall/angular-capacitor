import { Injectable, inject } from '@angular/core';
import { IUser } from './interfaces/user.interface';
import { BehaviorSubject } from 'rxjs';
import { IGuestUser } from './interfaces/guest-user.interface';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private storageService = inject(LocalStorageService);
  private userBs = new BehaviorSubject<IUser | null>(null);
  user$ = this.userBs.asObservable();

  setUser(user: IUser | null) {
    this.userBs.next(user);
  }

  getUser(): IUser | null {
    return this.userBs.getValue();
  }
}
