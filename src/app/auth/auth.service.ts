import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import * as moment from 'moment';

import { environment } from '../../environments/environment.development';
import { SessionStorageService } from '../shared/session-storage.service';
import { UsersService } from '../shared/users.service';
import { ApiService } from '../shared/api.service';
import { IAuthResponse } from './interfaces/auth-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly usersService = inject(UsersService);

  private isLoginBs$ = new BehaviorSubject<boolean>(true);
  public isLogin$ = this.isLoginBs$.asObservable();

  public login(email: string, password: string): Observable<IAuthResponse> {
    return this.apiService
      .post<IAuthResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => this.setSession(res)),
        shareReplay()
      );
  }

  public signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirm: string
  ): Observable<IAuthResponse> {
    return this.apiService
      .post<IAuthResponse>(`${environment.apiUrl}/auth/signup`, {
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
      })
      .pipe(
        tap((res) => this.setSession(res)),
        shareReplay()
      );
  }

  private setSession(authResult: IAuthResponse): void {
    const expiresAt = moment().add(authResult.accessToken.expiresIn, 'second');
    this.sessionStorageService.set('id_token', authResult.accessToken.token);
    this.sessionStorageService.set(
      'expires_at',
      JSON.stringify(expiresAt.valueOf())
    );
    this.sessionStorageService.set(
      'user',
      JSON.stringify({
        id: authResult.id,
        firstName: authResult.firstName,
        lastName: authResult.lastName,
      })
    );
  }

  public logout(): void {
    this.usersService.setUser(null);
    this.sessionStorageService.clear();
  }

  public isLoggedIn(): boolean {
    return moment().isBefore(this.getExpiration());
  }

  public isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }

  public getExpiration(): moment.Moment | null {
    const expiration = this.sessionStorageService.get('expires_at');

    if (!expiration) return null;

    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  public setIsLogin(value: boolean): void {
    this.isLoginBs$.next(value);
  }

  public retrieveUserFromStorage(): void {
    const userStorage = this.sessionStorageService.get('user');

    if (!userStorage) return;

    const { id, firstName, lastName } = JSON.parse(userStorage);

    this.usersService.setUser({ id, firstName, lastName, type: 'user' });
  }
}
