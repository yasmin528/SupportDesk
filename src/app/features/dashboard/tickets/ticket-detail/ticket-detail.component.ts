import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { Ticket, TicketPayload, TicketPriority, TicketStatus } from '../../../../models/ticket.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state.component';
import { SpinnerComponent } from '../../../../shared/components/spinner.component';
import { errorMessage } from '../../../../shared/utils/error-message';
import { TimeAgoPipe } from '../../../../shared/utils/time-ago.pipe';
import { ActivityFeedComponent } from '../components/activity-feed.component';
import { PriorityBadgeComponent, StatusBadgeComponent } from '../components/ticket-badges.component';
import { TicketFormComponent } from '../ticket-form/ticket-form.component';
import { DetailState, TicketService } from '../ticket.service';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, statusLabel } from '../ticket.utils';

@Component({
  selector: 'app-ticket-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    TimeAgoPipe,
    SpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    ActivityFeedComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    TicketFormComponent,
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css',
})
export class TicketDetailComponent {
  private readonly ticketService = inject(TicketService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly state = toSignal(this.ticketService.details(toObservable(this.id)), {
    initialValue: { loading: true, details: null, error: null } as DetailState,
  });
  protected readonly agents = toSignal(this.ticketService.agents$, { initialValue: [] });
  protected readonly assigneeName = computed(() => {
    const assigneeId = this.state().details?.ticket.assigneeId;
    if (!assigneeId) return 'Unassigned';
    return this.agents().find((agent) => agent.id === assigneeId)?.name ?? 'Unknown agent';
  });

  protected readonly statuses = STATUS_OPTIONS;
  protected readonly priorities = PRIORITY_OPTIONS;

  protected readonly busy = signal(false);
  protected readonly editing = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly confirmingDelete = signal(false);
  protected readonly postingComment = signal(false);

  protected readonly commentControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(1000)],
  });

  protected changeStatus(ticket: Ticket, status: TicketStatus): void {
    if (status !== ticket.status) {
      this.applyChanges(ticket, { status }, `Status changed to ${statusLabel(status)}.`);
    }
  }

  protected changePriority(ticket: Ticket, priority: TicketPriority): void {
    if (priority !== ticket.priority) {
      this.applyChanges(ticket, { priority }, `Priority set to ${priority}.`);
    }
  }

  protected changeAssignee(ticket: Ticket, assigneeId: string): void {
    const next = assigneeId || null;
    if (next !== ticket.assigneeId) {
      this.applyChanges(ticket, { assigneeId: next }, next ? 'Ticket assigned.' : 'Ticket unassigned.');
    }
  }

  protected openEdit(): void {
    this.formError.set(null);
    this.editing.set(true);
  }

  protected saveEdit(ticket: Ticket, payload: TicketPayload): void {
    this.busy.set(true);
    this.formError.set(null);
    this.ticketService
      .update(ticket.id, payload)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.editing.set(false);
          this.notifications.success(`${ticket.id} updated.`);
        },
        error: (error: unknown) => this.formError.set(errorMessage(error)),
      });
  }

  protected postComment(ticket: Ticket): void {
    if (this.commentControl.invalid) {
      this.commentControl.markAsTouched();
      return;
    }
    this.postingComment.set(true);
    this.ticketService
      .addComment(ticket.id, this.commentControl.value.trim())
      .pipe(finalize(() => this.postingComment.set(false)))
      .subscribe({
        next: () => {
          this.commentControl.reset();
          this.notifications.success('Comment added.');
        },
        error: (error: unknown) => this.notifications.error(errorMessage(error)),
      });
  }

  protected deleteTicket(ticket: Ticket): void {
    this.busy.set(true);
    this.ticketService
      .delete(ticket.id)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`${ticket.id} deleted.`);
          this.router.navigate(['/dashboard/tickets']);
        },
        error: (error: unknown) => {
          this.confirmingDelete.set(false);
          this.notifications.error(errorMessage(error));
        },
      });
  }

  private applyChanges(ticket: Ticket, changes: Partial<TicketPayload>, message: string): void {
    this.busy.set(true);
    this.ticketService
      .update(ticket.id, changes)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => this.notifications.success(message),
        error: (error: unknown) => this.notifications.error(errorMessage(error)),
      });
  }
}
