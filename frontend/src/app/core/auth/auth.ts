import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, of, tap, throwError } from 'rxjs';
import { AuthSession, AuthUser, LoginRequest } from './auth.models';

const AUTH_STORAGE_KEY = 'erp-system-auth-session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly session = signal<AuthSession | null>(this.getStoredSession());

  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly isAuthenticated = computed(() => !!this.session()?.accessToken);

  constructor(private readonly router: Router) {}

  login(request: LoginRequest): Observable<AuthSession> {
    /*
     * Usuario de prueba:
     * email: admin@bookstore.com
     * password: Admin123*
     */

    const isValidUser =
      request.email.trim().toLowerCase() === 'admin@bookstore.com' &&
      request.password === 'Admin123*';

    if (!isValidUser) {
      return throwError(() => new Error('Credenciales inválidas.'));
    }

    const mockUser: AuthUser = {
      id: '1',
      fullName: 'Administrador',
      email: 'admin@bookstore.com',
      roles: ['Admin'],
      permissions: [
        'dashboard.view',
        'products.view',
        'products.create',
        'products.update',
        'sales.view',
        'sales.create',
        'inventory.view',
        'employees.view',
        'attendance.view',
        'reports.view',
        'users.manage',
        'roles.manage',
        'company.update',
      ],
    };

    const mockSession: AuthSession = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: mockUser,
    };

    return of(mockSession).pipe(
      delay(500),
      tap((session) => this.setSession(session)),
    );
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.session.set(null);
    this.router.navigateByUrl('/login');
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();

    if (!user) {
      return false;
    }

    return user.permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();

    if (!user) {
      return false;
    }

    return user.roles.includes(role);
  }

  private setSession(session: AuthSession): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    this.session.set(session);
  }

  private getStoredSession(): AuthSession | null {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}
