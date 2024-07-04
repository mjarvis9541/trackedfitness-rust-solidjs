import { For, Show } from "solid-js";
import { A, RouteDataArgs, Title, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import FoodDetail from "~/components/food/FoodDetail";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { getRequest, postRequest } from "~/services/api";
import { getUsername } from "~/services/sessions";
import { now } from "~/utils/datetime";

export function routeData({ params }: RouteDataArgs) {
  const food = createServerData$(getRequest, {
    key: () => [`food/${params.slug}`],
  });
  const mealOfDaySelect = createServerData$(getRequest, {
    key: () => ["meal-of-day/select"],
  });
  const savedMealSelect = createServerData$(getRequest, {
    key: () => ["meals/select"],
  });
  return { food, mealOfDaySelect, savedMealSelect };
}

export default function FoodDetailPage() {
  const { food, mealOfDaySelect, savedMealSelect } =
    useRouteData<typeof routeData>();
  const [action, { Form: FoodToDietForm }] = createServerAction$(
    async (form: FormData, { request }) => {
      const username = await getUsername(request);
      const date = form.get("date");
      const food_id = form.get("food_id");
      const meal_of_day_id = form.get("meal_of_day_id");
      const quantity = form.get("quantity");
      const data = await postRequest(request, "diet", {
        username: username,
        date: date,
        food_id: food_id,
        meal_of_day_id: meal_of_day_id,
        quantity: quantity,
      });
      return redirect(`/users/${username}/${data.date}`);
    },
  );
  const [mealAction, { Form: FoodToMealForm }] = createServerAction$(
    async (form: FormData, { request }) => {
      const username = await getUsername(request);
      const meal_id = form.get("meal_id");
      const food_id = form.get("food_id");
      const quantity = form.get("quantity");
      const data = await postRequest(request, "meal-food", {
        username: username,
        meal_id: meal_id,
        food_id: food_id,
        quantity: quantity,
      });
      return redirect(`/users/${username}/meals/${meal_id}`);
    },
  );

  return (
    <main class="p-4">
      <Title>Food Detail</Title>

      <div class="grid grid-cols-4 gap-4 md:grid-cols-8 lg:grid-cols-12">
        <div class="col-span-4">
          <div class="p-4">
            <Show when={food()} fallback={<LoadingSpinner />}>
              <h1 class="text-xl font-bold">
                {food().name}, {food().data_value}
                {food().data_measurement}
              </h1>

              <p class="mb-4 font-bold text-gray-500 hover:underline">
                <A href={`/brands/${food()?.brand_slug}`}>
                  {food()?.brand_name}
                </A>
              </p>

              <h2 class="mb-2 font-bold">Nutrition Information</h2>
              <div class="mb-4">
                <FoodDetail data={food()} />
              </div>
            </Show>
            <p>
              <A href="edit">Edit</A>
            </p>
            <p>
              <A href="delete">Delete</A>
            </p>
          </div>
        </div>

        <div class="col-span-4">
          <div class="p-4">
            <h2 class="mb-4 text-xl font-bold">Add to Diet</h2>
            <Show when={food() && mealOfDaySelect()}>
              <FoodToDietForm>
                <input type="hidden" name="food_id" value={food().id} />
                <Input name="date" type="date" value={now()} />
                <label class="mb-4 block">
                  <span class="mb-1 text-sm font-bold">Meal</span>
                  <select
                    name="meal_of_day_id"
                    class="block h-[42px] w-full rounded border bg-zinc-800 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500"
                  >
                    <Show when={mealOfDaySelect()}>
                      <For each={mealOfDaySelect()}>
                        {(option) => (
                          <option value={option.id}>{option.name}</option>
                        )}
                      </For>
                    </Show>
                  </select>
                </label>
                <Input
                  name="quantity"
                  label={`Quantity (${food().data_measurement})`}
                  value={food().data_value}
                />
                <Button label="Add to Diet" />
              </FoodToDietForm>
            </Show>
          </div>
        </div>
        <div class="col-span-4">
          <div class="p-4">
            <h2 class="mb-4 text-xl font-bold">Add to Meal</h2>
            <Show when={food() && savedMealSelect()}>
              <FoodToMealForm>
                <input type="hidden" name="food_id" value={food().id} />
                <label class="mb-4 block">
                  <span class="mb-1 text-sm font-bold">Meal</span>
                  <select
                    name="meal_id"
                    class="block h-[42px] w-full rounded border bg-zinc-800 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500"
                  >
                    <Show when={savedMealSelect()}>
                      <For each={savedMealSelect()}>
                        {(option) => (
                          <option value={option.id}>{option.name}</option>
                        )}
                      </For>
                    </Show>
                  </select>
                </label>
                <Input
                  name="quantity"
                  label={`Quantity (${food().data_measurement})`}
                  value={food().data_value}
                />
                <Button label="Add to Meal" />
              </FoodToMealForm>
            </Show>
          </div>
        </div>
      </div>

      {/* <pre>{JSON.stringify(food(), null, 2)}</pre> */}
    </main>
  );
}
