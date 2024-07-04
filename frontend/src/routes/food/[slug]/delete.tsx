import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import { getToken } from "~/services/sessions";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(
    async ([path, slug], { request }) => {
      const token = await getToken(request);
      const res = await fetch(`${process.env.API}/${path}/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      return await res.json();
    },
    {
      key: () => ["food", params.slug],
    },
  );
  return data;
}

export default function FoodDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ slug: string }>();

  return (
    <main class="p-4">
      <Title>Delete Food</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Delete Food</h1>

        <p>Are you sure you wish to delete this item?</p>
        <p>This action cannot be undone.</p>

        <DeleteForm url={`food/${params.slug}`} redirectTo={`/food`} />
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
