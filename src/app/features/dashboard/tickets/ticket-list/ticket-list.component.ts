import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, map } from 'rxjs';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { TicketPayload, TicketPriority, TicketStatus } from '../../../../models/ticket.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state.component';
import { SpinnerComponent } from '../../../../shared/components/spinner.component';
import { errorMessage } from '../../../../shared/utils/error-message';
import { TimeAgoPipe } from '../../../../shared/utils/time-ago.pipe';
import { PriorityBadgeComponent, StatusBadgeComponent } from '../components/ticket-badges.component';
import { TicketFormComponent } from '../ticket-form/ticket-form.component';
import { TicketService } from '../ticket.service';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../ticket.utils';

@Component({
  selector: 'app-ticket-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TimeAgoPipe,
    SpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    TicketFormComponent,
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css',
})
export class TicketListComponent {
  private readonly ticketService = inject(TicketService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly statuses = STATUS_OPTIONS;
  protected readonly priorities = PRIORITY_OPTIONS;

  protected readonly state = toSignal(this.ticketService.listState$, {
    initialValue: { loading: true, tickets: [], error: null },
  });
  protected readonly filters = toSignal(this.ticketService.filters$, { initialValue: this.ticketService.filters });
  protected readonly agents = toSignal(this.ticketService.agents$, { initialValue: [] });
  protected readonly agentNames = computed(() => new Map(this.agents().map((agent) => [agent.id, agent.name])));
  protected readonly hasFilters = computed(() => {
    const { search, status, priority } = this.filters();
    return Boolean(search || status || priority);
  });

  protected readonly searchControl = new FormControl(this.ticketService.filters.search, { nonNullable: true });
  protected readonly statusControl = new FormControl<TicketStatus | ''>(this.ticketService.filters.status, {
    nonNullable: true,
  });
  protected readonly priorityControl = new FormControl<TicketPriority | ''>(this.ticketService.filters.priority, {
    nonNullable: true,
  });

  protected readonly formOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        map((term) => term.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((search) => this.ticketService.setFilters({ search }));

    this.statusControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((status) => this.ticketService.setFilters({ status }));

    this.priorityControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((priority) => this.ticketService.setFilters({ priority }));

    this.ticketService.filters$.pipe(takeUntilDestroyed()).subscribe((filters) => {
      this.statusControl.setValue(filters.status, { emitEvent: false });
      this.priorityControl.setValue(filters.priority, { emitEvent: false });
      if (filters.search !== this.searchControl.value.trim()) {
        this.searchControl.setValue(filters.search, { emitEvent: false });
      }
    });
  }

  protected clearFilters(): void {
    this.ticketService.resetFilters();
  }

  protected retry(): void {
    this.ticketService.refresh();
  }

  protected openCreate(): void {
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (!this.saving()) {
      this.formOpen.set(false);
    }
  }

  protected create(payload: TicketPayload): void {
    this.saving.set(true);
    this.formError.set(null);
    this.ticketService
      .create(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (ticket) => {
          this.formOpen.set(false);
          this.notifications.success(`Ticket ${ticket.id} created.`);
          this.router.navigate(['/dashboard/tickets', ticket.id]);
        },
        error: (error: unknown) => this.formError.set(errorMessage(error)),
      });
  }
}
