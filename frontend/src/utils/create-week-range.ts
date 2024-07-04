import { eachDayOfInterval, endOfWeek, formatISO, startOfWeek } from "date-fns";

export default function createWeekRange(date: string) {
  const now = new Date(date);
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  const sunday = endOfWeek(now, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: monday, end: sunday }).map((obj) => ({
    date: formatISO(obj, { representation: "date" }),
  }));
}
