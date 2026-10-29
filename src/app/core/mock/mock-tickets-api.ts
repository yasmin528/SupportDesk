import {
  Activity,
  ActivityType,
  Agent,
  Ticket,
  TicketPayload,
  TicketPriority,
  TicketStats,
  TicketStatus,
} from '../../models/ticket.model';
import { MockHttpError, StoredUser, createId, nowIso, readTable, writeTable } from './mock-db';
import { seedActivity, seedTickets, seedUsers } from './seed-data';

const STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved'];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high'];
const STATUS_LABELS: Record<TicketStatus, string> = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };

function tickets(): Ticket[] {
  return readTable<Ticket>('tickets', seedTickets);
}

function activity(): Activity[] {
  return readTable<Activity>('activity', seedActivity);
}

function users(): StoredUser[] {
  return readTable<StoredUser>('users', seedUsers);
}

function userName(userId: string | null): string {
  if (!userId) return 'Unassigned';
  return users().find((user) => user.id === userId)?.name ?? 'Unknown agent';
}

function findTicket(id: string): Ticket {
  const ticket = tickets().find((item) => item.id === id);
  if (!ticket) {
    throw new MockHttpError(404, `Ticket ${id} was not found. It may have been deleted.`);
  }
  return ticket;
}

function log(ticket: Ticket, type: ActivityType, message: string, actorId: string): Activity {
  const entry: Activity = {
    id: createId(),
    ticketId: ticket.id,
    ticketTitle: ticket.title,
    type,
    message,
    actorName: userName(actorId),
    createdAt: nowIso(),
  };
  writeTable('activity', [...activity(), entry]);
  return entry;
}

function validate(payload: Partial<TicketPayload>): void {
  if (payload.title !== undefined && payload.title.trim().length < 5) {
    throw new MockHttpError(400, 'Title must be at least 5 characters.');
  }
  if (payload.status !== undefined && !STATUSES.includes(payload.status)) {
    throw new MockHttpError(400, 'Invalid status.');
  }
  if (payload.priority !== undefined && !PRIORITIES.includes(payload.priority)) {
    throw new MockHttpError(400, 'Invalid priority.');
  }
}

function byNewest<T extends { createdAt: string }>(a: T, b: T): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export function listTickets(params: { search: string; status: string; priority: string; requester: string }): Ticket[] {
  const search = params.search.trim().toLowerCase();
  return tickets()
    .filter((ticket) => !search || ticket.title.toLowerCase().includes(search))
    .filter((ticket) => !params.status || ticket.status === params.status)
    .filter((ticket) => !params.priority || ticket.priority === params.priority)
    .filter((ticket) => !params.requester || ticket.requesterEmail === params.requester)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTicket(id: string): Ticket {
  return findTicket(id);
}

export function getStats(): TicketStats {
  const all = tickets();
  const count = <K extends string>(keys: K[], pick: (ticket: Ticket) => K) =>
    Object.fromEntries(keys.map((key) => [key, all.filter((ticket) => pick(ticket) === key).length])) as Record<K, number>;
  return {
    total: all.length,
    byStatus: count(STATUSES, (ticket) => ticket.status),
    byPriority: count(PRIORITIES, (ticket) => ticket.priority),
  };
}

export function createTicket(payload: TicketPayload, actorId: string): Ticket {
  validate(payload);
  const all = tickets();
  const nextNumber = all.reduce((max, ticket) => Math.max(max, Number(ticket.id.slice(3))), 1000) + 1;
  const timestamp = nowIso();
  const ticket: Ticket = {
    ...payload,
    id: `SD-${nextNumber}`,
    title: payload.title.trim(),
    description: payload.description.trim(),
    createdBy: actorId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  writeTable('tickets', [ticket, ...all]);
  log(ticket, 'created', 'created the ticket', actorId);
  return ticket;
}

export function updateTicket(id: string, changes: Partial<TicketPayload>, actorId: string): Ticket {
  validate(changes);
  const before = findTicket(id);
  const after: Ticket = { ...before, ...changes, updatedAt: nowIso() };
  writeTable(
    'tickets',
    tickets().map((ticket) => (ticket.id === id ? after : ticket)),
  );

  let changedFields = 0;
  if (before.status !== after.status) {
    changedFields++;
    log(after, 'status', `changed status from ${STATUS_LABELS[before.status]} to ${STATUS_LABELS[after.status]}`, actorId);
  }
  if (before.priority !== after.priority) {
    changedFields++;
    log(after, 'priority', `changed priority from ${before.priority} to ${after.priority}`, actorId);
  }
  if (before.assigneeId !== after.assigneeId) {
    changedFields++;
    log(after, 'assignee', after.assigneeId ? `assigned the ticket to ${userName(after.assigneeId)}` : 'unassigned the ticket', actorId);
  }
  const detailsChanged = (['title', 'description', 'requesterName', 'requesterEmail'] as const).some(
    (field) => before[field] !== after[field],
  );
  if (detailsChanged || changedFields === 0) {
    log(after, 'updated', 'updated the ticket details', actorId);
  }
  return after;
}

export function deleteTicket(id: string, actorId: string): null {
  const ticket = findTicket(id);
  writeTable(
    'tickets',
    tickets().filter((item) => item.id !== id),
  );
  log(ticket, 'deleted', 'deleted the ticket', actorId);
  return null;
}

export function ticketActivity(id: string): Activity[] {
  findTicket(id);
  return activity()
    .filter((entry) => entry.ticketId === id)
    .sort(byNewest);
}

export function addComment(id: string, message: string, actorId: string): Activity {
  const text = (message ?? '').trim();
  if (text.length < 2) {
    throw new MockHttpError(400, 'Comment is too short.');
  }
  const ticket = findTicket(id);
  writeTable(
    'tickets',
    tickets().map((item) => (item.id === id ? { ...item, updatedAt: nowIso() } : item)),
  );
  return log(ticket, 'comment', text, actorId);
}

export function recentActivity(limit: number): Activity[] {
  return activity().sort(byNewest).slice(0, limit);
}

export function listAgents(): Agent[] {
  return users().map(({ id, name, email }) => ({ id, name, email }));
}
