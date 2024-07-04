import { Show } from "solid-js";
import { RouteDataArgs, Title, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const diet = createServerData$(getRequest, {
    key: () => [`diet/${params.id}`],
  });
  const mealOfDay = createServerData$(getRequest, {
    key: () => [`meal-of-day/select`],
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
  return redirect(`/admin/diet/${data.id}`);
}
export default function AdminDietUpdatePage() {
  const { diet, mealOfDay } = useRouteData<typeof routeData>();
  const [action, { Form }] = createServerAction$(dietUpdate);

  return (
    <main class="p-4">
      <Title>Diet Update</Title>

      <div class="max-w-md border bg-zinc-900 p-4">
        <h1 class="mb-4 text-xl font-bold">Diet Update</h1>
        <Show when={diet() && mealOfDay()}>
          <Form>
            <input type="hidden" name="id" value={diet().id} />
            <Input name="username" value={diet().user_id} />
            <Input name="date" type="date" value={diet().date} />
            <Select
              name="meal_of_day_id"
              label="Meal of Day"
              options={mealOfDay()}
              value={diet().meal_of_day_id}
            />
            <Input name="food_id" value={diet().food_id} />
            <Input name="quantity" value={diet().data_value} />
            <Button loading={action.pending} label="Update Diet" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(diet(), null, 2)}</pre>
    </main>
  );
}
