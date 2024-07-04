import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { DeleteButton } from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import { deleteRequest, getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const profile = createServerData$(getRequest, {
    key: () => [`profiles/admin/${params.id}`],
  });

  return profile;
}

export async function profileDelete(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const data = await deleteRequest(request, `profiles/admin/${id}`);
  return redirect(`/admin/profiles`);
}
export default function AdminProfileDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(profileDelete);

  return (
    <main class="p-4">
      <Title>Profile Delete</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Profile Delete</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <p>Are you sure you wish to delete this item?</p>
        <p>This action cannot be undone.</p>

        <div class="mt-4">
          <Form>
            <HiddenInput name="id" value={params.id} />
            <DeleteButton loading={action.pending} />
          </Form>
        </div>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
