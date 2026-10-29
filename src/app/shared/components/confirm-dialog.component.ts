import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent],
  template: `
    <app-modal [title]="title()" [width]="420" (closed)="cancelled.emit()">
      <p class="muted">{{ message() }}</p>
      <div class="row actions">
        <button type="button" class="btn btn-secondary" [disabled]="busy()" (click)="cancelled.emit()">Cancel</button>
        <button type="button" class="btn btn-danger" [disabled]="busy()" (click)="confirmed.emit()">
          {{ busy() ? 'Working…' : confirmLabel() }}
        </button>
      </div>
    </app-modal>
  `,
  styles: `
    .actions {
      justify-content: flex-end;
      margin-top: 20px;
    }
  `,
})
export class ConfirmDialogComponent {
  readonly title = input('Are you sure?');
  readonly message = input.required<string>();
  readonly confirmLabel = input('Delete');
  readonly busy = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
