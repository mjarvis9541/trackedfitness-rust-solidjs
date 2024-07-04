import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { useSearchParams } from "solid-start/router";
import { createServerAction$, createServerData$ } from "solid-start/server";
import Paginator from "~/components/Paginator";
import FoodListHeaderCTA from "~/components/food/FoodListHeaderCTA";
import FoodMacro from "~/components/food/FoodMacro";
import MealTotal from "~/components/meals/MealTotal";
import Filter from "~/components/ui/Filter";
import GridHeader from "~/components/ui/GridHeader";
import HiddenInput from "~/components/ui/HiddenInput";
import Search from "~/components/ui/Search";
import { getRequest, postRequest } from "~/services/api";
import { foodSortOptions, servingOptions } from "~/utils/constants";

export function routeData({ params, location }: RouteDataArgs) {
  const meal = createServerData$(getRequest, {
    key: () => [`meals/${params.id}`],
  });
  const mealFood = createServerData$(getRequest, {
    key: () => [`meals/${params.id}/food`],
  });
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
  return { meal, mealFood, food, brandFilter };
}

export async function mealFoodCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  const meal_id = form.get("meal_id");
  const food_id = form.get("food_id");
  const quantity = form.get("quantity");
  return await postRequest(request, "meal-food", {
    username,
    meal_id,
    food_id,
    quantity,
  });
}

export default function MealDetailPage() {
  const { meal, mealFood, food, brandFilter } =
    useRouteData<typeof routeData>();
  const params = useParams<{ username: string; id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { class: "col-span-3", title: "Food" },
    { class: "text-end", title: "Quantity" },
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
      <Title>Meal Detail</Title>

      <div class="mb-4 border bg-zinc-800 p-4">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-xl font-bold">
              Meal Detail - {meal() && meal().name}
            </h1>
            <p class="text-sm capitalize text-gray-400">
              <A class="hover:underline" href={`/users/${params.username}`}>
                {params.username}
              </A>
            </p>
          </div>
          <div class="flex gap-2">
            <A
              class="inline-block rounded bg-zinc-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-900"
              href="edit"
            >
              Rename
            </A>
            <A
              class="inline-block rounded bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
              href="delete"
            >
              Delete
            </A>
          </div>
        </div>

        <div class="grid grid-cols-12">
          <GridHeader headers={headers} />
          <Show when={mealFood()}>
            <For each={mealFood().food}>
              {(data) => (
                <SavedMealListItem username={params.username} data={data} />
              )}
            </For>
            <MealTotal title="Total" data={mealFood()} />
          </Show>
        </div>
      </div>

      <div class="p-4">
        <h1 class="text-xl font-bold">Add Food to Meal</h1>

        <div class="mb-4 flex gap-2">
          <Search
            name="search"
            label="Search"
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
          <Filter
            name="serving"
            label="Serving"
            defaultOption="All"
            defaultValue=""
            options={servingOptions}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
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
          <Filter
            name="order"
            label="Sort"
            options={foodSortOptions}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </div>
        <Paginator />
        <Show when={food()}>
          <div class="grid grid-cols-input-12">
            <FoodListHeaderCTA />
            <For each={food()}>
              {(food) => (
                <FoodListItem
                  meal_id={params.id}
                  username={params.username}
                  data={food}
                />
              )}
            </For>
          </div>
        </Show>
      </div>

      <pre>{JSON.stringify(meal(), null, 2)}</pre>
    </main>
  );
}
type SavedMealListItemProps = {
  username: string;
  data: any;
};

function SavedMealListItem(props: SavedMealListItemProps) {
  return (
    <div class="group contents">
      <div class="col-span-3 flex flex-col items-start justify-start px-2 py-1 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <span class="">
          <A
            class="text-blue-500 hover:underline"
            href={`/users/${props.username}/meals/${props.data.meal_id}/${props.data.id}`}
          >
            {props.data.food_name}
          </A>
        </span>
        <span class="text-sm">
          <A class="hover:underline" href={`/brands/${props.data.brand_slug}`}>
            {props.data.brand_name}
          </A>
        </span>
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          class="hover:underline"
          href={`/users/${props.username}/meals/${props.data.meal_id}/${props.data.id}/edit`}
        >
          {props.data.data_value}
          {props.data.data_measurement}
        </A>
      </div>
      <FoodMacro data={props.data} />
    </div>
  );
}

type FoodListItemProps = {
  username: string;
  meal_id: string;
  data: any;
};

function FoodListItem(props: FoodListItemProps) {
  const [action, { Form }] = createServerAction$(mealFoodCreate);

  return (
    <div class="group contents">
      <Form class="contents">
        <div class="col-span-2 flex flex-col items-start justify-start px-2 py-1 group-odd:bg-zinc-800 group-hover:bg-amber-300">
          <span class="">
            <A
              class="text-blue-500 hover:underline"
              href={`/food/${props.data.slug}`}
            >
              {props.data.name}
            </A>
          </span>
          <span class="text-sm">
            <A
              class="hover:underline"
              href={`/brands/${props.data.brand_slug}`}
            >
              {props.data.brand_name}
            </A>
          </span>
        </div>
        <div class="relative flex items-center justify-end group-odd:bg-zinc-800 group-hover:bg-amber-300">
          <input
            type="text"
            name="quantity"
            autocomplete="off"
            class="w-full rounded border-[1px] border-zinc-700 bg-zinc-700 p-2 outline-none placeholder:text-zinc-300 focus:border-[1px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={props.data.data_value}
          />
          <span class="absolute right-4 text-sm ">
            {props.data.data_measurement}
          </span>
        </div>
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
        <HiddenInput name="username" value={props.username} />
        <HiddenInput name="meal_id" value={props.meal_id} />
        <HiddenInput name="food_id" value={props.data.id} />
        <div class="flex items-center justify-end px-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
          <button class="bg-zinc-700 px-4 py-1.5 text-sm font-semibold hover:bg-zinc-900">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}
