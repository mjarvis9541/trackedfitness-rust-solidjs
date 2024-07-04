export type DietDayTotalProps = {
  title?: string;
  data: any;
};

export default function DietDayTotal(props: DietDayTotalProps) {
  const kcalPlaces = 0;
  const macroPlaces = 1;
  const saltPlaces = 2;
  return (
    <div class="contents">
      <div class="col-span-4 bg-zinc-800 p-2 font-bold md:col-span-3">
        {props?.title || "Total"}
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
