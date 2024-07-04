type SetCountProps = {
  label?: string;
  count?: number;
};

export default function SetCount(props: SetCountProps) {
  return (
    <div class="rounded bg-zinc-700 px-2 py-1 text-sm font-semibold text-zinc-200">
      {props.count || 0} {props.label || "sets"}
    </div>
  );
}
