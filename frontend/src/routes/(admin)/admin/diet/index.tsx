import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import APIFilter from "~/components/ui/APIFilter";
import Filter from "~/components/ui/Filter";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";

type Diet = {
  id: string;
  date: string;
  user_id: string;
  food_id: string;
  meal_of_day_id: string;
  quantity: string;
  created_at: string;
  updated_at: string;
  created_by_id: string;
  updated_by_id: string;
};

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "diet",
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
  return { data, userSelect };
}

export default function DietListPage() {
  const { data, userSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "date" },
    { classes: "", title: "user_id" },
    { classes: "", title: "meal_of_day_id" },
    { classes: "", title: "food_id" },
    { classes: "", title: "quantity" },
    { classes: "", title: "" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];
  const rows = [
    {
      classes: "text-blue-500 hover:underline",
      title: "id",
      href: "admin/diet",
      type: "link",
      lookup: "id",
    },
    { classes: "", title: "date" },
    {
      classes: "text-blue-500 hover:underline",
      title: "user_id",
      href: "admin/users",
      type: "link",
      lookup: "user_id",
    },
    {
      classes: "text-blue-500 hover:underline",
      title: "meal_of_day_id",
      href: "admin/meal-of-day",
      type: "link",
      lookup: "meal_of_day_id",
    },
    {
      classes: "text-blue-500 hover:underline",
      title: "food_id",
      href: "admin/food",
      type: "link",
      lookup: "food_id",
    },
    { classes: "", type: "number", title: "quantity" },
    { classes: "", title: "" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];
  return (
    <main class="p-4">
      <Title>Diet List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Diet List - <Show when={data()}>({data().count} Results)</Show>
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
                { value: "-date", label: "Date (desc)" },
                { value: "date", label: "Date (asc)" },
                { value: "-user_id", label: "user_id (desc)" },
                { value: "user_id", label: "user_id (desc)" },
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
            url={"diet"}
          />
        </Show>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
