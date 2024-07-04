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
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meal-of-day/${params.id}`],
  });
}

export default function AdminMealOfDayDetailPage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }: { request: Request }) => {
      const id = form.get("id");
      const name = form.get("name");
      const ordering = Number(form.get("ordering"));

      const data = await putRequest(request, `meal-of-day/${id}`, {
        name,
        ordering,
      });

      return redirect(`/admin/meal-of-day/${data.id}`);
    },
  );

  return (
    <main class="p-4">
      <Title>Meal of Day Detail</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Meal of Day Detail</h1>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <div class="mb-8 max-w-lg border border-zinc-700 p-4">
          <h2 class="mb-4 text-xl font-bold">Update Meal of Day</h2>
          <Show when={action.error}>
            <pre>{JSON.stringify(action.error, null, 2)}</pre>
          </Show>
          <Show when={data()}>
            <Form>
              <HiddenInput name="id" value={data().id} />
              <Input name="name" value={data().name} />
              <Input name="ordering" value={data().ordering} />

              <Button loading={action.pending} label="Update Meal of Day" />
            </Form>
          </Show>
        </div>

        <div class="max-w-lg border border-zinc-700 p-4">
          <h2 class="mb-4 text-xl font-bold">Delete</h2>
          <p class="mb-4">Are you sure you wish to delete this item?</p>
          <p class="mb-8">This action cannot be undone.</p>

          <DeleteForm
            url={`meal-of-day/${params.id}`}
            redirectTo={`/admin/meal-of-day`}
          />
        </div>
      </div>
    </main>
  );
}
