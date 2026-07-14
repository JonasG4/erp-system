import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'erp-system-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<ThemeMode>(this.getInitialTheme());

  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    this.applyTheme(this.theme());
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.isDark() ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return prefersDarkMode ? 'dark' : 'light';
  }

  private saveTheme(theme: ThemeMode): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  private applyTheme(theme: ThemeMode): void {
    const htmlElement = this.document.documentElement;

    htmlElement.classList.toggle('dark', theme === 'dark');
    htmlElement.setAttribute('data-theme', theme);
  }
}
