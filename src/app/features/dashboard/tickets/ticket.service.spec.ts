import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Ticket } from '../../../models/ticket.model';
import { DetailState, TicketService } from './ticket.service';
import { TicketApiService } from './ticket-api.service';

const ticket: Ticket = {
  id: 'SD-1',
  title: 'Broken login',
  description: 'Cannot log in',
  status: 'open',
  priority: 'high',
  requesterName: 'Sara',
  requesterEmail: 'sara@example.com',
  assigneeId: null,
  createdBy: 'agent-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TicketService', () => {
  let service: TicketService;
  let listCalls: Array<Record<string, string>>;

  beforeEach(() => {
    listCalls = [];
    TestBed.configureTestingModule({
      providers: [
        TicketService,
        {
          provide: TicketApiService,
          useValue: {
            get: () => of(ticket),
            activity: () => of([]),
            list: (filters: Record<string, string>) => {
              listCalls.push(filters);
              return of([ticket, { ...ticket, id: 'SD-2' }]);
            },
            agents: () => of([]),
            update: () => of(ticket),
          },
        },
      ],
    });
    service = TestBed.inject(TicketService);
  });

  it('loads the ticket, then its related tickets using the requester email', () => {
    const states: DetailState[] = [];
    service.details(of('SD-1')).subscribe((state) => states.push(state));
    const last = states.at(-1)!;
    expect(states[0].loading).toBe(true);
    expect(last.details?.ticket.id).toBe('SD-1');
    expect(last.details?.relatedTickets.map((item) => item.id)).toEqual(['SD-2']);
    expect(listCalls).toEqual([{ requester: 'sara@example.com' }]);
  });

  it('ignores filter updates that do not change anything', () => {
    const subscription = service.listState$.subscribe();
    service.setFilters({ status: 'open' });
    service.setFilters({ status: 'open' });
    expect(listCalls.length).toBe(2);
    subscription.unsubscribe();
  });

  it('reloads the list when a change is announced', () => {
    const subscription = service.listState$.subscribe();
    service.update('SD-1', { status: 'resolved' }).subscribe();
    expect(listCalls.length).toBe(2);
    subscription.unsubscribe();
  });
});
