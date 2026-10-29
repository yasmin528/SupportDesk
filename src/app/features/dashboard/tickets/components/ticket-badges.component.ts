import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketPriority, TicketStatus } from '../../../../models/ticket.model';
import { PRIORITY_BADGE, STATUS_BADGE, statusLabel } from '../ticket.utils';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="badgeClass()">{{ label() }}</span>`,
})
export class StatusBadgeComponent {
  readonly status = input.required<TicketStatus>();
  protected readonly badgeClass = computed(() => STATUS_BADGE[this.status()]);
  protected readonly label = computed(() => statusLabel(this.status()));
}

@Component({
  selector: 'app-priority-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="badgeClass()">{{ priority() }}</span>`,
})
export class PriorityBadgeComponent {
  readonly priority = input.required<TicketPriority>();
  protected readonly badgeClass = computed(() => PRIORITY_BADGE[this.priority()]);
}
