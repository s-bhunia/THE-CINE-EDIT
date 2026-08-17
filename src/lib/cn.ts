export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]) {
  return values
    .filter(
      (value) => value !== null && value !== undefined && value !== false && value !== '',
    )
    .join(' ');
}
