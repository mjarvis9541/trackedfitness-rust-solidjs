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
  return createServerData$(getRequest, { key: () => [`sets/${params.id}`] });
}

export async function setDelete(form: FormData, event: ServerFunctionEvent) {
  const id = form.get("id");
  const data = await deleteRequest(event.request, `sets/${id}`);
  return redirect(`admin/sets`);
}

export default function AdminSetDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(setDelete);

  return (
    <main class="p-4">
      <Title>Set Delete</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Set Delete</h1>

        <p>Are you sure you wish to delete this item?</p>
        <p>This action cannot be undone.</p>

        <div class="mt-4">
          <Form>
            <Form>
              <HiddenInput name="id" value={params.id} />
              <DeleteButton loading={action.pending} />
            </Form>
          </Form>
        </div>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
