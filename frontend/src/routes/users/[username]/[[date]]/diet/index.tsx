import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontalIcon,
} from "~/components/ui/Icon";
import { getRequest } from "~/services/api";
import { addDayStr, subDayStr } from "~/utils/datetime";

export function routeData({ params }: RouteDataArgs) {
  const diet = createServerData$(getRequest, {
    key: () => [`diet/${params.username}/${params.date}`],
  });
  const target = createServerData$(getRequest, {
    key: () => [`diet-target/${params.username}/${params.date}/latest`],
  });
  return { diet, target };
}

export default function DietDayPage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; date: string }>();

  const next = () => addDayStr(params.date);
  const prev = () => subDayStr(params.date);

  return (
    <main class="p-4">
      <Title>Diet Day</Title>
      <div class="flex gap-2 py-2">
        <A
          href={`/users/${params.username}/${prev()}/diet`}
          class="grid place-self-center bg-zinc-800 px-3 py-1 hover:bg-amber-300"
        >
          <ChevronLeft />
        </A>
        <A
          href={`/users/${params.username}/${next()}/diet`}
          class="grid place-self-center bg-zinc-800 px-3 py-1 hover:bg-amber-300"
        >
          <ChevronRight />
        </A>
      </div>
      <div class="grid grid-cols-4 gap-4 md:grid-cols-12">
        <div class="col-span-4 border p-1">
          <Show when={data.diet().results}>
            <DietDayComponent
              username={params.username}
              date={params.date}
              diet={data.diet().results}
              target={data.target().results}
            />
          </Show>
        </div>
        <div class="col-span-4 border p-2">2</div>
        <div class="col-span-4 border p-2">3</div>
      </div>

      <pre>{JSON.stringify(data.diet().results, null, 2)}</pre>
    </main>
  );
}

function DietDayComponent(props: any) {
  return (
    <div class="grid grid-cols-4">
      <div class="col-span-4 px-1 pb-2 pt-1">{props.diet.date}</div>

      <For each={props.diet.meal}>
        {(meal) => <DietMealComponent meal={meal} />}
      </For>

      <Show when={props.diet}>
        <DietDayTotal diet={props.diet} classes={`border-amber-400 p-1 py-2`} />
      </Show>
    </div>
  );
}

function DietMealComponent(props: any) {
  return (
    <>
      <div class="col-span-full mb-2 border border-emerald-500 p-1">
        <div class="">
          <div class="flex justify-between p-2">
            <div class="font-bold">{props.meal.name}</div>
            <button class="p-1 hover:bg-zinc-700">
              <MoreHorizontalIcon />
            </button>
          </div>
          <Show when={props.meal}>
            <For each={props.meal.food}>
              {(food) => <DietFoodComponent food={food} />}
            </For>
          </Show>
        </div>
        <Show when={props.meal.energy > 1}>
          <DietDayTotal diet={props.meal} classes={`border-none p-1 py-2`} />
        </Show>
      </div>
    </>
  );
}

function DietFoodComponent(props: any) {
  return (
    <div class="mb-1 border border-pink-500 p-1">
      <div class="bg-zinc-800 p-2">
        <div class="flex justify-between">
          <div>{props.food.name}</div>
          <div>
            {props.food.data_value}
            {props.food.data_measurement}
          </div>
        </div>
        <div class="text-sm text-zinc-500">{props.food.brand_name}</div>
      </div>
    </div>
  );
}

function DietDayTotal(props: any) {
  return (
    <div class={`col-span-full border ${props.classes}`}>
      <div class="grid grid-cols-4">
        <div class="px-2 pb-0 pt-1 text-end">
          {Number(props.diet.energy).toFixed(0)}
          <span class="ml-0.5 text-sm text-zinc-400">kcal</span>
        </div>
        <div class="px-2 pb-0 pt-1 text-end">
          {Number(props.diet.protein).toFixed(0)}
          <span class="ml-0.5 text-sm text-zinc-400">g</span>
        </div>
        <div class="px-2 pb-0 pt-1 text-end">
          {Number(props.diet.carbohydrate).toFixed(0)}
          <span class="ml-0.5 text-sm text-zinc-400">g</span>
        </div>
        <div class="px-2 pb-0 pt-1 text-end">
          {Number(props.diet.fat).toFixed(0)}
          <span class="ml-0.5 text-sm text-zinc-400">g</span>
        </div>
        <div class="px-2 pb-1 pt-0 text-end text-sm text-zinc-500">
          Calories
        </div>
        <div class="px-2 pb-1 pt-0 text-end text-sm text-zinc-500">Protein</div>
        <div class="px-2 pb-1 pt-0 text-end text-sm text-zinc-500">Carbs</div>
        <div class="px-2 pb-1 pt-0 text-end text-sm text-zinc-500">Fat</div>
      </div>
    </div>
  );
}
