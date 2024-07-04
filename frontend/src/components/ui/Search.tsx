import { Show } from "solid-js";
import { SearchIcon } from "./Icon";

type SearchProps = {
  label?: string;
  name: string;
  placeholder?: string;
  searchParams: any;
  setSearchParams: any;
};

export default function Search(props: SearchProps) {
  return (
    <div class="w-full">
      <Show when={props.label}>
        {<label class="mb-1 block text-sm font-bold">{props.label}</label>}
      </Show>
      <div class="relative flex items-center justify-start">
        <div class="absolute grid place-items-center pl-2.5">
          <SearchIcon />
        </div>
        <input
          type="text"
          class="w-full rounded border-[1px] border-zinc-700 bg-zinc-700 px-3 py-1.5 pl-10 outline-none placeholder:text-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          placeholder={props.placeholder || "Search"}
          value={props.searchParams[props.name] || ""}
          onInput={(e) =>
            props.setSearchParams({ [props.name]: e.currentTarget.value })
          }
        />
      </div>
    </div>
  );
}
