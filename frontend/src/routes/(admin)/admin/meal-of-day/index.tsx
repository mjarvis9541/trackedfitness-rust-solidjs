import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import Button from "~/components/ui/Button";
import Filter from "~/components/ui/Filter";
import Input from "~/components/ui/Input";
import Search from "~/components/ui/Search";
import { getRequest, postRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [
      "meal-of-day",
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });
}

export async function mealOfDayCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const name = form.get("name");
  const ordering = Number(form.get("order"));
  return await postRequest(request, "meal-of-day", { name, ordering });
}

export default function AdminMealOfDayListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "name" },
    { classes: "", title: "slug" },
    { classes: "text-end", title: "order" },
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
      href: "admin/meal-of-day",
      lookup: "id",
      title: "id",
    },
    { classes: "", title: "name" },
    { classes: "", title: "slug" },
    { classes: "text-end", title: "ordering" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];

  const [create, { Form: CreateForm }] = createServerAction$(mealOfDayCreate);

  return (
    <main class="p-4">
      <Title>Meal Of Day List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Meal Of Day List -{" "}
            <Show when={data()}>({data().count} Results)</Show>
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
              options={[
                { value: "", label: "Sort" },
                { value: "-name", label: "Name (desc)" },
                { value: "name", label: "Name (asc)" },
                { value: "-created_at", label: "Created (desc)" },
                { value: "created_at", label: "Created (asc)" },
              ]}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>

        <Show when={data()}>
          <AutoList
            data={data().results}
            headers={headers}
            rows={rows}
            checkbox={true}
            url="meal-of-day"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">Create Meal of Day</h2>
        <Show when={create.error}>
          <pre>{JSON.stringify(create.error, null, 2)}</pre>
        </Show>
        <CreateForm>
          <Input name="name" />
          <Input name="order" value={1} />
          <Button loading={create.pending} label="Create Meal of Day" />
        </CreateForm>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
