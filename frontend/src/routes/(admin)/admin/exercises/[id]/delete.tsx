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
    key: () => [`exercises/${params.id}`],
  });
}

export async function exerciseDelete(
  form: FormData,
  event: ServerFunctionEvent,
) {
  const id = form.get("id");
  const data = await deleteRequest(event.request, `exercises/${id}`);
  return redirect(`admin/exercises`);
}

export default function AdminExerciseDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(exerciseDelete);

  return (
    <main class="p-4">
      <Title>Exercise Delete</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Exercise Delete</h1>

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
