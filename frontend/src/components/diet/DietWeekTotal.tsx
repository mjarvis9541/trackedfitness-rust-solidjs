type DietWeekTotalProps = {
  title: string;
  data: any;
};

export default function DietWeekTotal(props: DietWeekTotalProps) {
  return (
    <div class="group contents">
      <div class="col-span-3 bg-zinc-900 p-2 font-bold">{props.title}</div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.energy || 0).toFixed(0)}kcal
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.protein || 0).toFixed(0)}g
        <span class="ml-1 text-end text-xs text-gray-400">
          ({Number(props.data?.protein_pct || 0).toFixed(0)}%)
        </span>
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.carbohydrate || 0).toFixed(0)}g
        <span class="ml-1 text-end text-xs text-gray-400">
          ({Number(props.data?.carbohydrate_pct || 0).toFixed(0)}%)
        </span>
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.fat || 0).toFixed(0)}g
        <span class="ml-1 text-end text-xs text-gray-400">
          ({Number(props.data?.fat_pct || 0).toFixed(0)}%)
        </span>
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.saturates || 0).toFixed(0)}g
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.sugars || 0).toFixed(0)}g
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.fibre || 0).toFixed(0)}g
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.salt || 0).toFixed(2)}g
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.energy_per_kg || 0).toFixed(0)}kcal
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.protein_per_kg || 0).toFixed(2)}g
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.carbohydrate_per_kg || 0).toFixed(2)}g
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.fat_per_kg || 0).toFixed(2)}g
      </div>
      <div class="bg-zinc-900 p-2 text-end font-semibold">
        {Number(props.data?.latest_weight || 0).toFixed(2)}kg
      </div>
    </div>
  );
}
