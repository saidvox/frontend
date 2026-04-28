import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const CUSTOMER_SESSION_KEY = 'cafe_de_barrio_customer_session';
const CUSTOMER_USERS_KEY = 'cafe_de_barrio_customer_users';

export interface CustomerSession {
  nombre: string;
  email: string;
}

interface CustomerUser extends CustomerSession {
  password: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly sessionState = signal<CustomerSession | null>(this.readSession());

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = () => Boolean(this.sessionState());

  login(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.readUsers().find((candidate) => candidate.email === normalizedEmail);

    if (!user || user.password !== password) {
      return false;
    }

    this.setSession({ nombre: user.nombre, email: user.email });
    return true;
  }

  register(nombre: string, email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.readUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      return false;
    }

    const user: CustomerUser = {
      nombre: nombre.trim(),
      email: normalizedEmail,
      password,
    };

    this.writeUsers([...users, user]);
    this.setSession({ nombre: user.nombre, email: user.email });
    return true;
  }

  logout(): void {
    this.setSession(null);
  }

  private readSession(): CustomerSession | null {
    if (!this.browser) {
      return null;
    }

    const rawSession = localStorage.getItem(CUSTOMER_SESSION_KEY);
    return rawSession ? JSON.parse(rawSession) as CustomerSession : null;
  }

  private setSession(session: CustomerSession | null): void {
    this.sessionState.set(session);

    if (!this.browser) {
      return;
    }

    if (session) {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
      return;
    }

    localStorage.removeItem(CUSTOMER_SESSION_KEY);
  }

  private readUsers(): CustomerUser[] {
    const demoUser: CustomerUser = {
      nombre: 'Cliente Demo',
      email: 'cliente@demo.com',
      password: 'Cliente123',
    };

    if (!this.browser) {
      return [demoUser];
    }

    const rawUsers = localStorage.getItem(CUSTOMER_USERS_KEY);
    return rawUsers ? JSON.parse(rawUsers) as CustomerUser[] : [demoUser];
  }

  private writeUsers(users: CustomerUser[]): void {
    if (!this.browser) {
      return;
    }

    localStorage.setItem(CUSTOMER_USERS_KEY, JSON.stringify(users));
  }
}
