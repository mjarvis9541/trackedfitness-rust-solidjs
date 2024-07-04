import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { getRequest, putRequest } from "~/services/api";
import { servingOptions } from "~/utils/constants";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`food/${params.slug}`],
  });
  const brandSelect = createServerData$(getRequest, {
    key: () => ["brands/select"],
  });
  return { data, brandSelect };
}

export async function foodUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const slug = form.get("slug");
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
  const data = await putRequest(request, `food/${slug}`, {
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

export default function FoodUpdatePage() {
  const { data, brandSelect } = useRouteData<typeof routeData>();
  const params = useParams<{ slug: string }>();

  const [action, { Form }] = createServerAction$(foodUpdate);

  return (
    <main class="p-4">
      <Title>Edit Food</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Edit Food</h1>

        <Show when={data() && brandSelect()}>
          <Form>
            <HiddenInput name="slug" value={params.slug} />
            <Input name="name" value={data().name} />

            <Select name="brand_id" options={data()} value={data().brand_id} />

            <Select
              name="serving"
              options={servingOptions}
              value={data().data_measurement}
            />
            <Input name="energy" label="Energy (kcal)" value={data().energy} />
            <Input
              name="fat"
              label="Fat (g)"
              value={Number(data().fat).toFixed(1)}
            />
            <Input
              name="saturates"
              label="Saturates (g)"
              value={Number(data().saturates).toFixed(1)}
            />
            <Input
              name="carbohydrate"
              label="Carbohydrate (g)"
              value={Number(data().carbohydrate).toFixed(1)}
            />
            <Input
              name="sugars"
              label="Sugars (g)"
              value={Number(data().sugars).toFixed(1)}
            />
            <Input
              name="fibre"
              label="Fibre (g)"
              value={Number(data().fibre).toFixed(1)}
            />
            <Input
              name="protein"
              label="Protein (g)"
              value={Number(data().protein).toFixed(1)}
            />
            <Input
              name="salt"
              label="Salt (g)"
              value={Number(data().salt).toFixed(2)}
            />
            <Button loading={action.pending} label="Update Food" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
