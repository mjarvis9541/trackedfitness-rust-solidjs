import { Show } from "solid-js";
import { A } from "solid-start";

type WorkoutSummaryProps = {
  data: any;
};

export default function WorkoutSummary(props: WorkoutSummaryProps) {
  return (
    <Show when={props.data}>
      <div class="flex items-center bg-zinc-800 p-2">
        <WorkoutSummaryItem
          value={props.data.set_count}
          classes={props.data.set_count && `text-blue-500`}
          metric=" sets"
          label="-"
        />
        <WorkoutSummaryItem
          value={props.data.rep_count}
          classes={props.data.rep_count && `text-blue-500`}
          metric=" reps"
          label="Today"
        />
        <WorkoutSummaryItem
          value={props.data.week_set_count}
          metric=" sets"
          label={"-"}
        />
        <WorkoutSummaryItem
          value={props.data.week_rep_count}
          metric=" reps"
          label="Week"
        />
      </div>
    </Show>
  );
}

type WorkoutSummaryItemProps = {
  classes?: string;
  value: string | number;
  label: string;
  metric?: string;
  href?: string;
};

function WorkoutSummaryItem(props: WorkoutSummaryItemProps) {
  return (
    <A
      class={`flex-1 select-none rounded bg-zinc-800 px-3 py-1 text-end hover:bg-amber-300 ${props.classes}`}
      href={props.href || ""}
    >
      <div class="text-end">
        <Show when={props.value} fallback={"-"}>
          {Number(props.value).toFixed(0)}
          {props.metric || ""}
        </Show>
      </div>
      <div class="text-end text-sm text-zinc-400">{props.label}</div>
    </A>
  );
}
