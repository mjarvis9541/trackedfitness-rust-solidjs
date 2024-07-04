import { RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import AdminBrandForm from "~/components/brands/AdminBrandForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const brand = createServerData$(getRequest, {
    key: () => [`brands/admin/${params.id}`],
  });
  return { brand };
}

export default function AdminBrandDetailPage() {
  const { brand } = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Brand Detail</Title>

      <div class="">
        <h1 class="mb-4 text-xl font-bold">Brand Detail</h1>

        <pre>{JSON.stringify(brand(), null, 2)}</pre>
      </div>

      <div class="max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">Update Brand</h2>
        <AdminBrandForm data={brand()} />
      </div>
    </main>
  );
}
