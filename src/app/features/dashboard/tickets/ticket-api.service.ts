import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api-url';
import { Activity, Agent, Ticket, TicketFilters, TicketPayload, TicketStats } from '../../../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/tickets`;

  list(filters: Partial<TicketFilters> & { requester?: string }): Observable<Ticket[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<Ticket[]>(this.baseUrl, { params });
  }

  get(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  stats(): Observable<TicketStats> {
    return this.http.get<TicketStats>(`${this.baseUrl}/stats`);
  }

  create(payload: TicketPayload): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, payload);
  }

  update(id: string, changes: Partial<TicketPayload>): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}`, changes);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activity(id: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}/${id}/activity`);
  }

  addComment(id: string, message: string): Observable<Activity> {
    return this.http.post<Activity>(`${this.baseUrl}/${id}/comments`, { message });
  }

  recentActivity(limit: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activity`, { params: { limit } });
  }

  agents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${API_URL}/agents`);
  }
}
