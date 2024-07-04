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
  return createServerData$(getRequest, {
    key: () => [`meal-food/${params.mealFoodId}`],
  });
}

export async function mealFoodUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const username = form.get("username");
  const meal_id = form.get("meal_id");
  const food_id = form.get("food_id");
  const quantity = form.get("quantity");
  const data = await putRequest(request, `meal-food/${id}`, {
    meal_id,
    food_id,
    quantity,
  });
  return redirect(`/users/${username}/meals/${data.meal_id}`);
}

export default function MealFoodUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{
    username: string;
    id: string;
    mealFoodId: string;
  }>();

  const [action, { Form }] = createServerAction$(mealFoodUpdate);

  return (
    <main class="p-4">
      <Title>Edit Meal Food</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Edit Meal Food</h1>
        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <Show when={data()}>
          <div class="max-w-sm">
            <Form>
              <HiddenInput name="meal_id" value={params.id} />
              <HiddenInput name="username" value={params.username} />
              <HiddenInput name="food_id" value={data().food_id} />
              <HiddenInput name="id" value={params.mealFoodId} />
              <Input name="quantity" value={data().data_value} />
              <Button loading={action.pending} label="Update Meal Food" />
            </Form>
          </div>
        </Show>
      </div>
    </main>
  );
}
