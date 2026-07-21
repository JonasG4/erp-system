import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  type LucideIcon,
  LucideMail,
  LucideShieldCheck,
  LucideKeyRound,
  LucideCheck,
  LucideChevronLeft,
  LucideDynamicIcon,
} from '@lucide/angular';
import { AuthService } from '../../../core/auth/auth';
import {
  passwordMatchValidator,
  strongPasswordValidator,
} from '../../../shared/validators/password.validators';

type RecoveryStep = 'email' | 'code' | 'password' | 'success';

interface RecoveryStepperItem {
  key: Exclude<RecoveryStep, 'success'>;
  label: string;
  description: string;
  icon: LucideIcon | string;
}

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, LucideDynamicIcon, LucideChevronLeft],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<RecoveryStep>('email');
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  readonly resetToken = signal<string | null>(null);
  readonly resendSeconds = signal(0);

  private resendIntervalId: number | null = null;

  readonly canResendCode = computed(() => this.resendSeconds() === 0);

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [passwordMatchValidator('newPassword', 'confirmPassword')],
    },
  );

  readonly completedIcon = LucideCheck;

  readonly recoverySteps: RecoveryStepperItem[] = [
    {
      key: 'email',
      label: 'Correo',
      description: 'Solicitar código',
      icon: LucideMail,
    },
    {
      key: 'code',
      label: 'Código',
      description: 'Verificar acceso',
      icon: LucideKeyRound,
    },
    {
      key: 'password',
      label: 'Contraseña',
      description: 'Actualizar clave',
      icon: LucideShieldCheck,
    },
  ];

  readonly currentStepIndex = computed(() => {
    if (this.step() === 'email') return 0;
    if (this.step() === 'code') return 1;
    if (this.step() === 'password') return 2;

    return this.recoverySteps.length;
  });

  isStepperItemActive(index: number): boolean {
    return this.currentStepIndex() === index;
  }

  isStepperItemCompleted(index: number): boolean {
    return this.currentStepIndex() > index;
  }

  getStepperCircleClasses(index: number): string {
    const baseClasses =
      'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shadow-lg transition-all duration-300';

    if (this.isStepperItemCompleted(index)) {
      return `${baseClasses} bg-indigo-500 text-white shadow-indigo-500/30 dark:bg-indigo-500`;
    }

    if (this.isStepperItemActive(index)) {
      return `${baseClasses} bg-white scale-125 text-indigo-600 ring-2 ring-indigo-500/80 shadow-indigo-500/30 dark:bg-zinc-800 dark:text-indigo-500 dark:ring-indigo-400`;
    }

    return `${baseClasses} bg-white text-zinc-400 ring-2 ring-zinc-200 shadow-zinc-200/70 dark:bg-zinc-800 dark:text-zinc-500 dark:ring-zinc-700 dark:shadow-black/20`;
  }

  getStepperTextClasses(index: number): string {
    if (this.isStepperItemActive(index) || this.isStepperItemCompleted(index)) {
      return 'text-indigo-600 dark:text-indigo-200';
    }

    return 'text-zinc-500 dark:text-zinc-400';
  }

  getConnectorClasses(index: number): string {
    const baseClasses = 'absolute left-1/2 top-[15px] h-0.5 w-full transition-colors duration-300';

    if (this.currentStepIndex() > index) {
      return `${baseClasses} bg-indigo-500`;
    }

    return `${baseClasses} bg-zinc-200 dark:bg-zinc-700`;
  }

  requestCode(): void {
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.requestPasswordReset(this.emailForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set('code');
        this.startResendCountdown();
      },
      error: () => {
        this.isLoading.set(false);
        this.step.set('code');
        this.startResendCountdown();
      },
    });
  }

  verifyCode(): void {
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const email = this.emailForm.controls.email.value;
    const code = this.codeForm.controls.code.value;

    this.authService.verifyResetCode({ email, code }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.resetToken.set(response.resetToken);
        this.step.set('password');
      },
      error: (error: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  updatePassword(): void {
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const resetToken = this.resetToken();

    if (!resetToken) {
      this.errorMessage.set('La solicitud de recuperación ya no es válida.');
      this.step.set('email');
      return;
    }

    this.isLoading.set(true);

    const { newPassword } = this.passwordForm.getRawValue();

    this.authService.resetPassword({ resetToken, newPassword }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.clearSensitiveState();
        this.step.set('success');
      },
      error: (error: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  resendCode(): void {
    if (!this.canResendCode()) {
      return;
    }

    this.requestCode();
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  private startResendCountdown(): void {
    this.clearResendCountdown();

    this.resendSeconds.set(60);

    this.resendIntervalId = window.setInterval(() => {
      const current = this.resendSeconds();

      if (current <= 1) {
        this.clearResendCountdown();
        return;
      }

      this.resendSeconds.set(current - 1);
    }, 1000);
  }

  private clearResendCountdown(): void {
    if (this.resendIntervalId !== null) {
      window.clearInterval(this.resendIntervalId);
      this.resendIntervalId = null;
    }

    this.resendSeconds.set(0);
  }

  private clearSensitiveState(): void {
    this.resetToken.set(null);
    this.codeForm.reset();
    this.passwordForm.reset();
    this.clearResendCountdown();
  }
}
