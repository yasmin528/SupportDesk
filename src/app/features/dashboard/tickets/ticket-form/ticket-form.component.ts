import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Agent, Ticket, TicketPayload, TicketPriority, TicketStatus } from '../../../../models/ticket.model';
import { ModalComponent } from '../../../../shared/components/modal.component';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../ticket.utils';

@Component({
  selector: 'app-ticket-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './ticket-form.component.html',
})
export class TicketFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly ticket = input<Ticket | null>(null);
  readonly agents = input<Agent[]>([]);
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly saved = output<TicketPayload>();
  readonly cancelled = output<void>();

  protected readonly statuses = STATUS_OPTIONS;
  protected readonly priorities = PRIORITY_OPTIONS;

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    status: ['open' as TicketStatus, Validators.required],
    priority: ['medium' as TicketPriority, Validators.required],
    requesterName: ['', [Validators.required, Validators.maxLength(80)]],
    requesterEmail: ['', [Validators.required, Validators.email]],
    assigneeId: [''],
  });

  ngOnInit(): void {
    const ticket = this.ticket();
    if (ticket) {
      this.form.setValue({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        requesterName: ticket.requesterName,
        requesterEmail: ticket.requesterEmail,
        assigneeId: ticket.assigneeId ?? '',
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      ...value,
      title: value.title.trim(),
      description: value.description.trim(),
      requesterName: value.requesterName.trim(),
      requesterEmail: value.requesterEmail.trim().toLowerCase(),
      assigneeId: value.assigneeId || null,
    });
  }
}
