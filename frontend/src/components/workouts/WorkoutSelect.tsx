import { For } from "solid-js";

type WorkoutSelectProps = {
  label?: string;
  name: string;
  options: any[];
  value?: any;
};

export default function WorkoutSelect(props: WorkoutSelectProps) {
  return (
    <div class="flex flex-1">
      <select
        name={props.name}
        class="w-full rounded border-zinc-800 bg-zinc-800 px-3 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500"
      >
        <For each={props.options}>
          {(option) => (
            <option
              value={option.id || option.value}
              prop:selected={props.value === option.id}
            >
              {option.name}
            </option>
          )}
        </For>
      </select>
    </div>
  );
}
