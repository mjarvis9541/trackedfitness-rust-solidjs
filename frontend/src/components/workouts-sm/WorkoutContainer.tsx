import { For, Show, createEffect, createSignal } from "solid-js";
import { A } from "solid-start";
import { ServerFunctionEvent, createServerAction$ } from "solid-start/server";
import { deleteRequest } from "~/services/api";
import { formatDateStrLong } from "~/utils/datetime";
import HiddenInput from "../ui/HiddenInput";
import { CloseIconRed } from "../ui/Icon";
import ModalWrapper from "../ui/ModalWrapper";
import SetCount from "../workouts/SetCount";
import ExerciseContainer from "./ExerciseContainer";
import ExerciseCreateForm from "./ExerciseCreateForm";

export default function WorkoutContainer(props: any) {
  return (
    <div class="mb-4">
      <WorkoutHeader {...props} />
      <Show when={props.workout.exercise_count > 0}>
        <For each={props.workout.exercises}>
          {(exercise) => <ExerciseContainer exercise={exercise} />}
        </For>
      </Show>

      <div class="grid grid-cols-[0.75fr_1fr_1fr_1fr_0.5fr_0.5fr] gap-1 border border-amber-300 p-1 py-2">
        <ExerciseCreateForm
          workout={props.workout}
          movementSelect={props.movementSelect}
        />
      </div>
    </div>
  );
}

export async function workoutDelete(
  form: FormData,
  event: ServerFunctionEvent,
) {
  const id = form.get("id");
  const data = await deleteRequest(event.request, `workouts/${id}`);
  return data;
}

function WorkoutHeader(props: any) {
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [action, { Form }] = createServerAction$(workoutDelete);

  createEffect((prev) => {
    if (action.result === prev) return;
    setShowDeleteModal(false);
  });

  return (
    <div class="flex items-center gap-2 bg-amber-400 p-2 text-zinc-900">
      <div class="flex-1 font-bold">
        <A
          href={`/admin/workouts/${props.workout.workout_id}`}
          class="hover:underline"
        >
          {formatDateStrLong(props.workout.date)}
        </A>
      </div>
      <div>{props.workout.username}</div>
      <SetCount count={props.workout.exercise_count} label="exercises" />
      <SetCount count={props.workout.set_count} label="sets" />
      <Form class="">
        <HiddenInput value={props.workout.workout_id} />

        <button
          type="button"
          value="delete"
          class="block p-1 hover:bg-zinc-700"
          onclick={() => setShowDeleteModal(!showDeleteModal())}
        >
          <CloseIconRed />
        </button>

        <Show when={showDeleteModal()}>
          <ModalWrapper
            setShowModal={setShowDeleteModal}
            title={"Delete Workout"}
          >
            <button
              type="submit"
              name="form_action"
              value="delete"
              class="block bg-red-500 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-500"
            >
              Delete
            </button>
          </ModalWrapper>
        </Show>
      </Form>
    </div>
  );
}
