import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import Filter from "~/components/ui/Filter";
import Search from "~/components/ui/Search";
import AdminUserForm from "~/components/users/AdminUserForm";
import { getRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [
      "users",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });
}

export default function AdminUserListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "username" },
    { classes: "", title: "name" },
    { classes: "", title: "email" },
    { classes: "", title: "is_active" },
    { classes: "", title: "is_staff" },
    { classes: "", title: "is_superuser" },
    { classes: "", title: "privacy_level" },
    { classes: "", title: "follower_count" },
    { classes: "", title: "following_count" },
    { classes: "", title: "last_login" },
    { classes: "", title: "created_at" },
  ];
  const rows = [
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/users",
      lookup: "id",
      title: "username",
    },
    { classes: "", title: "name" },
    { classes: "", title: "email" },
    { classes: "", type: "bool", title: "is_active" },
    { classes: "", type: "bool", title: "is_staff" },
    { classes: "", type: "bool", title: "is_superuser" },
    { classes: "", title: "privacy_level" },
    { classes: "", title: "follower_count" },
    { classes: "", title: "following_count" },
    { classes: "", title: "last_login" },
    { classes: "", title: "created_at" },
  ];
  return (
    <main class="p-4">
      <Title>User List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            User List - <Show when={data()}>({data().count} Results)</Show>
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
                { value: "-last_login", label: "Last Login (desc)" },
                { value: "last_login", label: "Last Login (asc)" },
                { value: "-follower_count", label: "Followers (desc)" },
                { value: "follower_count", label: "Followers (asc)" },
                { value: "-username", label: "Username (desc)" },
                { value: "username", label: "Username (asc)" },
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
            url="users"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border border-zinc-700 p-4">
        <h2 class="mb-2 text-xl font-bold">New User</h2>
        <AdminUserForm />
      </div>
      {/* <pre>{JSON.stringify(data(), null, 2)}</pre> */}
    </main>
  );
}
