import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { getRequest } from "~/services/api";
import { getToken } from "~/services/sessions";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meal-of-day/${params.slug}`],
  });
}

export default function MealOfDayUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ slug: string }>();

  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const token = await getToken(request);
      const slug = form.get("slug");
      const name = form.get("name");
      const ordering = form.get("ordering");
      const res = await fetch(`${process.env.API}/meal-of-day/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, ordering }),
      });
      if (!res.ok) return { errors: await res.json() };
      const data = await res.json();
      return redirect(`/meals/${data.slug}`);
    },
  );

  return (
    <main class="p-4">
      <Title>Edit Meal of Day</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Edit Meal of Day</h1>
        <Show when={data()}>
          <Form>
            <input type="hidden" name="slug" value={params.slug} />
            <Input name="name" value={data().name} />
            <Input name="ordering" value={data().ordering} />
            <Button loading={action.pending} label="Update Meal of Day" />
          </Form>
        </Show>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
