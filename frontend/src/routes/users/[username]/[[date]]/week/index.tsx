import { For, Show, createEffect, createSignal } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DietWeekListHeader from "~/components/diet/DietWeekListHeader";
import DietWeekListItem from "~/components/diet/DietWeekListItem";
import DietWeekTotal from "~/components/diet/DietWeekTotal";
import { getRequest } from "~/services/api";
import { mergeDateRange } from "~/utils/create-month-range";
import { createWeekRange, now } from "~/utils/datetime";

export function routeData({ params }: RouteDataArgs) {
  const dietWeek = createServerData$(getRequest, {
    key: () => [`diet/${params.username}/${params?.date || now()}/week`],
  });
  const dietWeekTotal = createServerData$(getRequest, {
    key: () => [`diet/${params.username}/${params?.date || now()}/week-total`],
  });
  const dietWeekAverage = createServerData$(getRequest, {
    key: () => [
      `diet/${params.username}/${params?.date || now()}/week-average`,
    ],
  });
  const dietTarget = createServerData$(getRequest, {
    key: () => [`diet-target/${params.username}/${params?.date || now()}/week`],
  });
  const dietTargetTotal = createServerData$(getRequest, {
    key: () => [
      `diet-target/${params.username}/${params?.date || now()}/week-total`,
    ],
  });
  const dietTargetAverage = createServerData$(getRequest, {
    key: () => [
      `diet-target/${params.username}/${params?.date || now()}/week-average`,
    ],
  });
  const dietTargetLatest = createServerData$(getRequest, {
    key: () => [
      `diet-target/${params.username}/${params?.date || now()}/latest`,
    ],
  });

  return {
    dietWeek,
    dietWeekTotal,
    dietWeekAverage,
    dietTarget,
    dietTargetTotal,
    dietTargetAverage,
    dietTargetLatest,
  };
}

export default function UserDateWeekPage() {
  const {
    dietWeek,
    dietWeekTotal,
    dietWeekAverage,
    dietTarget,
    dietTargetTotal,
    dietTargetAverage,
    dietTargetLatest,
  } = useRouteData<typeof routeData>();

  const params = useParams<{ username: string; date: string }>();

  const [date, setDate] = createSignal(new Date(params.date || now()));
  createEffect(() => setDate(new Date(params.date || now())));

  const [weekRange, setWeekRange] = createSignal(createWeekRange(date()));
  createEffect(() => setWeekRange(createWeekRange(date())));

  return (
    <>
      <Title>Week</Title>
      <div class="m-4 border bg-zinc-800 p-4">
        <div class="grid grid-cols-checkbox-16">
          <Show
            when={
              dietWeek() && dietWeekTotal() && dietWeekAverage() && dietTarget()
            }
          >
            <div class="col-span-full">
              <h2 class="text-xl font-bold">Daily Totals</h2>
            </div>
            <DietWeekListHeader title={"Date"} subtitle={"Day"} />
            <For each={mergeDateRange(weekRange(), dietWeek())}>
              {(data) => (
                <DietWeekListItem username={params.username} data={data} />
              )}
            </For>
            <DietWeekTotal title={`Average`} data={dietWeekAverage()} />
            <DietWeekTotal title={`Total`} data={dietWeekTotal()} />

            <div class="col-span-full p-4"></div>

            <div class="col-span-full">
              <h2 class="text-xl font-bold">Daily Targets</h2>
            </div>

            <DietWeekListHeader title={"Date"} subtitle={"Day"} />
            <For each={mergeDateRange(weekRange(), dietTarget())}>
              {(data) => (
                <DietWeekListItem username={params.username} data={data} />
              )}
            </For>

            <DietWeekTotal title={`Average`} data={dietTargetAverage()} />
            <DietWeekTotal title={`Total`} data={dietTargetTotal()} />
            <Show when={dietTargetLatest()}>
              <DietWeekTotal title={`Latest`} data={dietTargetLatest()} />
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
