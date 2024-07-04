import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`diet-target/${params.id}`],
  });
  return data;
}

export default function AdminDetailPage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  return (
    <main class="p-4">
      <Title>Delete Diet Target</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Delete Diet Target</h1>

        <p>Are you sure you wish to delete this item?</p>
        <p>This action cannot be undone.</p>

        <DeleteForm
          url={`diet-target/${params.id}`}
          redirectTo={`/admin/diet-targets`}
        />
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
