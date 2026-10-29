import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TicketFilters } from '../../../models/ticket.model';
import { SpinnerComponent } from '../../../shared/components/spinner.component';
import { StatCardComponent, StatTone } from '../../../shared/components/stat-card.component';
import { ActivityFeedComponent } from '../tickets/components/activity-feed.component';
import { EMPTY_FILTERS, OverviewState, TicketService } from '../tickets/ticket.service';

interface BreakdownRow {
  label: string;
  count: number;
  percent: number;
  tone: StatTone;
  filters: Partial<TicketFilters>;
}

@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, StatCardComponent, SpinnerComponent, ActivityFeedComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class OverviewComponent {
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);

  protected readonly user = toSignal(inject(AuthService).currentUser$, { initialValue: null });
  protected readonly state = toSignal(this.ticketService.overview$, {
    initialValue: { loading: true, stats: null, activity: [], error: null, updatedAt: null } as OverviewState,
  });

  protected readonly priorityRows = computed<BreakdownRow[]>(() => {
    const stats = this.state().stats;
    if (!stats) return [];
    const percent = (count: number) => (stats.total ? Math.round((count / stats.total) * 100) : 0);
    return [
      { label: 'High', count: stats.byPriority.high, percent: percent(stats.byPriority.high), tone: 'danger', filters: { priority: 'high' } },
      { label: 'Medium', count: stats.byPriority.medium, percent: percent(stats.byPriority.medium), tone: 'warning', filters: { priority: 'medium' } },
      { label: 'Low', count: stats.byPriority.low, percent: percent(stats.byPriority.low), tone: 'info', filters: { priority: 'low' } },
    ];
  });

  protected refresh(): void {
    this.ticketService.refresh();
  }

  protected openTickets(filters: Partial<TicketFilters>): void {
    this.ticketService.setFilters({ ...EMPTY_FILTERS, ...filters });
    this.router.navigate(['/dashboard/tickets']);
  }
}
