import { Show } from "solid-js";
import { A, useParams } from "solid-start";
import { now } from "~/utils/datetime";

type ProgressSummaryProps = { data: any };

export default function ProgressSummary(props: ProgressSummaryProps) {
  const params = useParams<{ username: string; date?: string }>();
  const getDate = () => params.date || now();
  return (
    <Show when={props.data}>
      <div class="flex items-center bg-zinc-800 p-2">
        <WeightSummaryItem
          value={props.data.weight ? props.data.weight : "Add"}
          href={
            props.data.weight
              ? `/users/${params.username}/progress/${props.data.date}`
              : `/users/${params.username}/progress/create?date=${getDate()}`
          }
          classes={props.data.latest_weight && `text-blue-500`}
          label="Weight"
          metric="kg"
        />
        <WeightSummaryItem
          value={props.data.latest_weight}
          href={
            props.data.latest_weight
              ? `/users/${params.username}/progress/${props.data.latest_weight_date}`
              : `/users/${params.username}/progress/create?date=${getDate()}`
          }
          classes={props.data.latest_weight && `text-blue-500`}
          label="Latest"
          metric="kg"
        />
        <WeightSummaryItem
          value={props.data.week_avg_weight}
          label="Week Avg"
          metric="kg"
        />
        <WeightSummaryItem
          value={props.data.month_avg_weight}
          label="Month Avg"
          metric="kg"
        />
      </div>
    </Show>
  );
}

type WeightSummaryItemProps = {
  classes?: string;
  value: string | number;
  label: string;
  metric?: string;
  href?: string;
};

function WeightSummaryItem(props: WeightSummaryItemProps) {
  return (
    <A
      class={`flex-1 select-none rounded bg-zinc-800 px-3 py-1 text-end hover:bg-amber-300 ${props.classes}`}
      href={props.href || "#"}
    >
      <div class="text-end">
        <Show when={props.value} fallback={"-"}>
          {Number(props.value).toFixed(2)}
          {props.metric || ""}
        </Show>
      </div>
      <div class="text-end text-sm text-zinc-400">{props.label}</div>
    </A>
  );
}
