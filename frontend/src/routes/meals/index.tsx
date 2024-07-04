import { A } from "@solidjs/router";
import { For } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import Paginator from "~/components/Paginator";
import Filter from "~/components/ui/Filter";
import GridHeader from "~/components/ui/GridHeader";
import LinkBtn from "~/components/ui/LinkBtn";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";
import { mealOfDaySortOptions } from "~/utils/constants";

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [
      "meal-of-day",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
}

export default function MealOfDayListView() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { class: "", title: "Meal" },
    { class: "", title: "Order" },
    { class: "", title: "Created By" },
    { class: "", title: "Updated By" },
    { class: "", title: "Created" },
    { class: "", title: "Updated" },
    { class: "", title: "Edit" },
    { class: "", title: "Delete" },
  ];
  return (
    <main class="p-4">
      <Title>Meal of Day</Title>

      <div class="p-4">
        <div class="mb-4 flex items-start justify-between">
          <h1 class="text-xl font-bold">Meal of Day</h1>
          <div class="flex gap-2">
            <LinkBtn href="/food/create" label="New Food" />
            <LinkBtn href="/brands/create" label="New Brand" />
            <LinkBtn href="/meals/create" label="New Meal" />
          </div>
        </div>

        <div class="mb-4 flex gap-2">
          <div class="flex-1">
            <Search
              name="search"
              label="Search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
          <div class="flex-1"></div>
          <div class="flex-1"></div>
          <div class="flex-1">
            <Filter
              name="order"
              label="Sort"
              options={mealOfDaySortOptions}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>

        <Paginator />
        <div class="grid grid-cols-8">
          <GridHeader headers={headers} />
          <For each={data()}>{(data) => <MealOfDayListItem data={data} />}</For>
        </div>
        <Paginator />
      </div>
    </main>
  );
}

type MealOfDayListItemProps = {
  data: MealOfDay;
};

function MealOfDayListItem(props: MealOfDayListItemProps) {
  return (
    <div class="group contents">
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          class="text-blue-500 hover:underline"
          href={`/meals/${props.data.slug}`}
        >
          {props.data.name}
        </A>
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.ordering}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.created_by_id}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.updated_by_id}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.created_at}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.updated_at}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          class="text-blue-500 hover:underline"
          href={`${props.data.slug}/edit`}
        >
          Edit
        </A>
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          class="text-blue-500 hover:underline"
          href={`${props.data.slug}/delete`}
        >
          Delete
        </A>
      </div>
    </div>
  );
}
