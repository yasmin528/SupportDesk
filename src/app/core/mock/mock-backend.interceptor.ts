import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, catchError, from, map, switchMap, tap, throwError, timer } from 'rxjs';
import { TicketPayload } from '../../models/ticket.model';
import { LoginRequest, SignupRequest } from '../../models/user.model';
import { login, logout, me, register, requireUserId } from './mock-auth-api';
import { MockHttpError, shouldSimulateFailure } from './mock-db';
import {
  addComment,
  createTicket,
  deleteTicket,
  getStats,
  getTicket,
  listAgents,
  listTickets,
  recentActivity,
  ticketActivity,
  updateTicket,
} from './mock-tickets-api';

const LATENCY_MS = 450;

async function route(req: HttpRequest<unknown>): Promise<unknown> {
  const path = new URL(req.url, 'http://mock.local').pathname;
  const [resource, id, sub] = path.replace(/^\/api\//, '').split('/');
  const method = req.method;

  if (resource === 'auth') {
    switch (`${method} ${id}`) {
      case 'POST register':
        return register(req.body as SignupRequest);
      case 'POST login':
        return login(req.body as LoginRequest);
      case 'POST logout':
        return logout(req);
      case 'GET me':
        return me(req);
    }
  }

  const userId = requireUserId(req);
  if (shouldSimulateFailure()) {
    throw new MockHttpError(500, 'The help desk server is not responding. Please try again.');
  }

  if (resource === 'agents' && method === 'GET') {
    return listAgents();
  }

  if (resource === 'activity' && method === 'GET') {
    return recentActivity(Number(req.params.get('limit') ?? 10));
  }

  if (resource === 'tickets') {
    if (id === 'stats' && method === 'GET') return getStats();
    if (!id && method === 'GET') {
      return listTickets({
        search: req.params.get('search') ?? '',
        status: req.params.get('status') ?? '',
        priority: req.params.get('priority') ?? '',
        requester: req.params.get('requester') ?? '',
      });
    }
    if (!id && method === 'POST') return createTicket(req.body as TicketPayload, userId);
    if (id && sub === 'activity' && method === 'GET') return ticketActivity(id);
    if (id && sub === 'comments' && method === 'POST') {
      return addComment(id, (req.body as { message: string }).message, userId);
    }
    if (id && !sub && method === 'GET') return getTicket(id);
    if (id && !sub && (method === 'PUT' || method === 'PATCH')) {
      return updateTicket(id, req.body as Partial<TicketPayload>, userId);
    }
    if (id && !sub && method === 'DELETE') return deleteTicket(id, userId);
  }

  throw new MockHttpError(404, `No mock route for ${method} ${path}`);
}

function toHttpError(error: unknown, url: string): HttpErrorResponse {
  const status = error instanceof MockHttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return new HttpErrorResponse({ status, url, error: { message } });
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  const label = `${req.method} ${req.urlWithParams}`;
  console.info(`[mock api] → ${label}`);
  const response$: Observable<HttpEvent<unknown>> = timer(LATENCY_MS).pipe(
    switchMap(() => from(route(req))),
    map((body) => new HttpResponse({ status: 200, body, url: req.url })),
    catchError((error: unknown) => throwError(() => toHttpError(error, req.url))),
    tap({ unsubscribe: () => console.info(`[mock api] ✕ cancelled ${label}`) }),
  );
  return response$;
};
