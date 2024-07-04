import LoadingSpinner from "./LoadingSpinner";

type ButtonProps = {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button(props: ButtonProps) {
  return (
    <div class="flex">
      <button
        class="block w-full rounded border-blue-600 bg-blue-600 px-3 py-2 outline-none hover:bg-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
        disabled={props.disabled || props.loading}
      >
        {props.loading ? <LoadingSpinner /> : props.label || "Submit"}
      </button>
    </div>
  );
}

export function DeleteButton(props: ButtonProps) {
  return (
    <div class="flex">
      <button
        class="block w-full rounded border border-red-500 bg-red-500 px-3 py-2 outline-none hover:bg-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:hover:bg-red-500"
        disabled={props.disabled || props.loading}
      >
        {props.loading ? <LoadingSpinner /> : props.label || "Delete"}
      </button>
    </div>
  );
}

export function WorkoutButton(props: ButtonProps) {
  return (
    <div class="flex">
      <button
        class="block w-full rounded border-blue-700 bg-blue-700 px-3 py-1.5 text-sm font-semibold hover:bg-blue-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:bg-blue-700"
        disabled={props.disabled || props.loading}
      >
        {props.loading ? <LoadingSpinner /> : props.label || "Submit"}
      </button>
    </div>
  );
}
