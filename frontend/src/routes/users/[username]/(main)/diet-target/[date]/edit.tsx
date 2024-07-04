import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`diet-target/${params.username}/${params.date}`],
  });
}

export async function dietTargetUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  const date = form.get("date");
  const weight = form.get("weight");
  const protein_per_kg = form.get("protein_per_kg");
  const carbohydrate_per_kg = form.get("carbohydrate_per_kg");
  const fat_per_kg = form.get("fat_per_kg");
  return await putRequest(request, `diet-target/${username}/${date}`, {
    username,
    date,
    weight,
    protein_per_kg,
    carbohydrate_per_kg,
    fat_per_kg,
  });
}

export default function DietTargetUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; date: string }>();
  const [action, { Form }] = createServerAction$(dietTargetUpdate);

  return (
    <main class="p-4">
      <Title>Edit Diet Target</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Edit Diet Target</h1>

        <Show when={data()}>
          <Form>
            <HiddenInput name="id" value={data().id} />
            <HiddenInput name="username" value={data().username} />

            <Input name="date" type="date" value={data().date} />
            <Input name="weight" value={data().latest_weight} />
            <Input
              name="protein_per_kg"
              label="Protein (grams per kg)"
              placeholder="0.00"
              step={0.01}
              value={Number(data().protein_per_kg).toFixed(2)}
            />
            <Input
              name="carbohydrate_per_kg"
              label="Carbohydrate (grams per kg)"
              placeholder="0.00"
              step={0.01}
              value={Number(data().carbohydrate_per_kg).toFixed(2)}
            />
            <Input
              name="fat_per_kg"
              label="Fat (grams per kg)"
              step={0.01}
              placeholder="0.00"
              value={Number(data().fat_per_kg).toFixed(2)}
            />
            <Button loading={action.pending} label="Update Diet Target" />
          </Form>
        </Show>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
