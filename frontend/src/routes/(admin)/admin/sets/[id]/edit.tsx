import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { setUpdate } from "~/components/workouts-sm/SetUpdateForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`sets/${params.id}`],
  });
  const exerciseSelect = createServerData$(getRequest, {
    key: () => ["exercises/select"],
  });
  return { data, exerciseSelect };
}

export default function AdminSetUpdatePage() {
  const { data, exerciseSelect } = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();
  const [action, { Form }] = createServerAction$(setUpdate);

  return (
    <main class="p-4">
      <Title>Edit Set</Title>

      <div class="max-w-md border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Edit Set</h1>
        <Show when={data() && exerciseSelect()}>
          <Form>
            <HiddenInput name="id" value={params.id} />
            <Select
              name="exercise_id"
              label="Exercise"
              options={exerciseSelect()}
              value={data().exercise_id}
            />

            <Input name="weight" value={data().weight} />
            <Input name="reps" value={data().reps} />
            <Input name="rest" value={data().rest} />
            <Input name="notes" value={data().notes} />

            <Button loading={action.pending} label="Update Set" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
