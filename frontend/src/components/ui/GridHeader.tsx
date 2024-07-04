import { For } from "solid-js";
import { classNames } from "~/utils/text";

type GridHeaderProps = {
  headers: { class: string; title: string }[];
};

export default function GridHeader(props: GridHeaderProps) {
  return (
    <For each={props.headers}>
      {(header) => (
        <div class={classNames("border-b-[1px] p-2 font-bold", header.class)}>
          {header.title}
        </div>
      )}
    </For>
  );
}
