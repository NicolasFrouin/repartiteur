export const BIG_WEEK_DAYS = [0, 1, 2, 5, 6];

export function getWeekDays(date: Date = new Date()) {
  const today = date;
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push(date);
  }

  return weekDays;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function getWeekNumber(date: Date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(
    (((d as unknown as number) - (yearStart as unknown as number)) / 86400000 + 1) / 7,
  );
}

export function isBigWeek(day: Date = new Date()) {
  return BIG_WEEK_DAYS.includes(day.getDay());
}

export function getDate(date: Date = new Date()) {
  return new Date(date.setHours(0, 0, 0, 0));
}
