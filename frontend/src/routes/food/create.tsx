import { Title, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";

export function routeData() {
  return createServerData$(getRequest, { key: () => ["brands/select"] });
}

export async function foodCreate(
  form: FormData,
  { request }: { request: Request },
) {
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
  const data = await postRequest(request, "food", {
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
  return redirect(`/food/${data.slug}`);
}

export default function FoodCreatePage() {
  const data = useRouteData<typeof routeData>();
  const [action, { Form }] = createServerAction$(foodCreate);

  return (
    <main class="p-4">
      <Title>New Food</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">New Food</h1>

        <Form>
          <Input name="name" />
          <Select name="brand_id" options={data()} />
          <Select
            name="serving"
            options={[
              { id: "g", name: "100g" },
              { id: "ml", name: "100ml" },
              { id: "srv", name: "1 Serving" },
            ]}
          />
          <Input name="energy" label="Energy (kcal)" />
          <Input name="fat" label="Fat (g)" />
          <Input name="saturates" label="Saturates (g)" />
          <Input name="carbohydrate" label="Carbohydrate (g)" />
          <Input name="sugars" label="Sugars (g)" />
          <Input name="fibre" label="Fibre (g)" />
          <Input name="protein" label="Protein (g)" />
          <Input name="salt" label="Salt (g)" />
          <Button loading={action.pending} label="Create Food" />
        </Form>
      </div>
    </main>
  );
}
