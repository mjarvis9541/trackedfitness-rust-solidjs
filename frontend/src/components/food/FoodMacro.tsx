export default function FoodMacro(props: any) {
  return (
    <>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.energy).toFixed(0)}kcal
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.protein).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.carbohydrate).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.fat).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.saturates).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.sugars).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.fibre).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {Number(props.data.salt).toFixed(2)}
      </div>
    </>
  );
}
