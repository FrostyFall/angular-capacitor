import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import * as moment from 'moment';
import { IAuthResponse } from './interfaces/auth-response.interface';
import { LocalStorageService } from '../shared/local-storage.service';
import { UsersService } from '../shared/users.service';
import { ApiService } from '../shared/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // http = inject(HttpClient);
  apiService = inject(ApiService);
  localStorageService = inject(LocalStorageService);
  usersService = inject(UsersService);

  isLoginBs$ = new BehaviorSubject<boolean>(true);
  isLogin$ = this.isLoginBs$.asObservable();

  login(email: string, password: string) {
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

  signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) {
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

  private setSession(authResult: IAuthResponse) {
    const expiresAt = moment().add(authResult.accessToken.expiresIn, 'second');
    this.localStorageService.set('id_token', authResult.accessToken.token);
    this.localStorageService.set(
      'expires_at',
      JSON.stringify(expiresAt.valueOf())
    );
    this.localStorageService.set(
      'user',
      JSON.stringify({
        id: authResult.id,
        firstName: authResult.firstName,
        lastName: authResult.lastName,
      })
    );
  }

  logout() {
    this.usersService.setUser(null);
    this.localStorageService.clear();
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = this.localStorageService.get('expires_at');

    if (!expiration) return null;

    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  setIsLogin(value: boolean) {
    this.isLoginBs$.next(value);
  }

  retrieveUserFromStorage() {
    const userStorage = this.localStorageService.get('user');

    if (!userStorage) return;

    const { id, firstName, lastName } = JSON.parse(userStorage);

    this.usersService.setUser({ id, firstName, lastName, type: 'user' });
  }
}
