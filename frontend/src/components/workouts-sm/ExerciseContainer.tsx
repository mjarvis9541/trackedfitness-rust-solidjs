import { For, Show, createEffect, createSignal } from "solid-js";
import { A } from "solid-start";
import { ServerFunctionEvent, createServerAction$ } from "solid-start/server";

import { deleteRequest } from "~/services/api";
import HiddenInput from "../ui/HiddenInput";
import { CloseIconRed } from "../ui/Icon";
import ModalWrapper from "../ui/ModalWrapper";
import SetCount from "../workouts/SetCount";
import SetContainer from "./SetContainer";
import CreateSetForm from "./SetCreateForm";

export default function ExerciseContainer(props: any) {
  return (
    <div class="mb-2">
      <ExerciseHeader {...props} />

      <div class="mb-2 grid grid-cols-[0.75fr_1fr_1fr_1fr_0.5fr_0.5fr] gap-1">
        <Show when={props.exercise.set_count > 0}>
          <For each={props.exercise.sets}>
            {(set) => (
              <SetContainer
                set={set}
                exercise_id={props.exercise.exercise_id}
              />
            )}
          </For>
        </Show>
        <div class="col-span-full p-1" />
      </div>
      <div class="grid grid-cols-[0.75fr_1fr_1fr_1fr_0.5fr_0.5fr] gap-1 border border-purple-500 p-1 py-2">
        <CreateSetForm exercise_id={props.exercise.exercise_id} />
      </div>
    </div>
  );
}

export async function exerciseDelete(
  form: FormData,
  event: ServerFunctionEvent,
) {
  const id = form.get("id");
  return await deleteRequest(event.request, `brands/${id}`);
}

function ExerciseHeader(props: any) {
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [action, { Form }] = createServerAction$(exerciseDelete);
  createEffect((prev) => {
    if (action.result === prev) return;
    setShowDeleteModal(false);
  });
  return (
    <div class="mb-1 flex items-center gap-2 bg-zinc-800 p-2">
      <div class="flex-1 font-bold">
        <A
          href={`/admin/exercises/${props.exercise.exercise_id}`}
          class="hover:underline"
        >
          {props.exercise.name}
        </A>
      </div>

      <SetCount count={props.exercise.set_count} label="sets" />

      <Form class="">
        <HiddenInput value={props.exercise.exercise_id} />
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
            title={"Delete Exercise"}
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
