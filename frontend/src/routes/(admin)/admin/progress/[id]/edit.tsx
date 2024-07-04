import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  ServerFunctionEvent,
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`progress/${params.id}`],
  });
}

async function progressUpdate(form: FormData, event: ServerFunctionEvent) {
  const id = form.get("id");
  const user_id = form.get("user_id");
  const date = form.get("date");
  const weight_kg = form.get("weight_kg");
  const energy_burnt = Number(form.get("energy_burnt"));
  const notes = form.get("notes") || "";
  const data = await putRequest(event.request, `progress/${id}`, {
    user_id,
    date,
    weight_kg,
    energy_burnt,
    notes,
  });

  return redirect(`/admin/progress/${data.id}`);
}

export default function AdminProgressUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(progressUpdate);

  return (
    <main class="p-4">
      <Title>Progress Update</Title>

      <div class="max-w-md border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Progress Update</h1>

        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>

        <Show when={data()}>
          <Form>
            <HiddenInput name="id" value={data().id} />

            <Input name="date" type="date" value={data().date} />
            <Input
              name="weight_kg"
              label="Weight (kg)"
              value={data().weight_kg}
            />
            <Input
              name="energy_burnt"
              label="Energy burnt (kcal)"
              value={data().energy_burnt}
            />
            <Input name="notes" label="Notes" value={data().notes} />

            <Button loading={action.pending} label="Update Progress" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
