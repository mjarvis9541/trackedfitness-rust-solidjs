import { getMonth } from "date-fns";
import { For, createEffect, createSignal } from "solid-js";
import { A, useParams } from "solid-start";
import {
  addMonthStr,
  createMonthRange,
  formatDateStrDay,
  formatDateStrMonthYear,
  now,
  subMonthStr,
} from "~/utils/datetime";
import { ChevronLeft, ChevronRight } from "./Icon";

export default function Calendar() {
  const params = useParams<{ username: string; date?: string }>();
  const getDateParam = () => params.date || now();

  const [calendarDate, setCalendarDate] = createSignal(getDateParam());
  createEffect(() => setCalendarDate(getDateParam()));
  const range = () => createMonthRange(calendarDate());

  return (
    <div>
      <div class="flex select-none justify-between py-2 pl-1 pr-1 text-sm">
        <div class="flex items-center font-bold ">
          {formatDateStrMonthYear(calendarDate())}
        </div>
        <div class="flex gap-1">
          <button
            class="flex items-center justify-center p-1 hover:bg-zinc-800"
            onclick={() => setCalendarDate(subMonthStr(calendarDate()))}
          >
            <ChevronLeft />
          </button>
          <button
            class="flex items-center justify-center p-1 hover:bg-zinc-800"
            onclick={() => setCalendarDate(addMonthStr(calendarDate()))}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      <div class="grid grid-cols-7 bg-zinc-800 px-1 pb-2 pt-1 text-sm">
        <div class="flex items-center justify-center p-2 text-zinc-400">M</div>
        <div class="flex items-center justify-center p-2 text-zinc-400">T</div>
        <div class="flex items-center justify-center p-2 text-zinc-400">W</div>
        <div class="flex items-center justify-center p-2 text-zinc-400">T</div>
        <div class="flex items-center justify-center p-2 text-zinc-400">F</div>
        <div class="flex items-center justify-center p-2 text-zinc-400">S</div>
        <div class="flex items-center justify-center p-2 text-zinc-400">S</div>
        <For each={range()}>
          {(date) => (
            <DateItem
              date={date}
              username={params.username}
              calendar_date={calendarDate()}
              viewed_date={getDateParam()}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function DateItem(props: any) {
  const isToday = () => props.date.date === now();
  const isCurrent = () =>
    getMonth(new Date(props.date.date)) ===
    getMonth(new Date(props.calendar_date));
  const isViewed = () => props.date.date === props.viewed_date;
  return (
    <A
      class={`flex items-center justify-center p-2 hover:bg-blue-600 ${
        isToday() && `bg-blue-600`
      } ${!isCurrent() && `text-zinc-500`} ${
        isViewed() && !isToday() && `bg-blue-300`
      }`}
      href={`/users/${props.username}/${props.date.date}`}
    >
      {formatDateStrDay(props.date.date)}
    </A>
  );
}
