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
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { ILoginForm } from '../interfaces/login-form.interface';
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
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);

  public form!: FormGroup<ILoginForm>;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  public onLogin(): void {
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

  public onSignUp(): void {
    this.authService.setIsLogin(false);
  }

  public onToDashboard(): void {
    this.router.navigate(['']);
  }
}
