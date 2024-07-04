import { stripUnderscoreTitleCase } from "~/utils/text";

type ActionProps = {
  pending: boolean;
  input?: FormData | undefined;
  result?:
    | Response
    | {
        errors: any;
      }
    | undefined;
  error?: any;
  clear: () => void;
  retry: () => void;
};

type InputProps = {
  label?: string;
  name: string;
  type?: string;
  value?: any;
  required?: boolean;
  step?: number;
  placeholder?: string;
  checked?: boolean;
  minLength?: number;
  maxLength?: number;
  action?: ActionProps;
};

export default function Input(props: InputProps) {
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
            ${`border-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}`}
        />
        {/* <Show when={props?.action?.error[props?.name]}>
          <span class="mt-1 block text-sm font-bold text-red-500">
            {props?.action?.error[props?.name]}
          </span>
        </Show> */}
      </label>
    </div>
  );
}
