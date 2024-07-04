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
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, { key: () => [`meals/${params.id}`] });
}

export async function mealUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const username = form.get("username");
  const name = form.get("name");
  const data = await putRequest(request, `meals/${id}`, { username, name });
  return redirect(`/users/${username}/meals/${data.id}`);
}

export default function MealUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; id: string }>();
  const [action, { Form }] = createServerAction$(mealUpdate);

  return (
    <main class="p-4">
      <Title>Edit Meal</Title>

      <div class="p-4">
        <h1 class="text-xl font-bold">Edit Meal</h1>
        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <Show when={data()}>
          <div class="max-w-sm">
            <Form>
              <HiddenInput name="id" value={params.id} />
              <HiddenInput name="username" value={params.username} />
              <Input name="name" value={data().name} />
              <Button loading={action.pending} label="Update Meal" />
            </Form>
          </div>
        </Show>
      </div>
    </main>
  );
}
