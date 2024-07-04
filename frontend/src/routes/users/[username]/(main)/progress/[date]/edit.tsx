import { Show } from "solid-js";
import { RouteDataArgs, useParams, useRouteData } from "solid-start";
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
    key: () => [`progress/user/${params.username}/${params.date}`],
  });
}

async function userProgressUpdate(form: FormData, event: ServerFunctionEvent) {
  const id = form.get("id");
  const username = form.get("username");
  const date = form.get("date");
  const weight_kg = form.get("weight_kg");
  const energy_burnt = Number(form.get("energy_burnt"));
  const notes = form.get("notes") || "";
  const data = await putRequest(event.request, `progress/${id}`, {
    date,
    weight_kg,
    energy_burnt,
    notes,
  });

  return redirect(`/users/${username}/progress/${data.date}`);
}

export default function ProgressUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; date: string }>();

  const [action, { Form }] = createServerAction$(userProgressUpdate);

  return (
    <main class="p-4">
      <div class="p-4">
        <div class="max-w-lg">
          <h1 class="mb-4 text-xl font-bold">Edit Progress</h1>
          <Show when={action.error}>
            <pre>{JSON.stringify(action.error, null, 2)}</pre>
          </Show>
          <Show when={data()}>
            <Form>
              <HiddenInput name="id" value={data().id} />
              <HiddenInput name="username" value={params.username} />
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
          <pre>{JSON.stringify(data(), null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}
