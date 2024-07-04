import { A, RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`brands/${params.slug}`],
  });
}

export default function BrandDetailPage() {
  const brand = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Brand Detail</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Brand Detail</h1>
        <pre>{JSON.stringify(brand(), null, 2)}</pre>
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
