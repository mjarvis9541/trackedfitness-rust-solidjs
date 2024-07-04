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
import Select from "~/components/ui/Select";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const diet = createServerData$(getRequest, {
    key: () => [`diet/${params.id}`],
  });
  const mealOfDay = createServerData$(getRequest, {
    key: () => ["meal-of-day/select"],
  });
  return { diet, mealOfDay };
}

export async function dietUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const username = form.get("username");
  const date = form.get("date");
  const meal_of_day_id = form.get("meal_of_day_id");
  const food_id = form.get("food_id");
  const quantity = form.get("quantity");
  const data = await putRequest(request, `diet/${id}`, {
    username,
    date,
    food_id,
    meal_of_day_id,
    quantity,
  });
  return redirect(`/users/${username}/${data.date}`);
}

export default function DietUpdatePage() {
  const { diet, mealOfDay } = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; id: string }>();
  const [action, { Form }] = createServerAction$(dietUpdate);

  return (
    <main class="p-4">
      <Title>Edit Diet Entry</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Edit Diet Entry</h1>
        <Show when={diet() && mealOfDay()}>
          <Show when={action.error}>
            <pre>{JSON.stringify(action.error, null, 2)}</pre>
          </Show>
          <Form>
            <HiddenInput name="id" value={params.id} />
            <HiddenInput name="username" value={params.username} />
            <HiddenInput name="food_id" value={diet().food_id} />
            <Input name="date" type="date" value={diet().date} />

            <Select
              name="meal_of_day_id"
              label="Meal of Day"
              options={mealOfDay()}
              value={diet().meal_of_day_id}
            />
            <Input name="quantity" value={diet().data_value} />
            <Button loading={action.pending} label="Update Diet Entry" />
          </Form>
        </Show>
      </div>
      <pre>{JSON.stringify(diet(), null, 2)}</pre>
    </main>
  );
}
