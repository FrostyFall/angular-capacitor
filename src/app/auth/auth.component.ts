import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, LoginComponent, SignupComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);

  isLogin$!: Observable<boolean>;

  ngOnInit(): void {
    console.log(this.authService.isLoginBs$.value);
    this.isLogin$ = this.authService.isLogin$;
  }

  ngOnDestroy(): void {
    console.log('dick');
    this.authService.setIsLogin(true);
  }
}
