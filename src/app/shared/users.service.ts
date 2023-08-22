import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { IUser } from './interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private userBs = new BehaviorSubject<IUser | null>(null);
  public user$ = this.userBs.asObservable();

  public setUser(user: IUser | null): void {
    this.userBs.next(user);
  }

  public getUser(): IUser | null {
    return this.userBs.getValue();
  }
}
