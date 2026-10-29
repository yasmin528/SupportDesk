import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, distinctUntilChanged, finalize, map, of, tap } from 'rxjs';
import { API_URL } from '../api-url';
import { AuthResponse, LoginRequest, SignupRequest, User } from '../../models/user.model';

interface StoredSession {
  token: string;
  user: User;
}

const SESSION_KEY = 'supportdesk.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sessionSubject = new BehaviorSubject<StoredSession | null>(this.readSession());

  readonly currentUser$: Observable<User | null> = this.sessionSubject.pipe(
    map((session) => session?.user ?? null),
  );

  readonly isAuthenticated$: Observable<boolean> = this.sessionSubject.pipe(
    map((session) => session !== null),
    distinctUntilChanged(),
  );

  get token(): string | null {
    return this.sessionSubject.value?.token ?? null;
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, credentials).pipe(
      tap((response) => this.storeSession(response)),
      map((response) => response.user),
    );
  }

  signup(request: SignupRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, request).pipe(
      tap((response) => this.storeSession(response)),
      map((response) => response.user),
    );
  }

  logout(): void {
    this.http
      .post(`${API_URL}/auth/logout`, {})
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.endSession()),
      )
      .subscribe();
  }

  endSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionSubject.next(null);
    this.router.navigate(['/login']);
  }

  private storeSession(response: AuthResponse): void {
    const session: StoredSession = { token: response.token, user: response.user };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSubject.next(session);
  }

  private readSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      return null;
    }
  }
}
