import { ServerFunctionEvent, createServerAction$ } from "solid-start/server";
import { deleteRequest } from "~/services/api";
import HiddenInput from "../ui/HiddenInput";
import { CloseIconRed } from "../ui/Icon";
import SetUpdateForm from "./SetUpdateForm";

export async function setDelete(form: FormData, event: ServerFunctionEvent) {
  const id = form.get("id");
  const data = await deleteRequest(event.request, `sets/${id}`);
  return data;
}

export default function SetContainer(props: any) {
  const [action, { Form }] = createServerAction$(setDelete);

  return (
    <div class="contents">
      <SetUpdateForm set={props.set} exercise_id={props.exercise_id} />
      <Form class="contents">
        <HiddenInput value={props.set.set_id} />
        <button class="flex items-center justify-end p-1 hover:bg-zinc-700">
          <CloseIconRed />
        </button>
      </Form>
    </div>
  );
}
