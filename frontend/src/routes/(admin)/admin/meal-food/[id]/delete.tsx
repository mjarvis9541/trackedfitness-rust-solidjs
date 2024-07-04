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
    key: () => [`meal-food/${params.id}`],
  });
}

export async function mealFoodDelete(
  form: FormData,
  event: ServerFunctionEvent,
) {
  const id = form.get("id");
  const data = await deleteRequest(event.request, `meal-foods/${id}`);
  return redirect(`admin/meal-foods`);
}

export default function AdminMealFoodDeletePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(mealFoodDelete);

  return (
    <main class="p-4">
      <Title>Meal Food Delete</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Meal Food Delete</h1>

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
