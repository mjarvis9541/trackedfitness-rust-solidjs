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
import { now } from "~/utils/datetime";

export function routeData({ location }: RouteDataArgs) {
  const target = createServerData$(getRequest, {
    key: () => [
      "diet-target",
      location.query,
      location.query["search"],
      location.query["user_id"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { target, userSelect };
}

export async function dietTargetCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const user_id = form.get("user_id");
  const date = form.get("date");
  const weight = form.get("weight");
  const protein_per_kg = form.get("protein_per_kg");
  const carbohydrate_per_kg = form.get("carbohydrate_per_kg");
  const fat_per_kg = form.get("fat_per_kg");
  const data = await postRequest(request, "diet-target", {
    user_id,
    date,
    weight,
    protein_per_kg,
    carbohydrate_per_kg,
    fat_per_kg,
  });
  return data;
}

export default function AdminDietTargetListPage() {
  const { target, userSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [create, { Form: CreateForm }] = createServerAction$(dietTargetCreate);

  const headers = [
    { classes: "", title: "date" },
    { classes: "", title: "user_id" },
    { classes: "text-end", title: "weight" },
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
      title: "date",
      href: "admin/diet-targets",
      type: "link",
      lookup: "id",
    },
    {
      classes: "text-blue-500 hover:underline",
      title: "user_id",
      href: "admin/users",
      type: "link",
      lookup: "user_id",
    },
    { classes: "text-end", type: "number", title: "weight" },
    { classes: "text-end", type: "number", title: "energy" },
    { classes: "text-end", type: "number", title: "protein" },
    { classes: "text-end", type: "number", title: "carbohydrate" },
    { classes: "text-end", type: "number", title: "fat" },
    { classes: "text-end", type: "number", title: "saturates" },
    { classes: "text-end", type: "number", title: "sugars" },
    { classes: "text-end", type: "number", title: "fibre" },
    { classes: "text-end", type: "number", title: "salt" },
  ];
  return (
    <main class="p-4">
      <Title>Diet Target List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Diet Target List -{" "}
            <Show when={target()}>({target().count} Results)</Show>
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
                { value: "-data", label: "Date (desc)" },
                { value: "data", label: "Date (asc)" },
                { value: "-created_at", label: "Created (desc)" },
                { value: "created_at", label: "Created (asc)" },
                { value: "-updated_at", label: "Updated (desc)" },
                { value: "updated_at", label: "Updated (asc)" },
              ]}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>

        <Show when={target()}>
          <AutoList
            data={target().results}
            headers={headers}
            rows={rows}
            checkbox={true}
            url="diet-target"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">New Diet Target</h2>
        <Show when={create.error}>
          <pre>{JSON.stringify(create.error, null, 2)}</pre>
        </Show>
        <CreateForm>
          <Select name="user_id" label="User" options={userSelect()} />
          <Input name="date" type="date" value={now()} />
          <Input name="weight" value={84} />
          <Input name="protein_per_kg" value={2.5} />
          <Input name="carbohydrate_per_kg" value={5} />
          <Input name="fat_per_kg" value={1} />
          <Button loading={create.pending} label="Create Diet Target" />
        </CreateForm>
      </div>

      <pre>{JSON.stringify(target(), null, 2)}</pre>
    </main>
  );
}
