import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of notifications.toasts(); track toast.id) {
        <div [class]="'toast toast-' + toast.type" role="status">
          <span>{{ toast.message }}</span>
          <button type="button" aria-label="Dismiss" (click)="notifications.dismiss(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: min(380px, calc(100vw - 40px));
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: var(--radius);
      background: var(--text);
      color: #fff;
      box-shadow: var(--shadow-lg);
      font-size: 14px;
      animation: slide-in 0.2s ease-out;
    }
    .toast span {
      flex: 1;
    }
    .toast-success {
      background: var(--success);
    }
    .toast-error {
      background: var(--danger);
    }
    .toast button {
      border: 0;
      background: transparent;
      color: inherit;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      opacity: 0.8;
    }
    @keyframes slide-in {
      from {
        transform: translateY(8px);
        opacity: 0;
      }
    }
  `,
})
export class ToastContainerComponent {
  protected readonly notifications = inject(NotificationService);
}
