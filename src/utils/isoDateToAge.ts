export function isoDateToAge(isoString, now = new Date()) {
  const birth = new Date(isoString);
  if (Number.isNaN(birth.getTime())) throw new Error("Invalid date string");
  if (birth.getTime() > now.getTime())
    throw new Error("Birth date is in the future");

  // Work in UTC to avoid TZ/ DST surprises
  const by = birth.getUTCFullYear();
  const bm = birth.getUTCMonth();
  const bd = birth.getUTCDate();

  const ny = now.getUTCFullYear();
  const nm = now.getUTCMonth();
  const nd = now.getUTCDate();

  // Years
  let years = ny - by;
  if (nm < bm || (nm === bm && nd < bd)) years -= 1;

  // Months (borrow 1 month if day-of-month has not yet been reached)
  let months = nm - bm;
  if (nd < bd) months -= 1;
  if (months < 0) months += 12;

  // Days
  let days;
  if (nd >= bd) {
    days = nd - bd;
  } else {
    // Borrow from the previous month relative to "now"
    const prevMonthIndex = (nm + 11) % 12;
    const prevMonthYear = nm === 0 ? ny - 1 : ny;
    const daysInPrevMonth = new Date(
      Date.UTC(prevMonthYear, prevMonthIndex + 1, 0)
    ).getUTCDate();
    days = daysInPrevMonth - bd + nd;
  }

  // Never show zero-units in the output; ensure at least "1 Tag"
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Jahr" : "Jahre"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "Monat" : "Monate"}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? "Tag" : "Tage"}`);

  if (parts.length === 0) {
    // same calendar day as birthdate → report at least 1 day
    return "1 Tag";
  }
  return parts.join(", ");
}
