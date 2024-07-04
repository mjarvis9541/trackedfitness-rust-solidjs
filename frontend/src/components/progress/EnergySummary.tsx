import { Show } from "solid-js";

type EnergySummaryProps = {
  data: {
    energy_burnt: string;
    week_avg_energy_burnt: string;
    month_avg_energy_burnt: string;
  };
};

export default function EnergySummary(props: EnergySummaryProps) {
  return (
    <Show when={props.data}>
      <div class="flex items-center bg-zinc-800 p-2">
        <EnergySummaryItem
          value={props.data.energy_burnt}
          label="Energy Burnt"
        />
        <EnergySummaryItem value={0} label="Latest" />
        <EnergySummaryItem
          value={props.data.week_avg_energy_burnt}
          label="Week Avg"
        />
        <EnergySummaryItem
          value={props.data.month_avg_energy_burnt}
          label="Month Avg"
        />
      </div>
    </Show>
  );
}

type EnergySummaryItemProps = {
  value: string | number;
  label: string;
  metric?: string;
};

function EnergySummaryItem(props: EnergySummaryItemProps) {
  return (
    <div class="flex-1 select-none rounded bg-zinc-800 px-2 py-1 text-end hover:bg-amber-300">
      <div class="text-end">
        <Show when={props.value} fallback={"-"}>
          {Number(props.value).toFixed(0)}
          {props.metric || "kcal"}
        </Show>
      </div>
      <div class="text-end text-sm text-zinc-400">{props.label}</div>
    </div>
  );
}
