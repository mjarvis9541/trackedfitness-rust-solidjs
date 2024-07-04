import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import { getRequest } from "~/services/api";
import { getToken } from "~/services/sessions";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`meal-food/${params.id}`],
  });
}

export default function AdminMealUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      try {
        const id = form.get("id");
        const meal_id = form.get("meal_id");
        const food_id = form.get("food_id");
        const quantity = form.get("quantity");
        const token = await getToken(request);
        const res = await fetch(`${process.env.API}/meal-food/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            meal_id,
            food_id,
            quantity,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message);
        }
        const data = await res.json();

        return {
          data,
        };
      } catch (e) {
        throw new Error(`${e}`);
      }
    },
  );

  return (
    <main class="p-4">
      <Title>Meal Food Update</Title>

      <div class="max-w-md border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Meal Food Update</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <Show when={data()}>
          <Form>
            <HiddenInput name="id" value={params.id} />
            <Input name="meal_id" value={data().meal_id} />
            <Input name="food_id" value={data().food_id} />
            <Input name="quantity" value={data().quantity} />
            <Button loading={action.pending} label="Update Meal Food" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
