import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import AdminBrandForm from "~/components/brands/AdminBrandForm";
import Filter from "~/components/ui/Filter";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";
import { brandSort } from "~/utils/constants";

export function routeData({ location }: RouteDataArgs) {
  const brands = createServerData$(getRequest, {
    key: () => [
      "brands",
      location.query,
      location.query["brand"],
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  return { brands };
}

export default function AdminBrandListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "name" },
    { classes: "", title: "slug" },
    { classes: "", title: "image_url" },
    { classes: "text-end", title: "food_count" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];
  const rows = [
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/brands",
      lookup: "id",
      title: "name",
    },
    { classes: "", title: "slug" },
    { classes: "", title: "image_url" },
    { classes: "text-end", title: "food_count" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];

  return (
    <main class="p-4">
      <Title>Brand List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Brand List -{" "}
            <Show when={data.brands()}>({data.brands().count} Results)</Show>
          </h1>
          <div class="flex gap-2">
            <Search
              name="search"
              label="Search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <Filter
              name="order"
              label="Sort"
              options={brandSort}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>

        <Show when={data.brands()}>
          <AutoList
            data={data.brands().results}
            headers={headers}
            rows={rows}
            checkbox={true}
            url={"brands"}
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border border-zinc-700 p-4">
        <h2 class="mb-4 text-xl font-bold">New Brand</h2>
        <AdminBrandForm />
      </div>

      <pre>{JSON.stringify(data.brands(), null, 2)}</pre>
    </main>
  );
}
