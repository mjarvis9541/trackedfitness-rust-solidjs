import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import APIFilter from "~/components/ui/APIFilter";
import Filter from "~/components/ui/Filter";
import FilterDate from "~/components/ui/FilterDate";
import { getRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  const dietJSON = createServerData$(getRequest, {
    key: () => [
      "diet/day-json",
      location.query,
      location.query["user_id"],
      location.query["date_from"],
      location.query["date_to"],
      location.query["meal_of_day_id"],
      location.query["order"],
      location.query["size"],
      location.query["page"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { dietJSON, userSelect };
}

export default function AdminDietDayJsonListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>Diet Day Json List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">Diet Day Json List</h1>
          <div class="flex gap-2">
            <APIFilter
              name="user_id"
              label="User"
              defaultOption="All"
              defaultValue=""
              options={data.userSelect()}
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
              name="order"
              label="Sort"
              options={[
                { value: "", label: "Sort" },
                { value: "-date", label: "date (desc)" },
                { value: "date", label: "date (asc)" },
              ]}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>
      </div>

      <pre>{JSON.stringify(data.dietJSON(), null, 2)}</pre>
    </main>
  );
}
