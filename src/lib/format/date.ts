export function toIsoDate(year: number, month = 1, day = 1) {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}
