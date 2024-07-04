import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

// https://date-fns.org/v2.16.1/docs/format

export function addDayStr(date: string) {
  return formatDate(addDays(new Date(date), 1));
}
export function subDayStr(date: string) {
  return formatDate(subDays(new Date(date), 1));
}
export function addWeekStr(date: string) {
  return formatDate(addWeeks(new Date(date), 1));
}
export function subWeekStr(date: string) {
  return formatDate(subWeeks(new Date(date), 1));
}
export function addMonthStr(date: string) {
  return formatDate(addMonths(new Date(date), 1));
}
export function subMonthStr(date: string) {
  return formatDate(subMonths(new Date(date), 1));
}

export function formatDateStr(date: string) {
  return format(new Date(date), "eee dd MMM, p");
}
export function formatDateStrLong(date: string) {
  return format(new Date(date), "EEEE dd MMMM");
}
export function formatDateStrMonthYear(date: string) {
  return format(new Date(date), "MMMM yyyy");
}
export function formatDateStrDay(date: string) {
  return format(new Date(date), "dd");
}

export function formatDateMonthYear(date: Date) {
  return format(date, "MMMM yyyy");
}
// Old:

export function formatDateLong(date: string) {
  return format(new Date(date), "EEEE dd MMMM yyyy");
}

export function formatDateDay(date: string) {
  return format(new Date(date), "EEEE");
}

export function now() {
  return formatISO(new Date(), { representation: "date" });
}

export function fromDateString(date: string, into: string) {
  return format(new Date(date), into);
}

export function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function formatMonth(date: Date) {
  return format(date, "MMMM yyyy");
}

export function formatWeekShort(date: Date) {
  return format(date, "II");
}

export function formatWeek(date: Date) {
  return format(date, "II, MMMM yyyy");
}

export function formatDay(date: Date) {
  return format(date, "EEEE dd MMMM yyyy");
}

export function formatTime(date: string) {
  return format(new Date(date), "pp");
}

export function createWeekRange(date: Date) {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  const sunday = endOfWeek(date, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: monday, end: sunday }).map((obj) => ({
    date: formatISO(obj, { representation: "date" }),
  }));
}

export function createMonthRange(from: string) {
  const date = new Date(from);
  const startMonth = startOfMonth(date);
  const endMonth = endOfMonth(date);
  const monday = startOfWeek(startMonth, { weekStartsOn: 1 });
  const sunday = endOfWeek(endMonth, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: monday, end: sunday }).map((obj) => ({
    date: formatISO(obj, { representation: "date" }),
  }));
}
