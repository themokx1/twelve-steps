export function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

export function daysFromNow(days: number) {
  return nowUnix() + days * 24 * 60 * 60;
}

export function getDateKeyInTimeZone(timeZone = "Europe/Budapest", date = new Date()) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(date);
}
