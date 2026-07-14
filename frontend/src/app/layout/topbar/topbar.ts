import { Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
}
