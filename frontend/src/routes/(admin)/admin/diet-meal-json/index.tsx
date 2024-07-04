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
      "diet/meal-json",
      location.query,
      location.query["user_id"],
      location.query["date_from"],
      location.query["meal_of_day_id"],
      location.query["meal_from"],
      location.query["date_to"],
      location.query["order"],
      location.query["size"],
      location.query["page"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  const mealOfDaySelect = createServerData$(getRequest, {
    key: () => ["meal-of-day/select"],
  });
  return { dietJSON, userSelect, mealOfDaySelect };
}

export default function AdminDietMealJsonListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>Diet Meal Json List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">Diet Meal Json List</h1>
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
            <APIFilter
              name="meal_of_day_id"
              label="Meal"
              defaultOption="All"
              defaultValue=""
              options={data.mealOfDaySelect()}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <FilterDate
              label="Date"
              name="date_from"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <Filter
              name="order"
              label="Sort"
              options={[
                { value: "", label: "Sort" },
                { value: "m3.ordering", label: "order (asc)" },
                { value: "-m3.ordering", label: "order (desc)" },
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
