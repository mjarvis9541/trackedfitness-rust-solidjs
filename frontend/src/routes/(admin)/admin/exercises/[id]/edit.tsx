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
    key: () => [`exercises/${params.id}`],
  });
}

export async function exerciseUpdate(
  form: FormData,
  event: ServerFunctionEvent,
) {
  const id = form.get("id");
  const workout_id = form.get("workout_id");
  const movement_id = form.get("movement_id");
  const data = await putRequest(event.request, `workouts/${id}`, {
    workout_id,
    movement_id,
  });
  return redirect(`/admin/exercises/${data.id}`);
}

export default function AdminExerciseUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(exerciseUpdate);

  return (
    <main class="p-4">
      <Title>Exercise Update</Title>

      <div class="max-w-md border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Exercise Update</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <Show when={data()}>
          <Form>
            <HiddenInput name="id" value={params.id} />
            <Input name="workout_id" value={data().workout_id} />
            <Input name="movement_id" value={data().movement_id} />
            <Button loading={action.pending} label="Update Exercise" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
