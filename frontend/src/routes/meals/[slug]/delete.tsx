import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meal-of-day/${params.slug}`],
  });
}

export default function MealOfDayDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ slug: string }>();

  return (
    <main class="p-4">
      <Title>Delete Meal of Day</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Delete Meal of Day</h1>
        <p>Are you sure you wish to delete this item?</p>
        <p>This action cannot be undone.</p>
        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <DeleteForm url={`meal-of-day/${params.slug}`} redirectTo={`/meals`} />
      </div>
    </main>
  );
}
