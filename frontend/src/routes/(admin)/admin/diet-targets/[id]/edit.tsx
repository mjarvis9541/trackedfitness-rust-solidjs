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

export function routeData({ params }: RouteDataArgs) {
  const target = createServerData$(getRequest, {
    key: () => [`diet-target/${params.id}`],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { target, userSelect };
}
export async function dietTargetUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const user_id = form.get("user_id");
  const date = form.get("date");
  const weight = form.get("weight");
  const protein_per_kg = form.get("protein_per_kg");
  const carbohydrate_per_kg = form.get("carbohydrate_per_kg");
  const fat_per_kg = form.get("fat_per_kg");
  const data = await putRequest(request, `diet-target/${id}`, {
    user_id,
    date,
    weight,
    protein_per_kg,
    carbohydrate_per_kg,
    fat_per_kg,
  });

  return redirect(`/admin/diet-targets/${id}`);
}

export default function AdminDietTargetUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();
  const [action, { Form }] = createServerAction$(dietTargetUpdate);

  return (
    <main class="p-4">
      <Title>Diet Target Update</Title>

      <div class="max-w-md border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Diet Target Update</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <Show when={data.target() && data.userSelect()}>
          <Form>
            <HiddenInput name="id" value={params.id} />
            <Select
              name="user_id"
              label="User"
              options={data.userSelect()}
              value={data.target().user_id}
            />
            <Input name="date" type="date" value={data.target().date} />
            <Input
              name="weight"
              value={Number(data.target().latest_weight).toFixed(2)}
            />
            <Input
              name="protein_per_kg"
              value={Number(data.target().protein_per_kg).toFixed(2)}
            />
            <Input
              name="carbohydrate_per_kg"
              value={Number(data.target().carbohydrate_per_kg).toFixed(2)}
            />
            <Input
              name="fat_per_kg"
              value={Number(data.target().fat_per_kg).toFixed(2)}
            />

            <Button loading={action.pending} label="Update Diet Target" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data.target(), null, 2)}</pre>
    </main>
  );
}
