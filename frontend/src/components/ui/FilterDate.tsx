import { Show } from "solid-js";
import { now } from "~/utils/datetime";

type FilterDateProps = {
  name: string;
  label?: string;
  defaultOption?: string;
  defaultValue?: string;
  searchParams: any;
  setSearchParams: any;
};

export default function FilterDate(props: FilterDateProps) {
  return (
    <div class="w-full">
      <Show when={props.label}>
        {<label class="mb-1 block text-sm font-bold">{props.label}</label>}
      </Show>
      <input
        name={props.name}
        type="date"
        class="block w-full rounded border border-zinc-700 bg-zinc-700 px-3 py-1.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500"
        value={props.searchParams[props.name] || now()}
        onInput={(e) =>
          props.setSearchParams({ [props.name]: e.currentTarget.value })
        }
      />
    </div>
  );
}
