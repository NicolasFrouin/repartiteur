import { TCalendarOptions } from '@/types/utils';
import dayjs from 'dayjs';

export const HEADER_HEIGHT = 60;

export const MAIN_CONTENT_HEIGHT =
  'h-[calc(100vh-var(--header-height)-var(--app-shell-padding)*2-var(--app-shell-navbar-offset,0rem))]';

export const DEFAULT_CALENDAR_OPTIONS: TCalendarOptions = {
  date: dayjs().add(1, 'week').toISOString(),
  recurrence: true,
};
