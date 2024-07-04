import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meals/${params.id}`],
  });
}

export default function MealDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; id: string }>();

  return (
    <main class="p-4">
      <Title>Delete Meal</Title>

      <div class="p-4">
        <h1 class="text-xl font-bold">Delete Meal</h1>

        <p>Are you sure you wish to delete this item?</p>

        <p class="font-bold">{data() && data().name}</p>

        <p>This action cannot be undone.</p>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <div class="max-w-sm">
          <DeleteForm
            url={`meals/${params.id}`}
            redirectTo={`/users/${params.username}/meals`}
          />
        </div>
      </div>
    </main>
  );
}
