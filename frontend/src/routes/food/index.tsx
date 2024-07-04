import { For, Show } from "solid-js";
import {
  A,
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import Paginator from "~/components/Paginator";
import FoodListHeader from "~/components/food/FoodListHeader";
import Filter from "~/components/ui/Filter";
import LinkBtn from "~/components/ui/LinkBtn";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";
import { foodSortOptions, servingOptions } from "~/utils/constants";

export function routeData({ location }: RouteDataArgs) {
  const food = createServerData$(getRequest, {
    key: () => [
      "food",
      location.query,
      location.query["search"],
      location.query["brand"],
      location.query["serving"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const brandFilter = createServerData$(getRequest, {
    key: () => ["brands/filter"],
  });
  return { food, brandFilter };
}

export default function FoodListPage() {
  const { food, brandFilter } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>Food</Title>

      <div class="p-4">
        <div class="mb-4 flex items-start justify-between">
          <h1 class="text-xl font-bold">Food</h1>
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
          <div class="flex-1">
            <Filter
              name="serving"
              label="Serving"
              defaultOption="All"
              defaultValue=""
              options={servingOptions}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
          <div class="flex-1">
            <Show when={brandFilter()}>
              <Filter
                name="brand"
                label="Brand"
                defaultOption="All"
                defaultValue=""
                options={brandFilter()}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            </Show>
          </div>
          <div class="flex-1">
            <Filter
              name="order"
              label="Sort"
              options={foodSortOptions}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>

        <Paginator />
        <div class="grid grid-cols-12">
          <FoodListHeader />
          <For each={food()}>{(data) => <FoodListItem data={data} />}</For>
        </div>
        <Paginator />
      </div>
    </main>
  );
}

function FoodListItem(props: any) {
  return (
    <div class="group contents">
      <div class="col-span-3 flex flex-col items-start justify-start px-2 py-1 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <span class="">
          <A
            class="text-blue-500 hover:underline"
            href={`/food/${props.data.slug}`}
          >
            {props.data.name}
          </A>
        </span>
        <span class="text-sm">
          <A class="hover:underline" href={`/brands/${props.data.brand_slug}`}>
            {props.data.brand_name}
          </A>
        </span>
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A class="hover:underline" href={`/food/${props.data.slug}/edit`}>
          {props.data.data_value}
          {props.data.data_measurement}
        </A>
      </div>
      <FoodMacroItem data={props.data} />
    </div>
  );
}

function FoodMacroItem(props: any) {
  return (
    <>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.energy).toFixed(0)}kcal
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.protein).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.carbohydrate).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.fat).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.saturates).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.sugars).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.fibre).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.salt).toFixed(2)}
      </div>
    </>
  );
}
