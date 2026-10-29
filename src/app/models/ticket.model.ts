export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requesterName: string;
  requesterEmail: string;
  assigneeId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPayload {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requesterName: string;
  requesterEmail: string;
  assigneeId: string | null;
}

export interface TicketFilters {
  search: string;
  status: TicketStatus | '';
  priority: TicketPriority | '';
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
}

export interface TicketListState {
  loading: boolean;
  tickets: Ticket[];
  error: string | null;
}

export interface TicketDetails {
  ticket: Ticket;
  activity: Activity[];
  relatedTickets: Ticket[];
}

export type ActivityType = 'created' | 'status' | 'priority' | 'assignee' | 'updated' | 'comment' | 'deleted';

export interface Activity {
  id: string;
  ticketId: string;
  ticketTitle: string;
  type: ActivityType;
  message: string;
  actorName: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
}
