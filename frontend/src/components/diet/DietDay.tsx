import { For, Show, createEffect, createSignal } from "solid-js";
import { useParams } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import { deleteMultiRequest, postRequest } from "~/services/api";
import HiddenInput from "../ui/HiddenInput";
import Input from "../ui/Input";
import ModalWrapper from "../ui/ModalWrapper";
import DietDayHeader from "./DietDayHeader";
import DietDayTarget from "./DietDayTarget";
import DietDayTargetEmpty from "./DietDayTargetEmpty";
import DietDayTargetStats from "./DietDayTargetStats";
import DietDayTotal from "./DietDayTotal";
import DietDayTotalStats from "./DietDayTotalStats";
import DietMeal from "./DietMeal";

export type DietDayProps = {
  date: any;
  username: string;
  dietDay: any;
  dietTarget: any;
};

export async function dietDeleteMulti(
  form: FormData,
  { request }: { request: Request },
) {
  const id_range = form.getAll("checkbox");
  return await deleteMultiRequest(request, "diet", { id_range });
}

export async function mealCreateFromDiet(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  const name = form.get("name");
  const id_range = form.getAll("checkbox");
  return await postRequest(request, `diet/create-from-diet`, {
    username,
    name,
    id_range,
  });
}

export default function DietDay(props: DietDayProps) {
  const params = useParams<{ username: string }>();

  const [showModal, setShowModal] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);

  const [isChecked, setIsChecked] = createSignal<string[]>([]);
  const handleCheck = (e: any) => {
    let checked = e.target.checked;
    let value = e.target.value;
    if (checked) {
      setIsChecked([...isChecked(), value]);
    } else {
      setIsChecked((prev) => prev.filter((id) => id !== value));
    }
  };

  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const form_action = form.get("form_action");
      if (form_action === "delete") {
        return await dietDeleteMulti(form, { request });
      }
      if (form_action === "create") {
        const username = form.get("username");
        const data = await mealCreateFromDiet(form, { request });
        return redirect(`/users/${username}/meals/${data.id}`);
      }
    },
  );

  createEffect((prev) => {
    if (action.result === prev) return;
    setIsChecked([]);
    setShowModal(false);
    setShowDeleteModal(false);
  });

  return (
    <>
      <Form>
        <div class="grid grid-cols-4 md:grid-cols-checkbox-11">
          <For each={props.dietDay.meal}>
            {(data) => (
              <DietMeal
                username={props.username}
                date={props.date}
                data={data}
                setIsChecked={setIsChecked}
                handleCheck={handleCheck}
                isChecked={isChecked}
              />
            )}
          </For>
          <DietDayTotal data={props.dietDay} />
          <Show
            when={props.dietTarget}
            fallback={
              <DietDayTargetEmpty username={props.username} date={props.date} />
            }
          >
            <DietDayTarget data={props.dietTarget} />
          </Show>
          <DietDayTargetStats data={props.dietDay} />
          <DietDayTotalStats data={props.dietTarget} />
          <DietDayHeader />
        </div>
        {/* modal buttons */}
        <div class="flex gap-2">
          <div>
            <button
              type="button"
              value="delete"
              class="bg-red-500 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-500"
              disabled={isChecked().length === 0}
              onclick={() => setShowDeleteModal(!showDeleteModal())}
            >
              Delete
            </button>
          </div>
          <div>
            <button
              type="button"
              class="bg-zinc-700 px-3 py-1 text-zinc-100 hover:bg-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-700"
              disabled={isChecked().length === 0}
              onclick={() => setShowModal(!showModal())}
            >
              Save as Meal
            </button>
          </div>
        </div>

        <div class="pt-4"></div>
        <Show when={showDeleteModal()}>
          <ModalWrapper
            setShowModal={setShowDeleteModal}
            title={"Delete Diet Entries"}
          >
            <button
              type="submit"
              name="form_action"
              value="delete"
              class="bg-red-500 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-500"
              disabled={isChecked().length === 0}
            >
              Delete
            </button>
          </ModalWrapper>
        </Show>
        <Show when={showModal()}>
          <ModalWrapper setShowModal={setShowModal} title={"Save as Meal"}>
            <HiddenInput name="username" value={params.username} />
            <Input name="name" />
            <div class="flex justify-end">
              <button
                type="submit"
                name="form_action"
                value="create"
                class="bg-zinc-700 px-3 py-1 text-zinc-100 hover:bg-zinc-600 disabled:opacity-50 disabled:hover:bg-zinc-700"
                disabled={isChecked().length === 0}
              >
                Save
              </button>
            </div>
          </ModalWrapper>
        </Show>
      </Form>
    </>
  );
}
