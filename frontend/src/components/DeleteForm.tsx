import { createServerAction$, redirect } from "solid-start/server";
import { getToken } from "~/services/sessions";
import { DeleteButton } from "./ui/Button";
import HiddenInput from "./ui/HiddenInput";

type DeleteFormProps = {
  url: string;
  redirectTo: string;
};

export default function DeleteForm(props: DeleteFormProps) {
  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const token = await getToken(request);
      const url = form.get("url");
      const redirectTo = form.get("redirectTo") as string;
      const res = await fetch(`${process.env.API}/${url}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return { errors: await res.json() };
      const data = await res.json();
      if (redirectTo) {
        return redirect(redirectTo);
      }
      return data;
    },
  );
  return (
    <Form>
      <HiddenInput name="url" value={props.url} />
      <HiddenInput name="redirectTo" value={props.redirectTo} />
      <DeleteButton loading={action.pending} label="Delete" />
    </Form>
  );
}
