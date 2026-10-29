import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { TicketService } from '../tickets/ticket.service';

@Component({
  selector: 'app-dashboard-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  providers: [TicketService],
  template: `
    <header class="topbar">
      <div class="container topbar-inner">
        <a routerLink="/dashboard" class="auth-brand brand-link"><span class="brand-mark">S</span> <span class="hide-sm">SupportDesk</span></a>
        <nav class="topbar-nav">
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
          >
            Overview
          </a>
          <a routerLink="/dashboard/tickets" routerLinkActive="active">Tickets</a>
        </nav>
        <span class="spacer"></span>
        @if (user(); as user) {
          <span class="muted small hide-sm">{{ user.name }}</span>
          <span class="avatar" [attr.aria-label]="user.name">{{ initials() }}</span>
        }
        <button type="button" class="btn btn-secondary btn-sm" (click)="logout()">Log out</button>
      </div>
    </header>
    <router-outlet />
  `,
  styles: `
    .brand-link {
      margin: 0;
      color: var(--text);
    }
    .brand-link:hover {
      text-decoration: none;
    }
  `,
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  protected readonly user = toSignal(this.auth.currentUser$, { initialValue: null });
  protected readonly initials = computed(() =>
    (this.user()?.name ?? '?')
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  protected logout(): void {
    this.auth.logout();
    this.notifications.info('You have been logged out.');
  }
}
