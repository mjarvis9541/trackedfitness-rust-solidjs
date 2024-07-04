import { A, useParams } from "solid-start";
import { now } from "~/utils/datetime";

type DietDayTargetProps = {
  data: any;
};

export default function DietDayTarget(props: DietDayTargetProps) {
  const params = useParams<{ username: string; date?: string }>();
  const kcalPlaces = 0;
  const macroPlaces = 1;
  const saltPlaces = 2;
  return (
    <div class="contents">
      <div class="col-span-4 bg-zinc-800 p-2 font-bold md:col-span-3">
        <div class="flex gap-8">
          <A
            href={`/users/${props.data.username}/diet-target/${props.data.date}`}
          >
            <span>Target</span>
            <span class="ml-2 text-sm text-gray-400">({props.data.date})</span>
          </A>
          <A
            href={`/users/${props.data.username}/diet-target/create?date=${
              params.date || now()
            }`}
          >
            <span class="font-normal text-blue-500 hover:underline">
              Add Target
            </span>
          </A>
        </div>
      </div>
      <div class="flex items-center justify-end bg-zinc-800 p-2 font-bold">
        {Number(props.data.energy).toFixed(kcalPlaces)}kcal
      </div>
      <div class="flex items-center justify-end bg-zinc-800 p-2 font-bold">
        {Number(props.data.protein).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-800 p-2 font-bold">
        {Number(props.data.carbohydrate).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-800 p-2 font-bold">
        {Number(props.data.fat).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-800 p-2 font-bold">
        {Number(props.data.saturates).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-800 p-2 font-bold">
        {Number(props.data.sugars).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-800 p-2 font-bold">
        {Number(props.data.fibre).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-800 p-2 font-bold">
        {Number(props.data.salt).toFixed(saltPlaces)}
      </div>
    </div>
  );
}
