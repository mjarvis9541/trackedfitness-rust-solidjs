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
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";
import { now } from "~/utils/datetime";

export type Progress = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: string;
  energy_burnt: string;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by_id: string;
  updated_by_id: string;
};

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => ["progress", location.query],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { data, userSelect };
}

export async function progressCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  const user_id = form.get("user_id");
  const date = form.get("date");
  const weight_kg = form.get("weight_kg");
  const energy_burnt = Number(form.get("energy_burnt"));
  const notes = form.get("notes");
  return await postRequest(request, "progress", {
    username,
    user_id,
    date,
    weight_kg,
    energy_burnt,
    notes,
  });
}

export default function ProgressListPage() {
  const { data, userSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [create, { Form: CreateForm }] = createServerAction$(progressCreate);

  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "user_id" },
    { classes: "", title: "date" },
    { classes: "", title: "weight_kg" },
    { classes: "", title: "energy_burnt" },
    { classes: "", title: "notes" },
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
      href: "admin/progress",
      lookup: "id",
      title: "id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/users",
      lookup: "user_id",
      title: "user_id",
    },
    { classes: "", title: "date" },
    { classes: "", title: "weight_kg" },
    { classes: "", title: "energy_burnt" },
    { classes: "", title: "notes" },
    { classes: "", title: "" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];
  return (
    <main class="p-4">
      <Title>Progress List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Progress List - <Show when={data()}>({data().count} Results)</Show>
          </h1>
          <div class="flex gap-2">
            <Search
              name="search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <Filter
              name="order"
              options={[
                { value: "", label: "Sort" },
                { value: "-date", label: "Date (desc)" },
                { value: "date", label: "Date (asc)" },
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

        <Show when={data()}>
          <AutoList
            data={data().results}
            headers={headers}
            rows={rows}
            checkbox={true}
            url="progress"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">Log Progress</h2>
        <Show when={create.error}>
          <pre>{JSON.stringify(create.error, null, 2)}</pre>
        </Show>
        <CreateForm>
          <Select name="user_id" label="User" options={userSelect()} />
          <Input name="date" type="date" value={now()} />
          <Input name="weight" value={80} />
          <Input name="energy_burnt" value={3000} />
          <Input name="notes" value="" />

          <Button loading={create.pending} label="Create Progress" />
        </CreateForm>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
