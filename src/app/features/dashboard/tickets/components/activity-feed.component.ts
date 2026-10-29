import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Activity } from '../../../../models/ticket.model';
import { TimeAgoPipe } from '../../../../shared/utils/time-ago.pipe';
import { ACTIVITY_ICON } from '../ticket.utils';

@Component({
  selector: 'app-activity-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, TimeAgoPipe],
  template: `
    @if (items().length === 0) {
      <p class="muted small empty">{{ emptyMessage() }}</p>
    } @else {
      <ol class="feed">
        @for (item of items(); track item.id) {
          <li class="feed-item" [class.comment]="item.type === 'comment'">
            <span class="feed-icon" aria-hidden="true">{{ icons[item.type] }}</span>
            <div class="feed-body">
              @if (item.type === 'comment') {
                <p><strong>{{ item.actorName }}</strong> commented</p>
                <p class="comment-text">{{ item.message }}</p>
              } @else {
                <p><strong>{{ item.actorName }}</strong> {{ item.message }}</p>
              }
              <p class="muted small">
                @if (showTicket()) {
                  @if (item.type === 'deleted') {
                    <span>{{ item.ticketId }} · {{ item.ticketTitle }}</span>
                  } @else {
                    <a [routerLink]="['/dashboard/tickets', item.ticketId]">{{ item.ticketId }} · {{ item.ticketTitle }}</a>
                  }
                  ·
                }
                <time [attr.datetime]="item.createdAt" [title]="item.createdAt | date: 'medium'">{{ item.createdAt | timeAgo }}</time>
              </p>
            </div>
          </li>
        }
      </ol>
    }
  `,
  styles: `
    .feed {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .feed-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-top: 1px solid var(--border);
    }
    .feed-item:first-child {
      border-top: 0;
      padding-top: 0;
    }
    .feed-icon {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--surface-muted);
      font-size: 13px;
    }
    .comment .feed-icon {
      background: var(--accent-soft);
    }
    .feed-body {
      min-width: 0;
      font-size: 14px;
    }
    .comment-text {
      margin: 6px 0 4px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      background: var(--surface-muted);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .empty {
      padding: 12px 0;
    }
  `,
})
export class ActivityFeedComponent {
  readonly items = input.required<Activity[]>();
  readonly showTicket = input(true);
  readonly emptyMessage = input('No activity yet.');
  protected readonly icons = ACTIVITY_ICON;
}
