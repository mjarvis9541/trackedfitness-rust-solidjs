import { A, RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meal-of-day/${params.slug}`],
  });
}

export default function MealOfDayDetailPage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ slug: string }>();

  return (
    <main class="p-4">
      <Title>Meal of Day</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Meal of Day</h1>

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
