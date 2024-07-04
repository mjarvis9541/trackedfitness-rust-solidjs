import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meal-food/${params.mealFoodId}`],
  });
}

export default function MealFoodDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{
    username: string;
    id: string;
    mealFoodId: string;
  }>();

  return (
    <main class="p-4">
      <Title>Delete Meal Food</Title>

      <div class="p-4">
        <h1 class="text-xl font-bold">Delete Meal Food</h1>

        <p>Are you sure you wish to delete this item?</p>

        <Show when={data()}>
          <p class="font-bold">
            {data().food_name} {data().data_value}
            {data().data_measurement}
          </p>
        </Show>

        <p>This action cannot be undone.</p>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <div class="max-w-sm">
          <DeleteForm
            url={`meal-food/${params.mealFoodId}`}
            redirectTo={`/users/${params.username}/meals/${params.id}`}
          />
        </div>
      </div>
    </main>
  );
}
