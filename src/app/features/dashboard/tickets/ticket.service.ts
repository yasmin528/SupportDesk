import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  forkJoin,
  interval,
  map,
  merge,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  Activity,
  Agent,
  Ticket,
  TicketDetails,
  TicketFilters,
  TicketListState,
  TicketPayload,
  TicketStats,
} from '../../../models/ticket.model';
import { errorMessage } from '../../../shared/utils/error-message';
import { TicketApiService } from './ticket-api.service';

export interface OverviewState {
  loading: boolean;
  stats: TicketStats | null;
  activity: Activity[];
  error: string | null;
  updatedAt: Date | null;
}

export interface DetailState {
  loading: boolean;
  details: TicketDetails | null;
  error: string | null;
}

export const EMPTY_FILTERS: TicketFilters = { search: '', status: '', priority: '' };
const AUTO_REFRESH_MS = 30_000;

function sameFilters(a: TicketFilters, b: TicketFilters): boolean {
  return a.search === b.search && a.status === b.status && a.priority === b.priority;
}

@Injectable()
export class TicketService {
  private readonly api = inject(TicketApiService);

  private readonly changesSubject = new Subject<void>();
  private readonly filtersSubject = new BehaviorSubject<TicketFilters>(EMPTY_FILTERS);

  readonly changes$ = this.changesSubject.asObservable();
  readonly filters$ = this.filtersSubject.asObservable();

  private readonly refresh$ = this.changes$.pipe(startWith(undefined));

  readonly agents$: Observable<Agent[]> = this.api.agents().pipe(
    catchError(() => of<Agent[]>([])),
    shareReplay(1),
  );

  readonly overview$: Observable<OverviewState> = merge(this.changes$, interval(AUTO_REFRESH_MS)).pipe(
    startWith(undefined),
    switchMap(() =>
      forkJoin({ stats: this.api.stats(), activity: this.api.recentActivity(8) }).pipe(
        map(({ stats, activity }): Partial<OverviewState> => ({
          loading: false,
          stats,
          activity,
          error: null,
          updatedAt: new Date(),
        })),
        catchError((error: unknown) =>
          of<Partial<OverviewState>>({ loading: false, error: errorMessage(error, 'Could not load the overview.') }),
        ),
        startWith<Partial<OverviewState>>({ loading: true }),
      ),
    ),
    scan((state, patch) => ({ ...state, ...patch }), {
      loading: true,
      stats: null,
      activity: [],
      error: null,
      updatedAt: null,
    } as OverviewState),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly listState$: Observable<TicketListState> = combineLatest([
    this.filters$.pipe(distinctUntilChanged(sameFilters)),
    this.refresh$,
  ]).pipe(
    switchMap(([filters]) =>
      this.api.list(filters).pipe(
        map((tickets): Partial<TicketListState> => ({ loading: false, tickets, error: null })),
        catchError((error: unknown) =>
          of<Partial<TicketListState>>({ loading: false, error: errorMessage(error, 'Could not load tickets.') }),
        ),
        startWith<Partial<TicketListState>>({ loading: true }),
      ),
    ),
    scan((state, patch) => ({ ...state, ...patch }), { loading: true, tickets: [], error: null } as TicketListState),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  get filters(): TicketFilters {
    return this.filtersSubject.value;
  }

  setFilters(changes: Partial<TicketFilters>): void {
    this.filtersSubject.next({ ...this.filtersSubject.value, ...changes });
  }

  resetFilters(): void {
    this.filtersSubject.next(EMPTY_FILTERS);
  }

  refresh(): void {
    this.changesSubject.next();
  }

  details(id$: Observable<string>): Observable<DetailState> {
    return id$.pipe(
      distinctUntilChanged(),
      switchMap((id) =>
        this.refresh$.pipe(
          switchMap(() =>
            this.api.get(id).pipe(
              switchMap((ticket) =>
                forkJoin({
                  activity: this.api.activity(ticket.id),
                  related: this.api.list({ requester: ticket.requesterEmail }),
                }).pipe(
                  map(({ activity, related }): TicketDetails => ({
                    ticket,
                    activity,
                    relatedTickets: related.filter((item) => item.id !== ticket.id),
                  })),
                ),
              ),
              map((details): Partial<DetailState> => ({ loading: false, details, error: null })),
              catchError((error: unknown) =>
                of<Partial<DetailState>>({
                  loading: false,
                  details: null,
                  error: errorMessage(error, 'Could not load this ticket.'),
                }),
              ),
              startWith<Partial<DetailState>>({ loading: true }),
            ),
          ),
          scan((state, patch) => ({ ...state, ...patch }), { loading: true, details: null, error: null } as DetailState),
        ),
      ),
    );
  }

  create(payload: TicketPayload): Observable<Ticket> {
    return this.api.create(payload).pipe(tap(() => this.refresh()));
  }

  update(id: string, changes: Partial<TicketPayload>): Observable<Ticket> {
    return this.api.update(id, changes).pipe(tap(() => this.refresh()));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(tap(() => this.refresh()));
  }

  addComment(id: string, message: string): Observable<Activity> {
    return this.api.addComment(id, message).pipe(tap(() => this.refresh()));
  }
}
