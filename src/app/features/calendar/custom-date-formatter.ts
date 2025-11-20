import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { formatDate } from '@angular/common';

export class CustomDateFormatter extends CalendarDateFormatter {
  override monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'EEEEE', locale ?? 'fr'); // 👉 "L", "M", "M", "J", etc.
  }
}