import { Show } from "solid-js";
import { Title } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import { z } from "zod";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { postRequest } from "~/services/api";

const brandSchema = z.object({
  name: z.string().min(3, { message: "minimum 3 characters" }),
});

export async function brandCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const name = form.get("name");
  const data = await postRequest(request, "brands", { name });
  return redirect(`/brands/${data.slug}`);
}

export default function BrandCreatePage() {
  const [action, { Form }] = createServerAction$(brandCreate);

  return (
    <main class="p-4">
      <Title>New Brand</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">New Brand</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <Form>
          <Input name="name" />
          <Button loading={action.pending} label="Create Brand" />
        </Form>
      </div>
    </main>
  );
}
