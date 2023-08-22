import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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

import { UsersService } from 'src/app/shared/users.service';
import { AuthService } from '../auth.service';
import { ISignUpForm } from '../interfaces/signup-form.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  public form!: FormGroup<ISignUpForm>;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
        ],
      ],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    });
  }

  public onLogin(): void {
    this.authService.setIsLogin(true);
  }

  public onSignUp(): void {
    const { firstName, lastName, email, password, passwordConfirm } =
      this.form.getRawValue();
    if (password !== passwordConfirm) {
      console.error('Passwords do not match');
      return;
    }

    this.authService
      .signUp(firstName, lastName, email, password, passwordConfirm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (val) => {
          const { accessToken, ...userData } = val;
          this.usersService.setUser({ ...userData, type: 'user' });
          this.router.navigate(['']);
        },
        error: () => {
          console.error('Failed to sign up');
        },
      });
  }

  public onToDashboard(): void {
    this.router.navigate(['']);
  }
}
