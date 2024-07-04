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
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import Select from "~/components/ui/Select";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const workout = createServerData$(getRequest, {
    key: () => [`workouts/${params.id}`],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { workout, userSelect };
}

export async function workoutUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const date = form.get("date");
  const user_id = form.get("user_id");
  const data = await putRequest(request, `workouts/${id}`, {
    date,
    user_id,
  });
  return redirect(`/admin/workouts/${data.id}`);
}

export default function AdminWorkoutUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(workoutUpdate);

  return (
    <main class="p-4">
      <Title>Edit Workout</Title>

      <div class="max-w-md border bg-zinc-900 p-4">
        <h1 class="mb-4 text-xl font-bold">Edit Workout</h1>
        <Show
          when={data.workout() && data.userSelect()}
          fallback={<LoadingSpinner />}
        >
          <Form>
            <HiddenInput name="id" value={params.id} />
            <Input name="date" type="date" value={data.workout().date} />

            <Select
              name="user_id"
              label="User"
              options={data.userSelect()}
              value={data.workout().user_id}
            />
            <Button loading={action.pending} label="Update Workout" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data.workout(), null, 2)}</pre>
    </main>
  );
}
