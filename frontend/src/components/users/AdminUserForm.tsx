import { Show } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import { APIMutation } from "~/services/api";
import Button from "../ui/Button";
import HiddenInput from "../ui/HiddenInput";
import Input from "../ui/Input";
import InputCheckbox from "../ui/InputCheckbox";

async function adminUserMutation(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const action = (form.get("action") as string) || ("POST" as string);
  const name = form.get("name");
  const username = form.get("username");
  const password = form.get("password");
  const email = form.get("email");
  const email_change_to = form.get("email_change_to");
  const email_verified = form.get("email_verified") === "1" || false;
  const is_active = form.get("is_active") === "1" || false;
  const is_staff = form.get("is_staff") === "1" || false;
  const is_superuser = form.get("is_superuser") === "1" || false;
  const privacy_level = Number(form.get("privacy_level"));

  let url = "users";
  if (id) {
    url = `users/admin/${id}`;
  }
  let method;
  switch (action.toLowerCase()) {
    case "put":
      method = "PUT";
      break;
    case "delete-id-range":
      method = "DELETE";
      url = `${url}/delete-id-range`;
      break;
    case "delete":
      method = "DELETE";
      break;
    default:
      method = "POST";
  }

  return await APIMutation(request, url, method, {
    name,
    username,
    password,
    email,
    email_change_to,
    email_verified,
    is_active,
    is_staff,
    is_superuser,
    privacy_level,
  });
}

type AdminUserFormProps = {
  data?: any;
  redirectTo?: string;
};

export default function AdminUserForm(props: AdminUserFormProps) {
  const [action, { Form }] = createServerAction$(adminUserMutation);

  return (
    <div>
      <Form>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <HiddenInput name="id" value={props?.data?.id} />
        <HiddenInput name="action" value={props?.data ? "PUT" : "POST"} />
        <HiddenInput name="redirectTo" value={props?.redirectTo || ""} />
        <Input name="name" value={props?.data?.name} />
        <Input name="username" value={props?.data?.username} />
        <Input name="password" type="password" />
        <Input name="email" value={props?.data?.email} />
        <Input name="email_change_to" value={props?.data?.email_change_to} />
        <InputCheckbox
          name="email_verified"
          checked={props?.data?.email_verified}
        />
        <InputCheckbox name="is_active" checked={props?.data?.is_active} />
        <InputCheckbox name="is_staff" checked={props?.data?.is_staff} />
        <InputCheckbox
          name="is_superuser"
          checked={props?.data?.is_superuser}
        />
        <Input
          name="privacy_level"
          value={props?.data?.privacy_level.toString()}
        />
        <div class="mt-8">
          <Button
            loading={action.pending}
            label={props?.data ? "Update User" : "Create User"}
          />
        </div>
      </Form>
    </div>
  );
}
