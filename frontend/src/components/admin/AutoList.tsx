import { Show, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { createServerAction$ } from "solid-start/server";
import AutoListHeader from "~/components/admin/AutoListHeader";
import AutoListItem from "~/components/admin/AutoListItem";
import { deleteMultiRequest } from "~/services/api";
import Paginator from "../Paginator";
import { DeleteButton } from "../ui/Button";
import HiddenInput from "../ui/HiddenInput";

export type HeaderProps = {
  classes: string;
  title: string;
};

export type RowProps = {
  classes: string;
  fixed?: number;
  href?: string;
  lookup?: string;
  title: string;
  type?: string;
};

type AutoListProps = {
  checkbox: boolean;
  data: object[];
  headers: HeaderProps[];
  rows: RowProps[];
  url: string;
  cols?: string;
};

export default function AutoList(props: AutoListProps) {
  const [checked, setChecked] = createStore([]);

  const [action, { Form: DeleteForm }] = createServerAction$(
    async (form: FormData, { request }: { request: Request }) => {
      const url = form.get("url") as string;
      const id_range = form.getAll("checkbox");
      return await deleteMultiRequest(request, url, { id_range });
    },
  );

  createEffect((prev) => {
    if (action.result === prev) return;
    setChecked([]);
  });

  return (
    <DeleteForm>
      <HiddenInput name="url" value={props.url} />
      <Show when={action.error}>
        <pre>{JSON.stringify(action.error, null, 2)}</pre>
      </Show>
      <div class="mt-4 flex justify-end">
        <Paginator />
      </div>
      <div class={`grid ${props.cols ? props.cols : "grid-cols-checkbox-12"}`}>
        <AutoListHeader
          checkbox={props.checkbox}
          headers={props.headers}
          data={props.data}
          checked={checked}
          setChecked={setChecked}
        />
        <AutoListItem
          checkbox={props.checkbox}
          rows={props.rows}
          data={props.data}
          checked={checked}
          setChecked={setChecked}
        />
      </div>
      <div class="mt-4 flex justify-between">
        <DeleteButton
          label="Delete"
          disabled={checked.length === 0}
          loading={action.pending}
        />
        <Paginator />
      </div>
    </DeleteForm>
  );
}
