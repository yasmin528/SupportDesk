import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="backdrop" (click)="closed.emit()"></div>
    <div class="modal card" role="dialog" aria-modal="true" [attr.aria-label]="title()" [style.max-width.px]="width()">
      <header class="modal-header">
        <h2>{{ title() }}</h2>
        <button type="button" class="btn btn-ghost btn-sm" aria-label="Close" (click)="closed.emit()">✕</button>
      </header>
      <div class="modal-body">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: grid;
      place-items: center;
      padding: 16px;
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgb(15 23 42 / 45%);
    }
    .modal {
      position: relative;
      width: 100%;
      max-height: calc(100vh - 32px);
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
    }
    .modal-header h2 {
      font-size: 17px;
    }
    .modal-body {
      padding: 20px;
    }
  `,
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly width = input(520);
  readonly closed = output<void>();
}
