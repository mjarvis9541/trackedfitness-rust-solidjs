import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`movements/${params.id}`],
  });
  const muscleGroupSelect = createServerData$(getRequest, {
    key: () => ["muscle-groups/select"],
  });
  return { data, muscleGroupSelect };
}

export default function AdminMovementDetailPage() {
  const { data, muscleGroupSelect } = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }: { request: Request }) => {
      const id = form.get("id");
      const name = form.get("name");
      const muscle_group_id = form.get("muscle_group_id");

      return await putRequest(request, `movements/${id}`, {
        name,
        muscle_group_id,
      });
    },
  );

  return (
    <main class="p-4">
      <Title>Movement Detail</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Movement Detail</h1>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <div class="mb-8 max-w-lg border border-zinc-700 p-4">
          <h1 class="mb-4 text-xl font-bold">Movement Update</h1>

          <Show when={action.error}>
            <pre>{JSON.stringify(action.error, null, 2)}</pre>
          </Show>

          <Show when={data()}>
            <Form>
              <HiddenInput name="id" value={params.id} />
              <Input name="name" value={data().name} />
              <Select
                name="muscle_group_id"
                label="Muscle Group"
                options={muscleGroupSelect()}
                value={data().muscle_group_id}
              />
              <Button loading={action.pending} label="Update Movement" />
            </Form>
          </Show>
        </div>

        <div class="max-w-lg border border-zinc-700 p-4">
          <h2 class="mb-8 text-xl font-bold">Movement Delete</h2>
          <p class="mb-4">Are you sure you wish to delete this item?</p>
          <p class="mb-8">This action cannot be undone.</p>

          <DeleteForm
            url={`movements/admin/${params.id}`}
            redirectTo={`/admin/movements`}
          />
        </div>
      </div>
    </main>
  );
}
