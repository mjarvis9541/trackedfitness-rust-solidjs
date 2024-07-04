import { For } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import { postRequest } from "~/services/api";
import { WorkoutButton } from "../ui/Button";
import HiddenInput from "../ui/HiddenInput";
import SetInput from "../workouts/SetInput";

export async function exerciseCreateWithSets(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  const workout_id = form.get("workout_id");
  const movement_id = form.get("movement_id");
  const weight = form.get("weight");
  const reps = Number(form.get("reps"));
  const rest = Number(form.get("rest"));
  const set_count = Number(form.get("set_count"));
  const data = await postRequest(request, `exercises/create-with-sets`, {
    workout_id,
    movement_id,
    weight,
    reps,
    rest,
    set_count,
  });

  return data;
}

export default function ExerciseCreateForm(props: any) {
  const [action, { Form }] = createServerAction$(exerciseCreateWithSets);
  return (
    <Form class="contents">
      <HiddenInput name="username" value={props.workout.username} />
      <HiddenInput name="workout_id" value={props.workout.workout_id} />

      <SetInput name="set_count" value={3} label="Sets" />
      <SetInput name="weight" value={60} label="kg" />
      <SetInput name="reps" value={10} label="Reps" />
      <SetInput name="rest" value={0} label="Rest" />
      <div></div>
      <div></div>

      <div></div>
      <div></div>
      <div class="col-span-2">
        <select
          name="movement_id"
          class="h-full w-full rounded border-zinc-800 bg-zinc-800 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500"
        >
          <For each={props.movementSelect}>
            {(option) => <option value={option.id}>{option.name}</option>}
          </For>
        </select>
      </div>
      <div class="col-span-2">
        <WorkoutButton label="Add Exercise" loading={action.pending} />
      </div>
    </Form>
  );
}
