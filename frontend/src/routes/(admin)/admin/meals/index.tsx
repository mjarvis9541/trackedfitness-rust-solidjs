import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import APIFilter from "~/components/ui/APIFilter";
import Button from "~/components/ui/Button";
import Filter from "~/components/ui/Filter";
import Input from "~/components/ui/Input";
import Search from "~/components/ui/Search";
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "meals",
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { data, userSelect };
}

export async function mealCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const user_id = form.get("user_id");
  const name = form.get("name");
  return await postRequest(request, "meals", { user_id, name });
}

export default function AdminMealListPage() {
  const { data, userSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "name" },
    { classes: "", title: "username" },
    { classes: "text-end", title: "food_count" },
    { classes: "text-end", title: "energy" },
    { classes: "text-end", title: "protein" },
    { classes: "text-end", title: "carbohydrate" },
    { classes: "text-end", title: "fat" },
    { classes: "text-end", title: "saturates" },
    { classes: "text-end", title: "sugars" },
    { classes: "text-end", title: "fibre" },
    { classes: "text-end", title: "salt" },
  ];
  const rows = [
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/meals",
      lookup: "id",
      title: "name",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "users",
      lookup: "username",
      title: "username",
    },
    { classes: "text-end", title: "food_count" },
    { classes: "text-end", type: "number", title: "energy" },
    { classes: "text-end", type: "number", title: "protein" },
    { classes: "text-end", type: "number", title: "carbohydrate" },
    { classes: "text-end", type: "number", title: "fat" },
    { classes: "text-end", type: "number", title: "saturates" },
    { classes: "text-end", type: "number", title: "sugars" },
    { classes: "text-end", type: "number", title: "fibre" },
    { classes: "text-end", type: "number", title: "salt" },
  ];

  const [action, { Form: CreateForm }] = createServerAction$(mealCreate);

  return (
    <main class="p-4">
      <Title>Meal List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Meal List - <Show when={data()}>({data().count} Results)</Show>
          </h1>
          <div class="flex gap-2">
            <Search
              name="search"
              label="Search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <APIFilter
              name="user_id"
              label="User"
              defaultOption="All"
              defaultValue=""
              options={userSelect()}
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
            url="meals"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">New Meal</h2>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <CreateForm>
          <Select name="user_id" label="User" options={userSelect()} />
          <Input name="name" />
          <Button loading={action.pending} label="Create Meal" />
        </CreateForm>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
