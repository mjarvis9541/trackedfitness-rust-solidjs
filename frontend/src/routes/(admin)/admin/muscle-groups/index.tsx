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
import { createdUpdatedSortOptions } from "~/utils/constants";

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "muscle-groups",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  return { data };
}

export async function create(
  form: FormData,
  { request }: { request: Request },
) {
  const name = form.get("name");
  return await postRequest(request, "muscle-groups", { name });
}

export default function AdminMuscleGroupListPage() {
  const { data } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "name" },
    { classes: "", title: "slug" },
    { classes: "", title: "exercise_count" },
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
      href: "admin/muscle-groups",
      lookup: "id",
      title: "id",
    },
    { classes: "", title: "name" },
    { classes: "", title: "slug" },
    { classes: "", title: "exercise_count" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "updated_by" },
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

  const [action, { Form: CreateForm }] = createServerAction$(create);

  return (
    <main class="p-4">
      <Title>Muscle Group List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Muscle Group List -{" "}
            <Show when={data()}>({data().count} Results)</Show>
          </h1>
          <div class="flex gap-2">
            <Search
              name="search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <Filter
              name="order"
              defaultValue=""
              defaultOption="Sort"
              options={createdUpdatedSortOptions}
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
            url="muscle-groups"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">New Muscle Group</h2>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <CreateForm>
          <Input name="name" />
          <Button loading={action.pending} label="Create Muscle Group" />
        </CreateForm>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
