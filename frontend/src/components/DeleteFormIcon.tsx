import { createServerAction$, redirect } from "solid-start/server";
import { deleteRequest } from "~/services/api";
import HiddenInput from "./ui/HiddenInput";
import { CloseIconRed } from "./ui/Icon";

type DeleteFormIconProps = {
  url: string;
  redirectTo?: string;
};

export default function DeleteFormIcon(props: DeleteFormIconProps) {
  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const url = form.get("url") as string;
      const redirectTo = form.get("redirectTo") as string;
      const data = await deleteRequest(request, url);
      if (redirectTo) {
        return redirect(redirectTo);
      }
      return data;
    },
  );
  return (
    <Form class="contents">
      <HiddenInput name="url" value={props.url} />
      <HiddenInput name="redirectTo" value={props.redirectTo || ""} />
      <button class="block p-1 hover:bg-zinc-500" disabled={action.pending}>
        <CloseIconRed />
      </button>
    </Form>
  );
}
