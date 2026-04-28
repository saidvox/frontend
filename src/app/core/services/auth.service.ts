import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { apiUrl } from '../config/api.config';
import { AuthResponse, LoginRequest } from '../models/auth.model';

const TOKEN_KEY = 'cafe_de_barrio_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly tokenState = signal<string | null>(this.readToken());

  readonly token = this.tokenState.asReadonly();
  readonly isAuthenticated = () => Boolean(this.tokenState());

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(apiUrl('/auth/login'), request).pipe(
      tap((response) => {
        this.setToken(response.accessToken);
      }),
    );
  }

  logout(): void {
    this.setToken(null);
  }

  private readToken(): string | null {
    if (!this.browser) {
      return null;
    }

    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string | null): void {
    this.tokenState.set(token);

    if (!this.browser) {
      return;
    }

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
  }
}
