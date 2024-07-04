type SetInputProps = {
  label: string;
  name?: string;
  value: string | number;
  classes?: string;
};

export default function SetInput(props: SetInputProps) {
  return (
    <>
      <div class="relative flex-1">
        <div class="absolute right-0 top-1/2 mr-3 -translate-y-1/2 select-none text-sm text-zinc-500">
          {props.label}
        </div>
        <input
          prop:value={props.value}
          name={props.name}
          type="text"
          placeholder="0"
          class={`w-full rounded px-3 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:border-blue-500 active:ring-2 active:ring-blue-500 ${
            props.classes || "border-zinc-800 bg-zinc-800"
          }`}
        />
      </div>
    </>
  );
}
