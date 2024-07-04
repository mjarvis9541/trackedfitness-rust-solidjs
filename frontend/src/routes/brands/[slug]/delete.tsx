import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`brands/${params.slug}`],
  });
}

export default function BrandDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ slug: string }>();

  return (
    <main class="p-4">
      <Title>Delete Brand</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="text-xl font-bold">Delete Brand</h1>

        <p>Are you sure you wish to delete this item?</p>
        <p>This action cannot be undone.</p>
        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <DeleteForm url={`brands/${params.slug}`} redirectTo={`/brands`} />
      </div>
    </main>
  );
}
