import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

const TOAST_DURATION_MS = 3500;
const MAX_TOASTS = 3;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  private readonly toastsSignal = signal<Toast[]>([]);

  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.toastsSignal.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(type: ToastType, message: string): void {
    const toast: Toast = { id: this.nextId++, type, message };
    this.toastsSignal.update((toasts) => [...toasts, toast].slice(-MAX_TOASTS));
    setTimeout(() => this.dismiss(toast.id), TOAST_DURATION_MS);
  }
}
