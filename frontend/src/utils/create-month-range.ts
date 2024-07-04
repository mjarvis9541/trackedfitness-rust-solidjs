import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  formatISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export default function createMonthRange(into: any) {
  const now = new Date(into);
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);
  const monday = startOfWeek(startMonth, { weekStartsOn: 1 });
  const sunday = endOfWeek(endMonth, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: monday, end: sunday }).map((obj) => ({
    date: formatISO(obj, { representation: "date" }),
  }));
}

export function mergeDateRange(dateRange: any[], dataset: any[]) {
  return dateRange.map(
    (dateObj) => dataset.find((item) => item.date === dateObj.date) || dateObj,
  );
}
