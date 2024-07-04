import { createServerAction$ } from "solid-start/server";
import { putRequest } from "~/services/api";
import HiddenInput from "../ui/HiddenInput";
import { SaveIcon } from "../ui/Icon";
import SetInput from "../workouts/SetInput";

export async function setUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const exercise_id = form.get("exercise_id");
  const order = Number(form.get("order"));
  const weight = form.get("weight");
  const reps = Number(form.get("reps"));
  const rest = Number(form.get("rest"));
  const notes = form.get("notes");
  return await putRequest(request, `sets/${id}`, {
    exercise_id,
    order,
    weight,
    reps,
    rest,
    notes,
  });
}

export default function SetUpdateForm(props: any) {
  const [action, { Form }] = createServerAction$(setUpdate);
  return (
    <div class="contents">
      <Form class="contents">
        <div class="flex-1">
          <input
            type="text"
            name="order"
            value={props.set.set_order}
            class="w-full rounded bg-inherit px-3 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500"
          />
        </div>
        <HiddenInput name="id" value={props.set.set_id} />
        <HiddenInput name="exercise_id" value={props.exercise_id} />
        <HiddenInput name="notes" value={""} />
        <SetInput name="weight" value={props.set.weight} label="kg" />
        <SetInput name="reps" value={props.set.reps} label="Reps" />
        <SetInput name="rest" value={props.set.rest} label="Rest" />
        <button class="flex items-center justify-end p-1 hover:bg-zinc-700">
          <SaveIcon />
        </button>
      </Form>
    </div>
  );
}
