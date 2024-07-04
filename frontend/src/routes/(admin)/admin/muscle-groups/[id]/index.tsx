import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`muscle-groups/${params.id}`],
  });
}

export default function AdminMuscleGroupDetailPage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }: { request: Request }) => {
      const id = form.get("id");
      const name = form.get("name");

      return await putRequest(request, `muscle-groups/${id}`, {
        name,
      });
    },
  );

  return (
    <main class="p-4">
      <Title>Muscle Group Detail</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Muscle Group Detail</h1>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <div class="mb-8 max-w-lg border border-zinc-700 p-4">
          <h1 class="mb-4 text-xl font-bold">Muscle Group Update</h1>

          <Show when={action.error}>
            <pre>{JSON.stringify(action.error, null, 2)}</pre>
          </Show>

          <Show when={data()}>
            <Form>
              <HiddenInput name="id" value={params.id} />
              <Input name="name" value={data().name} />

              <Button loading={action.pending} label="Update Muscle Group" />
            </Form>
          </Show>
        </div>
        <div class="max-w-lg border border-zinc-700 p-4">
          <h2 class="mb-4 text-xl font-bold">Muscle Group Delete</h2>

          <p class="mb-4">Are you sure you wish to delete this item?</p>
          <p class="mb-8">This action cannot be undone.</p>

          <DeleteForm
            url={`muscle-groups/${params.id}`}
            redirectTo={`/admin/muscle-groups`}
          />
        </div>
      </div>
    </main>
  );
}
