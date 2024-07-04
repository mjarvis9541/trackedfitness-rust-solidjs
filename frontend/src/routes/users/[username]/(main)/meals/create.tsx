import { Title, useParams } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import { postRequest } from "~/services/api";

export async function mealCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  const name = form.get("name");
  const data = await postRequest(request, "meals", { username, name });
  return redirect(`/users/${username}/meals/${data.id}`);
}

export default function SavedMealCreatePage() {
  const params = useParams<{ username: string }>();
  const [action, { Form }] = createServerAction$(mealCreate);

  return (
    <main class="p-4">
      <Title>New Meal</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">New Meal</h1>

        <Form>
          <HiddenInput name="username" value={params.username} />
          <Input name="name" />
          <Button loading={action.pending} label="Create Meal" />
        </Form>
      </div>
    </main>
  );
}
