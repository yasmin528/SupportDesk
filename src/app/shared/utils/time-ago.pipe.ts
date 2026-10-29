import { Pipe, PipeTransform } from '@angular/core';

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const elapsed = new Date(value).getTime() - Date.now();
    for (const [unit, ms] of UNITS) {
      if (Math.abs(elapsed) >= ms) {
        return formatter.format(Math.round(elapsed / ms), unit);
      }
    }
    return 'just now';
  }
}
