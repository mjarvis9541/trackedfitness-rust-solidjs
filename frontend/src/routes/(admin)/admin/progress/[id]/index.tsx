import { A, RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`progress/${params.id}`],
  });
}

export default function AdminProgressDetailPage() {
  const data = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Progress Detail</Title>

      <div class="">
        <h1 class="mb-4 text-xl font-bold">Progress Detail</h1>

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
