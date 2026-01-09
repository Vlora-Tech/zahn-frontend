export function isoDateToAge(isoString, now = new Date()) {
  const birth = new Date(isoString);

  if (Number.isNaN(birth.getTime())) {
    throw new Error("Invalid date string");
  }

  if (birth.getTime() > now.getTime()) {
    throw new Error("Birth date is in the future");
  }

  const by = birth.getUTCFullYear();
  const bm = birth.getUTCMonth();
  const bd = birth.getUTCDate();

  const ny = now.getUTCFullYear();
  const nm = now.getUTCMonth();
  const nd = now.getUTCDate();

  let age = ny - by;

  if (nm < bm || (nm === bm && nd < bd)) {
    age -= 1;
  }

  return age;
}
