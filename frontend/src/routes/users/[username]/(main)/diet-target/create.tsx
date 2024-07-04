import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useParams,
  useRouteData,
  useSearchParams,
} from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { getRequest, postRequest } from "~/services/api";

import { now } from "~/utils/datetime";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`progress/${params.username}/${now()}/latest`],
  });
}

export async function dietTargetCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  const date = form.get("date");
  const weight = form.get("weight");
  const protein_per_kg = form.get("protein_per_kg");
  const carbohydrate_per_kg = form.get("carbohydrate_per_kg");
  const fat_per_kg = form.get("fat_per_kg");
  const data = await postRequest(request, "diet-target", {
    username,
    date,
    weight,
    protein_per_kg,
    carbohydrate_per_kg,
    fat_per_kg,
  });
  return redirect(`/users/${username}/${data.date}`);
}

export default function DietTargetCreatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const getDate = () => searchParams.date || now();
  const [action, { Form }] = createServerAction$(dietTargetCreate);

  return (
    <main class="p-4">
      <Title>New Diet Target</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">New Diet Target</h1>
        <Show when={action.error && action.error.detail}>
          <span class="mb-4 block font-bold text-red-500">
            {action.error.detail}
          </span>
        </Show>
        <Form>
          <input type="hidden" name="username" value={params.username} />
          <Input name="date" type="date" value={getDate()} />

          <Input
            name="weight"
            label="Weight (kg)"
            value={
              data() &&
              data()?.weight_kg &&
              Number(data()?.weight_kg).toFixed(1)
            }
          />

          <Input
            name="protein_per_kg"
            label="Protein (grams per kg)"
            placeholder="0.00"
            step={0.01}
          />
          <Input
            name="carbohydrate_per_kg"
            label="Carbohydrate (grams per kg)"
            placeholder="0.00"
            step={0.01}
          />
          <Input
            name="fat_per_kg"
            label="Fat (grams per kg)"
            step={0.01}
            placeholder="0.00"
          />

          <Button loading={action.pending} label="Create Diet Target" />
        </Form>
      </div>
    </main>
  );
}
