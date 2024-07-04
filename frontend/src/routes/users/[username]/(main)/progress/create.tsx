import { Show } from "solid-js";
import { Title, useParams, useSearchParams } from "solid-start";
import {
  ServerFunctionEvent,
  createServerAction$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { postRequest } from "~/services/api";
import { now } from "~/utils/datetime";

async function userProgressCreate(form: FormData, event: ServerFunctionEvent) {
  const username = form.get("username");
  const date = form.get("date");
  const weight_kg = form.get("weight_kg");
  const energy_burnt = Number(form.get("energy_burnt"));
  const notes = form.get("notes");
  const data = await postRequest(event.request, "progress", {
    username,
    date,
    weight_kg,
    energy_burnt,
    notes,
  });

  return redirect(`/users/${username}/progress/${data.date}`);
}

export default function ProgressCreatePage() {
  const params = useParams<{ username: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [action, { Form }] = createServerAction$(userProgressCreate);

  return (
    <main class="p-4">
      <Title>New Progress Log</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">New Progress Log</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <Form>
          <input type="hidden" name="username" value={params.username} />
          <Input name="date" type="date" value={searchParams.date || now()} />
          <Input name="weight_kg" label="Weight (kg)" />
          <Input name="energy_burnt" label="Energy burnt (kcal)" />
          <Input name="notes" label="Notes" />

          <Button loading={action.pending} label="Create Progress" />
        </Form>
      </div>
    </main>
  );
}
