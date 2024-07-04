type MealTotalProps = {
  title?: string;
  data: any;
};

export default function MealTotal(props: MealTotalProps) {
  const kcalPlaces = 0;
  const macroPlaces = 1;
  const saltPlaces = 2;
  return (
    <div class="contents">
      <div class="col-span-4 bg-zinc-900 p-2 font-bold">{props.title}</div>
      <div class="flex items-center justify-end bg-zinc-900 p-2 font-semibold">
        {Number(props.data.energy).toFixed(kcalPlaces)}kcal
      </div>
      <div class="flex items-center justify-end bg-zinc-900 p-2 font-semibold">
        {Number(props.data.protein).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-900 p-2 font-semibold">
        {Number(props.data.carbohydrate).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-900 p-2 font-semibold">
        {Number(props.data.fat).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-900 p-2 font-semibold">
        {Number(props.data.saturates).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-900 p-2 font-semibold">
        {Number(props.data.sugars).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-900 p-2 font-semibold">
        {Number(props.data.fibre).toFixed(macroPlaces)}
      </div>
      <div class="flex items-center justify-end bg-zinc-900 p-2 font-semibold">
        {Number(props.data.salt).toFixed(saltPlaces)}
      </div>
    </div>
  );
}
