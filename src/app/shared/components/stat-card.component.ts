import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatTone = 'accent' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'card stat tone-' + tone()">
      <span class="stat-label">{{ label() }}</span>
      <span class="stat-value">{{ value() }}</span>
      @if (hint()) {
        <span class="muted small">{{ hint() }}</span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .stat {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 18px 20px;
      border-left: 4px solid var(--tone);
    }
    .stat-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
    }
    .tone-accent {
      --tone: var(--accent);
    }
    .tone-success {
      --tone: var(--success);
    }
    .tone-warning {
      --tone: var(--warning);
    }
    .tone-danger {
      --tone: var(--danger);
    }
    .tone-info {
      --tone: var(--info);
    }
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number | null>();
  readonly hint = input('');
  readonly tone = input<StatTone>('accent');
}
