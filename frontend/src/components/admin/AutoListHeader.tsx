import { For, Show } from "solid-js";
import CheckboxAll from "../ui/CheckboxAll";
import { HeaderProps } from "./AutoList";

type AutoListHeaderProps = {
  checkbox?: boolean;
  headers: HeaderProps[];
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
            class={`truncate border-b-[1px] border-zinc-300 p-2 font-bold ${header.classes}`}
          >
            {header.title}
          </div>
        )}
      </For>
    </>
  );
}
