import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`brands/${params.slug}`],
  });
}

async function brandUpdate(form: FormData, { request }: { request: Request }) {
  const slug = form.get("slug");
  const name = form.get("name");
  const image_url = form.get("image_url");
  const data = await putRequest(request, `brands/${slug}`, { name, image_url });
  return redirect(`/brands/${data.slug}`);
}

export default function BrandUpdatePage() {
  const brand = useRouteData<typeof routeData>();
  const params = useParams<{ slug: string }>();

  const [action, { Form }] = createServerAction$(brandUpdate);

  return (
    <main class="p-4">
      <Title>Edit Brand</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Edit Brand</h1>
        <Show when={brand()}>
          <Form>
            <input type="hidden" name="slug" value={params.slug} />
            <Input name="name" value={brand().name} />
            <Input name="image_url" label="Image URL" value={brand().name} />
            <Button loading={action.pending} label="Update Brand" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(brand(), null, 2)}</pre>
    </main>
  );
}
