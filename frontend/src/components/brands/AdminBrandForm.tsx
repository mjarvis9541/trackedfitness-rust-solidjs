import { Show } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import { APIMutation } from "~/services/api";

import Button from "../ui/Button";
import HiddenInput from "../ui/HiddenInput";
import ValidatedInput from "../ui/ValidatedInput";

export async function mutate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const slug = form.get("slug");
  const action = form.get("action") as string;
  const name = form.get("name");

  let url = "brands";
  let method = "PUT";
  if (action === "PUT") {
    method = "PUT";
    url = `${url}/${slug}`;
  } else {
    method = "POST";
  }

  const data = await APIMutation(request, url, method, { name });
  return data;
}

export default function AdminBrandForm(props: any) {
  const [action, { Form }] = createServerAction$(mutate);

  return (
    <>
      {/* <Show when={action.error}>
        <pre>{JSON.stringify(action.error, null, 2)}</pre>
      </Show> */}
      <Show when={action.error && action.error.detail}>
        <span class="mb-4 block font-bold text-red-500">
          {action.error.detail}
        </span>
      </Show>
      <Form>
        <HiddenInput name="slug" value={props?.data?.slug} />
        <HiddenInput name="id" value={props?.data?.id} />
        <HiddenInput name="action" value={props?.data?.id ? "PUT" : "POST"} />
        <ValidatedInput
          name="name"
          value={props?.data?.name}
          error={action.error}
        />
        {/* <Input name="image_url" label="Image URL" value={props.brand().name} /> */}
        <div class="mt-8">
          <Button
            loading={action.pending}
            label={props?.data ? "Update Brand" : "Create Brand"}
          />
        </div>
      </Form>
    </>
  );
}
