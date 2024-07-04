import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`progress/${params.username}/${params.date}`],
  });
}

export default function DietTargetDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; date: string }>();

  return (
    <main class="p-4">
      <Title>Delete Progress</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Delete Progress</h1>

        <p>Are you sure you wish to delete this item?</p>
        <p>This action cannot be undone.</p>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <DeleteForm
          url={`progress/${params.username}/${params.date}`}
          redirectTo={`/users/${params.username}`}
        />
      </div>
    </main>
  );
}
