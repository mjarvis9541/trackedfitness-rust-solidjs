import { format } from "date-fns";
import { For, Show } from "solid-js";
import {
  A,
  RouteDataArgs,
  Title,
  useParams,
  useRouteData,
  useSearchParams,
} from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import FoodListHeaderCTA from "~/components/food/FoodListHeaderCTA";
import Paginator from "~/components/Paginator";
import Filter from "~/components/ui/Filter";
import LinkBtn from "~/components/ui/LinkBtn";
import Search from "~/components/ui/Search";
import { getRequest, postRequest } from "~/services/api";

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

export async function dietCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  const date = form.get("date");
  const food_id = form.get("food_id");
  const meal_of_day_slug = form.get("meal_of_day_slug");
  const quantity = form.get("quantity");
  const data = await postRequest(request, "diet", {
    username,
    date,
    food_id,
    meal_of_day_slug,
    quantity,
  });
  return redirect(`/users/${username}/${date}`);
}

export default function DietAddFood() {
  const { food, brandFilter } = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; date: string; meal: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>Add Food</Title>

      <div class="p-4">
        <div class="mb-4 flex items-start justify-between">
          <div>
            <h1 class="text-xl font-bold">Add Food to Diet</h1>
            <div class="text-sm capitalize text-gray-400">
              {format(new Date(params.date), "eeee dd MMMM yyy")} -{" "}
              {params.meal}
            </div>
          </div>
          <div class="flex gap-2">
            <LinkBtn href="/food/create" label="New Food" />
            <LinkBtn href="/brands/create" label="New Brand" />
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
                  date={params.date}
                  username={params.username}
                  meal_of_day_slug={params.meal}
                  data={food}
                />
              )}
            </For>
          </div>
        </Show>
        <Paginator />
      </div>
    </main>
  );
}

type FoodListItemProps = {
  date: string;
  username: string;
  meal_of_day_slug: string;
  data: any;
};

function FoodListItem(props: FoodListItemProps) {
  const [action, { Form }] = createServerAction$(dietCreate);

  return (
    <div class="group contents">
      <Show when={action.error}>
        <div class="col-span-full p-2 font-bold text-red-500">
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </div>
      </Show>
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
            class="w-full rounded border-[1px] bg-zinc-800 p-2 outline-none placeholder:text-zinc-300 focus:border-[1px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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

        <input type="hidden" name="date" value={props.date} />
        <input type="hidden" name="username" value={props.username} />
        <input
          type="hidden"
          name="meal_of_day_slug"
          value={props.meal_of_day_slug}
        />
        <input type="hidden" name="food_id" value={props.data.id} />
        <div class="flex items-center justify-end px-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
          <button class="bg-zinc-700 px-4 py-1.5 text-sm font-semibold hover:bg-zinc-900">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}
