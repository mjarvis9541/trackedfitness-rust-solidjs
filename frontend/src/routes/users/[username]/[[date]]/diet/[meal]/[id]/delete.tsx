import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, { key: () => [`diet/${params.id}`] });
}

export default function DietDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{
    username: string;
    date: string;
    meal: string;
    id: string;
  }>();

  return (
    <main class="p-4">
      <Title>Delete Diet Entry</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Delete Diet Entry</h1>
        <p class="mb-4">Are you sure you wish to delete this item?</p>
        <p class="mb-4">This action cannot be undone.</p>

        <div class="">
          <DeleteForm
            url={`diet/${params.id}`}
            redirectTo={`/users/${params.username}/${params.date}`}
          />
        </div>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
