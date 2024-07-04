import { For, Show } from "solid-js";

type APIFilterProps = {
  name: string;
  label?: string;
  defaultOption?: string;
  defaultValue?: string;
  options: any[];
  searchParams: any;
  setSearchParams: any;
};

export default function APIFilter(props: APIFilterProps) {
  return (
    <div class="w-full">
      <Show when={props.label}>
        {<label class="mb-1 block text-sm font-bold">{props.label}</label>}
      </Show>
      <select
        name={props.name}
        onInput={(e) =>
          props.setSearchParams({ [props.name]: e.currentTarget.value })
        }
        class="flex w-full items-stretch rounded border border-zinc-700 bg-zinc-700 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500"
      >
        <Show when={props.defaultOption}>
          <option value={props.defaultValue}>{props.defaultOption}</option>
        </Show>
        <For each={props.options}>
          {(option) => (
            <option
              value={option.id}
              selected={props.searchParams[props.name] == option.id}
            >
              {option.name}
            </option>
          )}
        </For>
      </select>
    </div>
  );
}
