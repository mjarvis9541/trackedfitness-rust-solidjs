import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  ServerFunctionEvent,
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { DeleteButton } from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import { deleteRequest, getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`diet/${params.id}`],
  });
}

export async function dietDelete(form: FormData, event: ServerFunctionEvent) {
  const id = form.get("id");
  const data = await deleteRequest(event.request, `diet/${id}`);
  return redirect(`admin/diet`);
}

export default function AdminDietDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();
  const [action, { Form }] = createServerAction$(dietDelete);

  return (
    <main class="p-4">
      <Title>Diet Delete</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Diet Delete</h1>

        <p class="mb-4">Are you sure you wish to delete this item?</p>
        <p class="mb-4">This action cannot be undone.</p>

        <Form>
          <HiddenInput name="id" value={params.id} />
          <DeleteButton loading={action.pending} />
        </Form>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
