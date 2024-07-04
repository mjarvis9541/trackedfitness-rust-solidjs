import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import APIFilter from "~/components/ui/APIFilter";
import Filter from "~/components/ui/Filter";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  const dietJSON = createServerData$(getRequest, {
    key: () => [
      "meals/json",
      location.query,
      location.query["search"],
      location.query["user_id"],
      location.query["meal_id"],
      location.query["order"],
      location.query["size"],
      location.query["page"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  const mealSelect = createServerData$(getRequest, {
    key: () => ["meals/select"],
  });
  return { dietJSON, userSelect, mealSelect };
}

export default function AdminMealJsonListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>Meal Json List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">Meal Json List</h1>
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
              options={data.userSelect()}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <APIFilter
              label="Meal"
              name="meal_id"
              defaultOption="All"
              defaultValue=""
              options={data.mealSelect()}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <Filter
              name="order"
              label="Sort"
              options={[
                { value: "", label: "Sort" },
                { value: "-name", label: "name (desc)" },
                { value: "name", label: "name (asc)" },
                { value: "-food_count", label: "food_count (desc)" },
                { value: "food_count", label: "food_count (asc)" },
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
      </div>

      <pre>{JSON.stringify(data.dietJSON(), null, 2)}</pre>
    </main>
  );
}
