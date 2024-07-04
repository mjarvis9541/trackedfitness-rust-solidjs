import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import Button from "~/components/ui/Button";
import FormSelect from "~/components/ui/FormSelect";
import HiddenInput from "~/components/ui/HiddenInput";
import Select from "~/components/ui/Select";
import ValidatedInput from "~/components/ui/ValidatedInput";
import { getRequest, putRequest } from "~/services/api";
import { servingOptions } from "~/utils/constants";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`food/${params.id}`],
  });
  const brandSelect = createServerData$(getRequest, {
    key: () => ["brands/select"],
  });
  return { data, brandSelect };
}
export default function AdminFoodDetailPage() {
  const { data, brandSelect } = useRouteData<typeof routeData>();

  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }: { request: Request }) => {
      const id = form.get("id");
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
      const data = await putRequest(request, `food/${id}`, {
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
    },
  );

  return (
    <main class="p-4">
      <Title>Food Detail</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Food Detail</h1>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <div class="flex gap-4">
          <div class="flex-1">
            <div class="mb-8 border border-zinc-700 p-4">
              <h1 class="mb-4 text-xl font-bold">Edit Food</h1>
              <Show when={action.error}>
                <pre>{JSON.stringify(action.error, null, 2)}</pre>
              </Show>
              <Show when={data() && brandSelect()}>
                <Form>
                  <HiddenInput name="id" value={params.id} />
                  <ValidatedInput name="name" value={data().name} />

                  <Select
                    name="brand_id"
                    options={brandSelect()}
                    value={data().brand_id}
                  />

                  <FormSelect
                    name="serving"
                    options={servingOptions}
                    value={data().data_measurement}
                  />
                  <ValidatedInput
                    error={action.error}
                    name="energy"
                    label="Energy (kcal)"
                    value={data().energy}
                  />
                  <ValidatedInput
                    error={action.error}
                    name="fat"
                    label="Fat (g)"
                    value={Number(data().fat).toFixed(1)}
                  />
                  <ValidatedInput
                    error={action.error}
                    name="saturates"
                    label="Saturates (g)"
                    value={Number(data().saturates).toFixed(1)}
                  />
                  <ValidatedInput
                    error={action.error}
                    name="carbohydrate"
                    label="Carbohydrate (g)"
                    value={Number(data().carbohydrate).toFixed(1)}
                  />
                  <ValidatedInput
                    error={action.error}
                    name="sugars"
                    label="Sugars (g)"
                    value={Number(data().sugars).toFixed(1)}
                  />
                  <ValidatedInput
                    error={action.error}
                    name="fibre"
                    label="Fibre (g)"
                    value={Number(data().fibre).toFixed(1)}
                  />
                  <ValidatedInput
                    error={action.error}
                    name="protein"
                    label="Protein (g)"
                    value={Number(data().protein).toFixed(1)}
                  />
                  <ValidatedInput
                    error={action.error}
                    name="salt"
                    label="Salt (g)"
                    value={Number(data().salt).toFixed(2)}
                  />
                  <Button loading={action.pending} label="Update Food" />
                </Form>
              </Show>
            </div>
          </div>
          <div class="flex-1">
            <div class="border border-zinc-700 p-4">
              <h2 class="mb-4 text-xl font-bold">Food Delete</h2>

              <p class="mb-4">Are you sure you wish to delete this item?</p>
              <p class="mb-8">This action cannot be undone.</p>

              <DeleteForm
                url={`food/${params.id}`}
                redirectTo={`/admin/food`}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
