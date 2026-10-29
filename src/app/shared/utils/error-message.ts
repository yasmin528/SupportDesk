import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string } | null;
    if (body?.message) {
      return body.message;
    }
    if (error.status === 0) {
      return 'Cannot reach the server. Check your connection.';
    }
  }
  return fallback;
}
