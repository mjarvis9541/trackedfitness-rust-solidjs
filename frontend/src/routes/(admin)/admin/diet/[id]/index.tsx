import { A, RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const diet = createServerData$(getRequest, {
    key: () => [`diet/${params.id}`],
  });
  return diet;
}

export default function AdminDietDetailPage() {
  const data = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Diet Detail</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Diet Detail</h1>

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
