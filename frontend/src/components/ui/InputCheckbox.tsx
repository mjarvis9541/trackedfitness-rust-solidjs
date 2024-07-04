import { stripUnderscoreTitleCase } from "~/utils/text";

export default function InputCheckbox(props: any) {
  return (
    <div class="mb-4">
      <label class="flex items-center rounded border border-zinc-700 px-4 py-2 hover:cursor-pointer hover:bg-zinc-700">
        <div class="flex-1">
          <span class="text-sm font-bold">
            {props.label || stripUnderscoreTitleCase(props.name)}
          </span>
        </div>
        <div class="flex flex-1 justify-end">
          <input
            class="h-4 w-4"
            name={props.name}
            type="checkbox"
            // @ts-ignore
            prop:checked={props.checked}
            value={1}
          />
        </div>
      </label>
    </div>
  );
}
