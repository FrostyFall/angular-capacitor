import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { ILoginForm } from '../interfaces/login-form.interface';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/shared/users.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  usersService = inject(UsersService);

  form!: FormGroup<ILoginForm>;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    const { email, password } = this.form.getRawValue();
    this.authService.login(email, password).subscribe({
      next: (val) => {
        const { accessToken, ...userData } = val;
        this.usersService.setUser({ ...userData, type: 'user' });
        this.router.navigate(['']);
      },
      error: () => {
        console.error('Failed to login');
      },
    });
  }

  onSignUp() {
    this.authService.setIsLogin(false);
  }

  onToDashboard() {
    this.router.navigate(['']);
  }
}
