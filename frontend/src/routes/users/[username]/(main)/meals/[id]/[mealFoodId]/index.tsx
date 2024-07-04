import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import FoodDetail from "~/components/food/FoodDetail";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meal-food/${params.mealFoodId}`],
  });
}

export default function MealFoodDetailPage() {
  const data = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Meal Food Detail</Title>

      <div class="p-4">
        <h1 class="text-xl font-bold">Meal Food Detail</h1>

        <Show when={data()} fallback={<LoadingSpinner />}>
          <h1 class="text-xl font-bold hover:underline">
            <A href={`/food/${data().food_slug}`}>
              {data().food_name}, {data().data_value}
              {data().data_measurement}
            </A>
          </h1>

          <p class="mb-4 font-bold text-gray-500 hover:underline">
            <A href={`/brands/${data()?.brand_slug}`}>{data()?.brand_name}</A>
          </p>

          <h2 class="mb-2 font-bold">Nutrition Information</h2>
          <div class="mb-4 max-w-lg">
            <FoodDetail data={data()} />
          </div>
        </Show>

        <p>
          <A href="edit">Edit</A>
        </p>
        <p>
          <A href="delete">Delete</A>
        </p>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
