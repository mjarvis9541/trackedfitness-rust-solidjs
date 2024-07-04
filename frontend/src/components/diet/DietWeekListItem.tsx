import { format } from "date-fns";
import { A } from "solid-start";
import { now } from "~/utils/datetime";

type DietWeekListItemProps = {
  username: string;
  data: any;
};

export default function DietWeekListItem(props: DietWeekListItemProps) {
  return (
    <div class="group contents">
      <div
        class="grid place-content-center p-1.5 group-hover:bg-amber-300"
        classList={{
          ["bg-amber-300"]: now() === props.data.date,
        }}
      >
        <input type="checkbox" />
      </div>
      <div
        class="p-2 group-hover:bg-amber-300"
        classList={{
          ["bg-amber-300"]: now() === props.data.date,
        }}
      >
        <A
          href={`/users/${props.username}/${props.data?.date}`}
          class="text-blue-500"
        >
          {format(new Date(props.data?.date), "dd/MM/yyyy")}
        </A>
      </div>
      <div
        class="p-2 group-hover:bg-amber-300"
        classList={{
          ["bg-amber-300"]: now() === props.data.date,
        }}
      >
        <A href={`/users/${props.username}/${props.data?.date}`} class="">
          {format(new Date(props.data?.date), "eeee")}
        </A>
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.energy || 0).toFixed(0)}kcal
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.protein || 0).toFixed(0)}g
        <span class="ml-1 text-end text-xs text-gray-400">
          ({Number(props.data?.protein_pct || 0).toFixed(0)}%)
        </span>
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.carbohydrate || 0).toFixed(0)}g
        <span class="ml-1 text-end text-xs text-gray-400">
          ({Number(props.data?.carbohydrate_pct || 0).toFixed(0)}%)
        </span>
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.fat || 0).toFixed(0)}g
        <span class="ml-1 text-end text-xs text-gray-400">
          ({Number(props.data?.fat_pct || 0).toFixed(0)}%)
        </span>
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.saturates || 0).toFixed(0)}g
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.sugars || 0).toFixed(0)}g
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.fibre || 0).toFixed(0)}g
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.salt || 0).toFixed(2)}g
      </div>

      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.energy_per_kg || 0).toFixed(0)}kcal
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.protein_per_kg || 0).toFixed(2)}g
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.carbohydrate_per_kg || 0).toFixed(2)}g
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.fat_per_kg || 0).toFixed(2)}g
      </div>
      <div class="p-2 text-end group-hover:bg-amber-300">
        {Number(props.data?.latest_weight || 0).toFixed(2)}kg
      </div>
    </div>
  );
}
