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
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "followers",
      location.query,
      location.query["user_id"],
      location.query["follower_id"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { data, userSelect };
}

export async function followerCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const user_id = form.get("user_id");
  const follower_id = form.get("follower_id");
  const status = Number(form.get("status"));
  const data = await postRequest(request, "followers", {
    user_id,
    follower_id,
    status,
  });
  return data;
}

export default function FollowerListPage() {
  const { data, userSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [create, { Form: CreateForm }] = createServerAction$(followerCreate);
  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "user_id" },
    { classes: "", title: "follower_id" },
    { classes: "", title: "status" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "user" },
    { classes: "", title: "follower" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
  ];
  const rows = [
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/followers",
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
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/users",
      lookup: "follower_id",
      title: "follower_id",
    },
    { classes: "", title: "status" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "users",
      lookup: "user",
      title: "user",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "users",
      lookup: "follower",
      title: "follower",
    },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
  ];

  return (
    <main class="p-4">
      <Title>Follower List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Follower List - <Show when={data()}>({data().count} Results)</Show>
          </h1>
          <div class="flex gap-2">
            <APIFilter
              name="user_id"
              label="User"
              defaultOption="All"
              defaultValue=""
              options={userSelect()}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <APIFilter
              name="follower_id"
              label="Follower"
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
                { value: "-date", label: "Date (desc)" },
                { value: "date", label: "Date (asc)" },
                { value: "-status", label: "Status (desc)" },
                { value: "status", label: "Status (asc)" },
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
            url="followers"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">New Follower</h2>
        <Show when={create.error}>
          <pre>{JSON.stringify(create.error, null, 2)}</pre>
        </Show>

        <CreateForm>
          <Select name="user_id" label="User" options={userSelect()} />
          <Select name="follower_id" label="Follower" options={userSelect()} />
          <Input name="status" value="0" />
          <Button loading={create.pending} label="Create Follower" />
        </CreateForm>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
