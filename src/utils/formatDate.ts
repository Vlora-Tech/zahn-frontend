/**
 * Format a date string to German format with padded day and month (DD.MM.YYYY)
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string like "09.01.2026"
 */
export function formatDateDE(dateString: string | Date): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "-";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Format a date string to German format with time (DD.MM.YYYY HH:MM)
 * @param dateString - ISO date string or Date object
 * @returns Formatted datetime string like "09.01.2026 14:30"
 */
export function formatDateTimeDE(dateString: string | Date): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "-";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
