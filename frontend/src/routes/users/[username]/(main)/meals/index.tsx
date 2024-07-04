import { For } from "solid-js";
import {
  A,
  RouteDataArgs,
  Title,
  useParams,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import FoodMacro from "~/components/food/FoodMacro";
import Paginator from "~/components/Paginator";
import Filter from "~/components/ui/Filter";
import GridHeader from "~/components/ui/GridHeader";
import LinkBtn from "~/components/ui/LinkBtn";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";

import { mealSortOptions } from "~/utils/constants";

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [
      "meals",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
}

export default function SavedMealListPage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { class: "col-span-3", title: "Meal" },
    { class: "text-end", title: "Food" },
    { class: "text-end", title: "Calories" },
    { class: "text-end", title: "Protein" },
    { class: "text-end", title: "Carbs" },
    { class: "text-end", title: "Fat" },
    { class: "text-end", title: "Sat. Fat" },
    { class: "text-end", title: "Sugars" },
    { class: "text-end", title: "Fibre" },
    { class: "text-end", title: "Salt" },
  ];
  return (
    <main class="p-4">
      <Title>Saved Meals</Title>

      <div class="p-4">
        <div class="mb-4 flex items-start justify-between">
          <h1 class="text-xl font-bold">Saved Meals</h1>
          <div class="flex gap-2">
            <LinkBtn href="/food/create" label="New Food" />
            <LinkBtn href="/brands/create" label="New Brand" />
            <LinkBtn href="/meals/create" label="New Meal" />
          </div>
        </div>
        <div class="mb-4 flex gap-2">
          <Search
            name="search"
            label="Search"
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
          <Filter
            name="order"
            label="Sort"
            options={mealSortOptions}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </div>

        <div class="grid grid-cols-12">
          <GridHeader headers={headers} />
          <For each={data()}>
            {(data) => (
              <SavedMealListItem username={params.username} data={data} />
            )}
          </For>
        </div>

        <Paginator />
      </div>
    </main>
  );
}

function SavedMealListItem(props: any) {
  return (
    <div class="group contents">
      <div class="col-span-3 flex flex-col items-start justify-start px-2 py-1 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <span class="">
          <A
            class="text-blue-500 hover:underline"
            href={`/users/${props.username}/meals/${props.data.id}`}
          >
            {props.data.name}
          </A>
        </span>
        <span class="text-sm">
          <A class="hover:underline" href={`/users/${props.data.username}`}>
            {props.data.username}
          </A>
        </span>
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.food_count}
      </div>
      <FoodMacro data={props.data} />
    </div>
  );
}
