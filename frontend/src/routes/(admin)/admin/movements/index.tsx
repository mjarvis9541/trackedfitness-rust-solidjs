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

type Movement = {
  id: string;
  username: string;
  date: string;
  created_at: string;
  updated_at: string;
};

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "movements",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const muscleGroupSelect = createServerData$(getRequest, {
    key: () => ["muscle-groups/select"],
  });
  return { data, muscleGroupSelect };
}

export default function AdminMovementListPage() {
  const { data, muscleGroupSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "name" },
    { classes: "", title: "slug" },
    { classes: "", title: "muscle_group_name" },
    { classes: "", title: "muscle_group_slug" },
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
      href: "admin/movements",
      lookup: "id",
      title: "id",
    },
    { classes: "", title: "name" },
    { classes: "", title: "slug" },
    { classes: "", title: "muscle_group_name" },
    { classes: "", title: "muscle_group_slug" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/users",
      lookup: "created_by_id",
      title: "created_by_id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/users",
      lookup: "updated_by_id",
      title: "updated_by_id",
    },
  ];

  const [action, { Form: CreateForm }] = createServerAction$(
    async (form: FormData, { request }: { request: Request }) => {
      const name = form.get("name");
      const muscle_group_id = form.get("muscle_group_id");

      return await postRequest(request, `movements`, {
        name,
        muscle_group_id,
      });
    },
  );

  return (
    <main class="p-4">
      <Title>Movement List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Movement List - <Show when={data()}>({data().count} Results)</Show>
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
            url="movements"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">New Movement</h2>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <CreateForm>
          <Input name="name" />
          <Select
            name="muscle_group_id"
            label="Muscle Group"
            options={muscleGroupSelect()}
          />
          <Button loading={action.pending} label="Create Movement" />
        </CreateForm>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
