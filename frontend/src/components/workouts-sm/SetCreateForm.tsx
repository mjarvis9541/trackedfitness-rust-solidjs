import { createServerAction$ } from "solid-start/server";

import { postRequest } from "~/services/api";
import { WorkoutButton } from "../ui/Button";
import HiddenInput from "../ui/HiddenInput";
import SetInput from "../workouts/SetInput";

export async function setCreateMulti(
  form: FormData,
  { request }: { request: Request },
) {
  const exercise_id = form.get("exercise_id");
  const order = Number(form.get("order"));
  const weight = form.get("weight");
  const reps = Number(form.get("reps"));
  const rest = Number(form.get("rest"));
  const set_count = Number(form.get("set_count"));
  const notes = form.get("notes");
  return await postRequest(request, `sets/create-range`, {
    exercise_id,
    order,
    weight,
    reps,
    rest,
    notes,
    set_count,
  });
}

export default function CreateSetForm(props: any) {
  const [action, { Form }] = createServerAction$(setCreateMulti);

  return (
    <Form class="contents">
      <HiddenInput name="exercise_id" value={props.exercise_id} />
      <HiddenInput name="notes" value={""} />
      <SetInput name="set_count" value={1} label="Sets" />
      <SetInput name="weight" value={60} label="kg" />
      <SetInput name="reps" value={10} label="Reps" />
      <SetInput name="rest" value={0} label="Rest" />
      <div class="col-span-2">
        <WorkoutButton label="Add Set" loading={action.pending} />
      </div>
    </Form>
  );
}
