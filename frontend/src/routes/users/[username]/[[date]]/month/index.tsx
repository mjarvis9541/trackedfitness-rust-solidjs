import { A, useParams } from "@solidjs/router";
import { format, isSunday } from "date-fns";

import { For, Show, createSignal } from "solid-js";
import { RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";
import { formatWeekShort, now } from "~/utils/datetime";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`diet/${params.username}/${params?.date || now()}/day-total`],
  });
}

export default function UserDateMonthPage() {
  const data = useRouteData<typeof routeData>();

  const params = useParams<{ username: string; date: string }>();
  const [showTarget, setShowTarget] = createSignal(true);

  return (
    <>
      <Title>Month</Title>
      <div class="mb-4 flex justify-end px-4 py-2">
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1 hover:bg-zinc-700"
            onClick={() => setShowTarget(!showTarget())}
          >
            Show Targets
          </button>
        </div>
      </div>

      <main class="px-4 py-2 pt-4">
        <div class="grid grid-cols-1 gap-2 md:grid-cols-4 lg:grid-cols-8">
          <div class="text-center font-bold">Mon</div>
          <div class="text-center font-bold">Tue</div>
          <div class="text-center font-bold">Wed</div>
          <div class="text-center font-bold">Thu</div>
          <div class="text-center font-bold">Fri</div>
          <div class="text-center font-bold">Sat</div>
          <div class="text-center font-bold">Sun</div>
          <div class="text-center font-bold">Average</div>
          <For each={data()}>
            {(data) => (
              <>
                <MonthItem
                  data={data}
                  username={params.username}
                  showTarget={showTarget}
                />
                <Show when={isSunday(new Date(data.date))}>
                  <TotalItem data={data} username={params.username} />
                </Show>
              </>
            )}
          </For>
        </div>
      </main>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </>
  );
}

function MonthDateItem(props: any) {
  return (
    <A
      class={`flex justify-center  p-1 text-sm font-bold hover:bg-amber-200 ${
        props.data.date === now() ? `bg-amber-400 text-zinc-900` : `bg-zinc-800`
      }`}
      href={`/users/${props.username}/${props.data.date}`}
    >
      {format(new Date(props.data.date), "dd")}
    </A>
  );
}

function MonthDietItem(props: any) {
  return (
    <A
      href={`/users/${props.username}/${props.data.date}`}
      class={`mb-1 block p-2 hover:bg-amber-300 ${
        props.data?.energy ? `bg-amber-200 text-zinc-900` : ``
      }`}
    >
      <div class="mb-1 flex items-end">
        <div class="flex-1 text-xs text-zinc-500">Calories</div>
        <div class="flex-1 text-end">
          {Number(props.data.energy || 0).toFixed(0)}kcal
        </div>
      </div>

      <div class="flex">
        <div class="flex-1 text-end">
          {Number(props.data.protein || 0).toFixed(0)}g
        </div>
        <div class="flex-1 text-end">
          {Number(props.data.carbohydrate || 0).toFixed(0)}g
        </div>
        <div class="flex-1 text-end">
          {Number(props.data.fat || 0).toFixed(0)}g
        </div>
      </div>

      <div class="flex">
        <div class="flex-1 text-end text-xs text-zinc-500">Protein</div>
        <div class="flex-1 text-end text-xs text-zinc-500">Carbs</div>
        <div class="flex-1 text-end text-xs text-zinc-500">Fat</div>
      </div>
    </A>
  );
}

type MonthItemProps = {
  username: string;
  data: any;
  showTarget: any;
};

function MonthItem(props: MonthItemProps) {
  return (
    <div
      class={`${props.data.date === now() ? `bg-amber-300 text-zinc-900` : ``}`}
    >
      <MonthDateItem username={props.username} data={props.data} />
      <MonthDietItem username={props.username} data={props.data} />

      {/* target */}
      <Show when={props.showTarget()}>
        <div class="bg-zinc-600 p-2 hover:bg-amber-300">
          <A
            href={
              props.data?.target_energy
                ? `/users/${props.username}/diet-target/${props.data.date}`
                : `/users/${props.username}/diet-target/create?date=${props.data.date}`
            }
          >
            <div class="flex items-end justify-between">
              <div class="flex-1 text-xs text-zinc-500">Calories</div>
              <div class="flex flex-1 justify-end">
                {Number(props.data.target_energy || 0).toFixed(0)}kcal
              </div>
            </div>
            <div class="flex">
              <div class="flex-1 text-end">
                {Number(props.data.target_protein || 0).toFixed(0)}g
              </div>
              <div class="flex-1 text-end">
                {Number(props.data.target_carbohydrate || 0).toFixed(0)}g
              </div>
              <div class="flex-1 text-end">
                {Number(props.data.target_fat || 0).toFixed(0)}g
              </div>
            </div>
            <div class="flex">
              <div class="flex-1 text-end text-xs text-zinc-500">Protein</div>
              <div class="flex-1 text-end text-xs text-zinc-500">Carbs</div>
              <div class="flex-1 text-end text-xs text-zinc-500">Fat</div>
            </div>
          </A>
        </div>
      </Show>

      {/* progress */}
      <div
        class={`px-2 py-1 font-semibold ${
          props.data?.progress_id
            ? `bg-amber-400 text-zinc-900`
            : `hover:bg-amber-200`
        }`}
      >
        <A
          href={
            props.data?.progress_id
              ? `/users/${props.username}/progress/${props.data.date}`
              : `/users/${props.username}/progress/create?date=${props.data.date}`
          }
        >
          <div class="mb-1 flex items-center justify-between">
            <div class=""></div>
            <div>{props.data.energy_burnt || 0}kcal</div>
          </div>

          <div class="flex items-center justify-between">
            <div class=""></div>
            <div class="text-end">
              {Number(props.data.weight || 0).toFixed(1)}kg
            </div>
          </div>
        </A>
      </div>
    </div>
  );
}

function TotalItem(props: any) {
  return (
    <div class="bg-zinc-700">
      <div
        class={`px-2 py-1 text-end text-sm font-bold hover:bg-amber-300 ${
          props.data?.week_avg_energy ? `bg-amber-300 text-zinc-900` : ``
        }`}
      >
        Week {formatWeekShort(new Date(props.data.date))}
      </div>
      <A
        href={`/users/${props.username}/${props.data.date}/week`}
        class="mb-1 block bg-zinc-800 p-2 hover:bg-amber-200"
      >
        <div class="mb-1 flex items-end">
          <div class="flex-1 text-xs text-zinc-500">Calories</div>
          <div class="flex-1 text-end">
            {Number(props.data.week_avg_energy || 0).toFixed(0)}kcal
          </div>
        </div>

        <div class="flex">
          <div class="flex-1 text-end">
            {Number(props.data.week_avg_protein || 0).toFixed(0)}g
          </div>
          <div class="flex-1 text-end">
            {Number(props.data.week_avg_carbohydrate || 0).toFixed(0)}g
          </div>
          <div class="flex-1 text-end">
            {Number(props.data.week_avg_fat || 0).toFixed(0)}g
          </div>
        </div>
        <div class="flex">
          <div class="flex-1 text-end text-xs text-zinc-500">Protein</div>
          <div class="flex-1 text-end text-xs text-zinc-500">Carbs</div>
          <div class="flex-1 text-end text-xs text-zinc-500">Fat</div>
        </div>
      </A>

      <div class="p-2">
        <div class="text-end">
          {Number(props.data.week_avg_energy_burnt).toFixed(0)}kcal
        </div>
        <div class="text-end">
          {Number(props.data.week_avg_weight).toFixed(1)}kg
        </div>
      </div>
      <div></div>
    </div>
  );
}
