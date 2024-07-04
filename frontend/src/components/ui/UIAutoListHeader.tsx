import { For, Show } from "solid-js";
import { classNames } from "~/utils/text";
import CheckboxAll from "../ui/CheckboxAll";

type AutoListHeaderProps = {
  checkbox?: boolean;
  headers: { classes: string; title: string }[];
  data: any;
  checked: any;
  setChecked: any;
};

export default function AutoListHeader(props: AutoListHeaderProps) {
  return (
    <>
      <Show when={props.checkbox}>
        <div class={"truncate border-b-[1px] border-zinc-300 p-2 font-bold"}>
          <CheckboxAll {...props} />
        </div>
      </Show>
      <For each={props.headers}>
        {(header) => (
          <div
            class={classNames(
              "truncate border-b-[1px] border-zinc-300 p-2 font-bold",
              header.classes,
            )}
          >
            {header.title}
          </div>
        )}
      </For>
    </>
  );
}
