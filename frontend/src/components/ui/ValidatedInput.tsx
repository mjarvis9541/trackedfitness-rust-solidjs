import { Show } from "solid-js";
import { stripUnderscoreTitleCase } from "~/utils/text";

export default function ValidatedInput(props: any) {
  return (
    <div class="mb-4">
      <label>
        <span
          class={`mb-1 block text-sm font-bold ${!props.label && `capitalize`}`}
        >
          {props.label || stripUnderscoreTitleCase(props.name)}
        </span>
        <input
          name={props.name}
          step={props.step}
          type={props.type}
          autocomplete="off"
          required={props.required || false}
          checked={props.checked}
          // @ts-ignore
          prop:value={props.value || ""}
          placeholder={props.placeholder}
          maxLength={props.maxLength}
          minLength={props.minLength}
          class={`block w-full rounded border bg-zinc-800 px-3 py-2 outline-none 
              ${
                props.error && props.error[props.name]
                  ? `border-red-500 ring-2 ring-red-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500`
                  : `border-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500`
              }`}
        />
        <Show when={props.error && props.error[props.name]}>
          <span class="mt-1 block text-sm font-bold text-red-500">
            {props.error[props.name]}
          </span>
        </Show>
      </label>
    </div>
  );
}
