type DietDayTargetStatsProps = {
  data: any;
};

export default function DietDayTargetStats(props: DietDayTargetStatsProps) {
  return (
    <div class="contents">
      <div class="col-span-4 bg-zinc-800 px-2 pb-2 text-sm font-semibold md:col-span-3"></div>
      <div class="flex items-center justify-end bg-zinc-800 px-2 pb-2 text-sm font-semibold text-gray-400">
        {Number(props.data.energy_per_kg).toFixed(0)}kcal
      </div>
      <div class="flex items-center justify-end bg-zinc-800 px-2 pb-2 text-sm font-semibold text-gray-400">
        {Number(props.data.protein_per_kg).toFixed(1)}g (
        {Number(props.data.protein_pct).toFixed(0)}%)
      </div>
      <div class="flex items-center justify-end bg-zinc-800 px-2 pb-2 text-sm font-semibold text-gray-400">
        {Number(props.data.carbohydrate_per_kg).toFixed(1)}g (
        {Number(props.data.carbohydrate_pct).toFixed(0)}%)
      </div>
      <div class="flex items-center justify-end bg-zinc-800 px-2 pb-2 text-sm font-semibold text-gray-400">
        {Number(props.data.fat_per_kg).toFixed(1)}g (
        {Number(props.data.fat_pct).toFixed(0)}
        %)
      </div>
      <div class="flex items-center justify-end bg-zinc-800 px-2 pb-2 text-sm font-semibold text-gray-400"></div>
      <div class="flex items-center justify-end bg-zinc-800 px-2 pb-2 text-sm font-semibold text-gray-400"></div>
      <div class="flex items-center justify-end bg-zinc-800 px-2 pb-2 text-sm font-semibold text-gray-400"></div>
      <div class="flex items-center justify-end bg-zinc-800 px-2 pb-2 text-sm font-semibold text-gray-400"></div>
    </div>
  );
}
