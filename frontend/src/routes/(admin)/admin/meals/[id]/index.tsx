import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`meals/${params.id}`],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { data, userSelect };
}

export async function mealUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const user_id = form.get("user_id");
  const name = form.get("name");
  const data = await putRequest(request, `meals/${id}`, { user_id, name });
  return redirect(`/admin/meals/${data.id}`);
}

export default function AdminMealDetailPage() {
  const { data, userSelect } = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(mealUpdate);
  return (
    <main class="p-4">
      <Title>Meal Detail</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Meal Detail</h1>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <div class="mb-8 max-w-lg border border-zinc-700 p-4">
          <h1 class="mb-4 text-xl font-bold">Meal Update</h1>
          <Show when={action.error}>
            <pre>{JSON.stringify(action.error, null, 2)}</pre>
          </Show>

          <Show when={data()}>
            <Form>
              <HiddenInput name="id" value={params.id} />
              <Select
                name="user_id"
                label="User"
                options={userSelect()}
                value={data().user_id}
              />
              <Input name="name" value={data().name} />
              <Button loading={action.pending} label="Update Meal" />
            </Form>
          </Show>
        </div>

        <div class="max-w-lg border border-zinc-700 p-4">
          <h2 class="mb-4 text-xl font-bold">Meal Delete</h2>
          <p class="mb-4">Are you sure you wish to delete this item?</p>
          <p class="mb-8">This action cannot be undone.</p>

          <DeleteForm url={`meals/${params.id}`} redirectTo={`/admin/meals`} />
        </div>
      </div>
    </main>
  );
}
