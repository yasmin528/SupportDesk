import { ActivityType, TicketPriority, TicketStatus } from '../../../models/ticket.model';

export const STATUS_OPTIONS: Array<{ value: TicketStatus; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

export const PRIORITY_OPTIONS: Array<{ value: TicketPriority; label: string }> = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const STATUS_BADGE: Record<TicketStatus, string> = {
  open: 'badge badge-info',
  in_progress: 'badge badge-warning',
  resolved: 'badge badge-success',
};

export const PRIORITY_BADGE: Record<TicketPriority, string> = {
  high: 'badge badge-danger',
  medium: 'badge badge-warning',
  low: 'badge',
};

export const ACTIVITY_ICON: Record<ActivityType, string> = {
  created: '✚',
  status: '⇄',
  priority: '⚑',
  assignee: '👤',
  updated: '✎',
  comment: '💬',
  deleted: '🗑',
};

export function statusLabel(status: TicketStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}
