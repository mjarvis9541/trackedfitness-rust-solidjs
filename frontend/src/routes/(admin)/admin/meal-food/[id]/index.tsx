import { A, RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meal-food/${params.id}`],
  });
}

export default function AdminMealFoodDetailPage() {
  const data = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Meal Food Detail</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Meal Food Detail</h1>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <p>
          <A href="edit">Edit</A>
        </p>
        <p>
          <A href="delete">Delete</A>
        </p>
      </div>
    </main>
  );
}
