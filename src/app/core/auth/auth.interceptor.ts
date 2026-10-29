import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api-url';
import { NotificationService } from '../notifications/notification.service';
import { AuthService } from './auth.service';

const PUBLIC_ENDPOINTS = [`${API_URL}/auth/login`, `${API_URL}/auth/register`];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);
  const isApiCall = req.url.startsWith(API_URL);
  const isPublic = PUBLIC_ENDPOINTS.includes(req.url);
  const token = auth.token;

  const request =
    isApiCall && !isPublic && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isPublic && token) {
        notifications.error('Your session has expired. Please log in again.');
        auth.endSession();
      }
      return throwError(() => error);
    }),
  );
};
