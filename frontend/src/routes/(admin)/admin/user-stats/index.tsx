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
import { getRequest } from "~/services/api";
import { createdUpdatedSortOptions } from "~/utils/constants";

export type Set = {
  id: string;
  username: string;
  date: string;
  created_at: string;
  updated_at: string;
  Set_count: number;
};

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "users/admin/stats",
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });

  return { data };
}

export default function AdminSetListPage() {
  const { data } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const headers = [
    { classes: "", title: "username" },
    { classes: "", title: "profile_id" },
    { classes: "bg-blue-700", title: "diet_count" },
    { classes: "bg-blue-700", title: "diet_day_log_count" },
    { classes: "bg-blue-700", title: "diet_target_count" },
    { classes: "", title: "progress_count" },
    { classes: "bg-amber-400 text-zinc-900", title: "workout_count" },
    { classes: "bg-amber-400 text-zinc-900", title: "workout_day_log_count" },
    { classes: "bg-amber-400 text-zinc-900", title: "exercise_count" },
    { classes: "bg-amber-400 text-zinc-900", title: "set_count" },
    { classes: "bg-amber-400 text-zinc-900", title: "rep_count" },
    { classes: "", title: "food_created_count" },
    { classes: "", title: "brand_created_count" },
    { classes: "", title: "meal_created_count" },
    { classes: "", title: "meal_food_created_count" },
    { classes: "", title: "movement_created_count" },
    { classes: "", title: "muscle_group_created_count" },
  ];
  const rows = [
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/users",
      lookup: "id",
      title: "username",
    },
    { classes: "", title: "profile_id" },
    { classes: "", title: "diet_count" },
    { classes: "", title: "diet_day_log_count" },
    { classes: "", title: "diet_target_count" },
    { classes: "", title: "progress_count" },
    { classes: "", title: "workout_count" },
    { classes: "", title: "workout_day_log_count" },
    { classes: "", title: "exercise_count" },
    { classes: "", title: "set_count" },
    { classes: "", title: "rep_count" },
    { classes: "", title: "food_created_count" },
    { classes: "", title: "brand_created_count" },
    { classes: "", title: "meal_created_count" },
    { classes: "", title: "meal_food_created_count" },
    { classes: "", title: "movement_created_count" },
    { classes: "", title: "muscle_group_created_count" },
  ];
  return (
    <main class="p-4">
      <Title>User Stats List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">User Stats List</h1>
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
            data={data()}
            headers={headers}
            rows={rows}
            checkbox={true}
            cols={"grid-cols-checkbox-18"}
            url=""
          />
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
