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
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "meal-food",
      location.query,
      location.query["date"],
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const mealSelect = createServerData$(getRequest, {
    key: () => ["meals/select"],
  });
  const foodSelect = createServerData$(getRequest, {
    key: () => ["food/select"],
  });
  return { data, mealSelect, foodSelect };
}
export async function mealFoodCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const meal_id = form.get("meal_id");
  const food_id = form.get("food_id");
  const quantity = form.get("quantity");
  const data = await postRequest(request, "meal-food", {
    meal_id,
    food_id,
    quantity,
  });
  return data;
}

export default function AdminMealFoodListPage() {
  const { data, mealSelect, foodSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "meal_id" },
    { classes: "", title: "food_id" },
    { classes: "", title: "quantity" },
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
      href: "admin/meal-food",
      lookup: "id",
      title: "id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/meals",
      lookup: "meal_id",
      title: "meal_id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/food",
      lookup: "food_id",
      title: "food_id",
    },
    { classes: "", type: "number", title: "quantity" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];

  const [create, { Form: CreateForm }] = createServerAction$(mealFoodCreate);

  return (
    <main class="p-4">
      <Title>Meal Food List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Meal Food List - <Show when={data()}>({data().count} Results)</Show>
          </h1>
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
                { value: "-name", label: "Name (desc)" },
                { value: "name", label: "Name (asc)" },
                { value: "-created_at", label: "Created (desc)" },
                { value: "created_at", label: "Created (asc)" },
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

        <Show when={data()}>
          <AutoList
            data={data().results}
            headers={headers}
            rows={rows}
            checkbox={true}
            url="meal-food"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">New Meal Food</h2>
        <Show when={create.error}>
          <pre>{JSON.stringify(create.error, null, 2)}</pre>
        </Show>
        <CreateForm>
          <Select name="meal_id" label="Meal Select" options={mealSelect()} />
          <Select name="food_id" label="Food Select" options={foodSelect()} />
          <Input name="quantity" value={1} />
          <Button loading={create.pending} label="Create Meal Food" />
        </CreateForm>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
