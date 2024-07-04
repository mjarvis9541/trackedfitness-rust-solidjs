import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import {
  ServerFunctionEvent,
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import Button from "~/components/ui/Button";
import Filter from "~/components/ui/Filter";
import FormSelect from "~/components/ui/FormSelect";
import Search from "~/components/ui/Search";
import Select from "~/components/ui/Select";
import ValidatedInput from "~/components/ui/ValidatedInput";
import { getRequest, postRequest } from "~/services/api";

import { foodSortOptions, servingOptions } from "~/utils/constants";

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "food",
      location.query,
      location.query["search"],
      location.query["brand"],
      location.query["serving"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const brandSelect = createServerData$(getRequest, {
    key: () => ["brands/select"],
  });
  const brandFilter = createServerData$(getRequest, {
    key: () => ["brands/filter"],
  });
  return { data, brandSelect, brandFilter };
}

export async function foodCreate(form: FormData, event: ServerFunctionEvent) {
  const serving = form.get("serving");
  let data_value;
  let data_measurement;
  switch (serving) {
    case "g":
      data_value = 100;
      data_measurement = "g";
      break;
    case "srv":
      data_value = 1;
      data_measurement = "srv";
      break;
    case "ml":
      data_value = 100;
      data_measurement = "ml";
      break;
  }
  const name = form.get("name");
  const brand_id = form.get("brand_id");
  const energy = Number(form.get("energy"));
  const fat = form.get("fat");
  const saturates = form.get("saturates");
  const carbohydrate = form.get("carbohydrate");
  const sugars = form.get("sugars");
  const fibre = form.get("fibre");
  const protein = form.get("protein");
  const salt = form.get("salt");
  const data = await postRequest(event.request, "food", {
    name,
    brand_id,
    data_value,
    data_measurement,
    energy,
    fat,
    saturates,
    carbohydrate,
    sugars,
    fibre,
    protein,
    salt,
  });
  return redirect(`/admin/food/${data.id}`);
}

export default function AdminFoodListPage() {
  const { data, brandSelect, brandFilter } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "name" },
    { classes: "", title: "brand_name" },
    { classes: "text-end", title: "data_value" },
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
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/food",
      lookup: "id",
      title: "name",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/brands",
      lookup: "brand_id",
      title: "brand_name",
    },
    { classes: "text-end", title: "data_value" },
    { classes: "text-end", title: "energy" },
    { classes: "text-end", type: "number", title: "protein" },
    { classes: "text-end", type: "number", title: "carbohydrate" },
    { classes: "text-end", type: "number", title: "fat" },
    { classes: "text-end", type: "number", title: "saturates" },
    { classes: "text-end", type: "number", title: "sugars" },
    { classes: "text-end", type: "number", title: "fibre" },
    { classes: "text-end", type: "number", title: "salt" },
  ];

  const [action, { Form }] = createServerAction$(foodCreate);

  return (
    <main class="p-4">
      <Title>Food List</Title>

      <div class="mb-8">
        <h1 class="text-xl font-bold">
          Food List - <Show when={data()}>({data().count} Results)</Show>
        </h1>
        <div class="flex justify-end">
          <div class="flex justify-end gap-4">
            <div class="flex-1">
              <Search
                name="search"
                label="Search"
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            </div>
            <div class="flex-1">
              <Filter
                name="serving"
                label="Serving"
                defaultOption="All"
                defaultValue=""
                options={servingOptions}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            </div>
            <div class="flex-1">
              <Show when={brandSelect()}>
                <Filter
                  name="brand"
                  label="Brand"
                  defaultOption="All"
                  defaultValue=""
                  options={brandSelect()}
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                />
              </Show>
            </div>
            <div class="flex-1">
              <Filter
                name="order"
                label="Sort"
                options={foodSortOptions}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            </div>
          </div>
        </div>

        <Show when={data()}>
          <AutoList
            data={data().results}
            headers={headers}
            rows={rows}
            checkbox={true}
            url="food"
          />
        </Show>
      </div>

      <div class="max-w-lg border border-zinc-700 p-4">
        <h1 class="mb-4 text-xl font-bold">New Food</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <Show when={data() && brandSelect()}>
          <Form>
            <ValidatedInput name="name" error={action.error} />
            <Select name="brand_id" options={brandSelect()} />
            <FormSelect
              name="serving"
              options={servingOptions}
              value={data().data_measurement}
            />
            <ValidatedInput
              value={"0"}
              error={action.error}
              name="energy"
              label="Energy (kcal)"
            />
            <ValidatedInput
              value={"0"}
              error={action.error}
              name="fat"
              label="Fat (g)"
            />
            <ValidatedInput
              value={"0"}
              error={action.error}
              name="saturates"
              label="Saturates (g)"
            />
            <ValidatedInput
              value={"0"}
              error={action.error}
              name="carbohydrate"
              label="Carbohydrate (g)"
            />
            <ValidatedInput
              error={action.error}
              value={"0"}
              name="sugars"
              label="Sugars (g)"
            />
            <ValidatedInput
              value={"0"}
              error={action.error}
              name="fibre"
              label="Fibre (g)"
            />
            <ValidatedInput
              value={"0"}
              error={action.error}
              name="protein"
              label="Protein (g)"
            />
            <ValidatedInput
              error={action.error}
              name="salt"
              label="Salt (g)"
              value={"0"}
            />
            <div class="mt-8">
              <Button loading={action.pending} label="Create Food" />
            </div>
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
