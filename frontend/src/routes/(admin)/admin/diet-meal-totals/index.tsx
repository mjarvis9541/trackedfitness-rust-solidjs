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
import FilterDate from "~/components/ui/FilterDate";
import { getRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  const dietTotal = createServerData$(getRequest, {
    key: () => [
      "diet-total/meal",
      location.query,
      location.query["user_id"],
      location.query["date_from"],
      location.query["date_to"],
      location.query["order"],
      location.query["size"],
      location.query["page"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { dietTotal, userSelect };
}

export default function DietDayTotalListPage() {
  const { dietTotal, userSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const headers = [
    { classes: "", title: "date" },
    { classes: "", title: "user_id" },
    { classes: "", title: "meal_of_day_id" },
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
    { classes: "", title: "date" },
    { classes: "", title: "user_id" },
    { classes: "", title: "meal_of_day_id" },
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
      <Title>Diet Meal Total List</Title>

      <div class="flex justify-between">
        <h1 class="text-xl font-bold">Diet Meal Total List</h1>
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
          <FilterDate
            label="Date From"
            name="date_from"
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
          <FilterDate
            label="Date To"
            name="date_to"
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
          <Filter
            label="Sort"
            name="order"
            options={[
              { value: "", label: "Sort" },
              { value: "-date", label: "date (desc)" },
              { value: "date", label: "date (asc)" },
              { value: "-t1.user_id", label: "user_id (desc)" },
              { value: "t1.user_id", label: "user_id (asc)" },
            ]}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
          <Filter
            label="Per Page"
            name="size"
            options={[
              { value: "25", label: "25" },
              { value: "50", label: "50" },
              { value: "100", label: "100" },
            ]}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </div>
      </div>

      <Show when={dietTotal()}>
        <AutoList
          data={dietTotal()}
          headers={headers}
          rows={rows}
          checkbox={true}
          url=""
        />
      </Show>

      <pre>{JSON.stringify(dietTotal(), null, 2)}</pre>
    </main>
  );
}
