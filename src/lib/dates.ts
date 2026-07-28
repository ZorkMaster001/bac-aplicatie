// Utilitare de dată în fusul orar local.

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isYesterday(key: string, now: Date = new Date()): boolean {
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return key === todayKey(y);
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = new Date(`${iso}T00:00:00`);
  const start = new Date(`${todayKey(now)}T00:00:00`);
  return Math.max(0, Math.round((target.getTime() - start.getTime()) / 86_400_000));
}

// Următoarea sesiune de bac: 15 iunie al anului curent sau următor.
export function nextBacDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const thisYear = new Date(`${year}-06-15T00:00:00`);
  return thisYear.getTime() > now.getTime() ? `${year}-06-15` : `${year + 1}-06-15`;
}
