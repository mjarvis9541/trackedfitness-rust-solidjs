import { For } from "solid-js";
import { stripUnderscoreTitleCase } from "~/utils/text";

type SelectProps = {
  label?: string;
  name: string;
  options: any[];
  value?: any;
};

export default function Select(props: SelectProps) {
  return (
    <label class="mb-4 block">
      <span
        class={`mb-1 block text-sm font-bold ${!props.label && `capitalize`}`}
      >
        {props.label || stripUnderscoreTitleCase(props.name)}
      </span>
      <select
        name={props.name}
        class="block h-[42px] w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500"
      >
        <For each={props.options}>
          {(option) => (
            <option
              value={option.id}
              // @ts-ignore
              prop:selected={option.id === props.value}
            >
              {option.name}
            </option>
          )}
        </For>
      </select>
    </label>
  );
}
