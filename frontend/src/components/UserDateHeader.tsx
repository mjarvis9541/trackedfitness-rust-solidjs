import { A, useLocation, useParams } from "solid-start";
import {
  addDayStr,
  addMonthStr,
  addWeekStr,
  formatDay,
  now,
  subDayStr,
  subMonthStr,
  subWeekStr,
} from "~/utils/datetime";
import { ChevronLeft, ChevronRight } from "./ui/Icon";

export default function UserDateHeader() {
  const location = useLocation();
  const params = useParams<{ username: string; date?: string }>();
  const getDate = () => params.date || now();

  const today = () => {
    if (location.pathname.includes("week"))
      return `/users/${params.username}/${now()}/week`;
    if (location.pathname.includes("month"))
      return `/users/${params.username}/${now()}/month`;
    return `/users/${params.username}`;
  };
  const next = () => {
    if (location.pathname.includes("week"))
      return `/users/${params.username}/${addWeekStr(getDate())}/week`;
    if (location.pathname.includes("month"))
      return `/users/${params.username}/${addMonthStr(getDate())}/month`;
    return `/users/${params.username}/${addDayStr(getDate())}`;
  };
  const prev = () => {
    if (location.pathname.includes("week"))
      return `/users/${params.username}/${subWeekStr(getDate())}/week`;
    if (location.pathname.includes("month"))
      return `/users/${params.username}/${subMonthStr(getDate())}/month`;
    return `/users/${params.username}/${subDayStr(getDate())}`;
  };

  return (
    <nav class="flex flex-wrap items-center justify-between gap-2 bg-zinc-700 px-4">
      <div class="flex gap-2">
        <ul class="flex gap-2">
          <li>
            <A
              class="flex bg-zinc-800 px-4 py-1.5 hover:bg-amber-300"
              href={today()}
            >
              Today
            </A>
          </li>
          <li>
            <A
              class="flex bg-zinc-800 px-4 py-1.5 hover:bg-amber-300"
              href={prev()}
            >
              <ChevronLeft />
            </A>
          </li>
          <li>
            <A
              class="flex bg-zinc-800 px-4 py-1.5 hover:bg-amber-300"
              href={next()}
            >
              <ChevronRight />
            </A>
          </li>
        </ul>
        <div>
          <h1 class="px-2 text-xl font-bold">
            {formatDay(new Date(getDate()))}
          </h1>
        </div>
      </div>

      <div class="flex gap-2">
        <A
          class={`px-4 py-1.5 hover:bg-amber-300 ${
            !location.pathname.includes("week") &&
            !location.pathname.includes("month")
              ? `bg-amber-300`
              : `bg-zinc-800`
          }`}
          href={`/users/${params.username}/${getDate()}`}
        >
          Day
        </A>
        <A
          class={`px-4 py-1.5 hover:bg-amber-300 ${
            location.pathname.includes("week") ? `bg-amber-300` : `bg-zinc-800`
          }`}
          href={`/users/${params.username}/${getDate()}/week`}
        >
          Week
        </A>
        <A
          class={`px-4 py-1.5 hover:bg-amber-300 ${
            location.pathname.includes("month") ? `bg-amber-300` : `bg-zinc-800`
          }`}
          href={`/users/${params.username}/${getDate()}/month`}
        >
          Month
        </A>
      </div>
    </nav>
  );
}
