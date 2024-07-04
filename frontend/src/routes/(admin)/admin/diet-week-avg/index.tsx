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

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [
      "diet",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
}

export default function AdminDietWeekAvgListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "week" },
    { classes: "", title: "user_id" },
    { classes: "", title: "" },
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
    { classes: "", title: "" },
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
      <Title>Diet Week Average</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">Diet Week Average</h1>

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
                { value: "-date", label: "date (desc)" },
                { value: "date", label: "date (asc)" },
                { value: "-t1.user_id", label: "user_id (desc)" },
                { value: "t1.user_id", label: "user_id (asc)" },
                { value: "-energy", label: "Calories (High-Low)" },
                { value: "energy", label: "Calories (Low-High)" },
                { value: "-protein", label: "Protein (High-Low)" },
                { value: "protein", label: "Protein (Low-High)" },
                { value: "-carbohydrate", label: "Carbs (High-Low)" },
                { value: "carbohydrate", label: "Carbs (Low-High)" },
                { value: "-fat", label: "Fat (High-Low)" },
                { value: "fat", label: "Fat (Low-High)" },
                { value: "-saturates", label: "Saturates (High-Low)" },
                { value: "saturates", label: "Saturates (Low-High)" },
                { value: "-sugars", label: "Sugars (High-Low)" },
                { value: "sugars", label: "Sugars (Low-High)" },
                { value: "-fibre", label: "Fibre (High-Low)" },
                { value: "fibre", label: "Fibre (Low-High)" },
                { value: "-salt", label: "Salt (High-Low)" },
                { value: "salt", label: "Salt (Low-High)" },
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
            url=""
          />
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
