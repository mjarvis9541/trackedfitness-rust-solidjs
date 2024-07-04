import { A } from "solid-start";

type DietMealTotalProps = {
  date: any;
  username: string;
  data: any;
};

export default function DietMealTotal(props: DietMealTotalProps) {
  return (
    <>
      <ul class="col-span-4 flex items-center justify-start gap-2 bg-zinc-700 px-2 md:col-span-3">
        <li>
          <A
            href={`/users/${props.username}/${props.date}/diet/${props.data.slug}/add-food`}
            class="text-blue-500 hover:underline"
          >
            Add Food
          </A>
        </li>
        <li>
          <A
            href={`/users/${props.username}/${props.date}/diet/${props.data.slug}/add-meal`}
            class="text-blue-500 hover:underline"
          >
            Add Meal
          </A>
        </li>
        <li>
          <A
            href={`/users/${props.username}/${props.date}/diet/${props.data.slug}/copy-meal`}
            class="text-blue-500 hover:underline"
          >
            Copy Meal
          </A>
        </li>
      </ul>
      <div class="flex items-center justify-end bg-zinc-700 p-2 font-bold">
        {Number(props.data.energy).toFixed(0)}kcal
      </div>
      <div class="flex items-center justify-end bg-zinc-700 p-2 font-bold">
        {Number(props.data.protein).toFixed(1)}
      </div>
      <div class="flex items-center justify-end bg-zinc-700 p-2 font-bold">
        {Number(props.data.carbohydrate).toFixed(1)}
      </div>
      <div class="flex items-center justify-end bg-zinc-700 p-2 font-bold">
        {Number(props.data.fat).toFixed(1)}
      </div>
      <div class="flex items-center justify-end bg-zinc-700 p-2 font-bold">
        {Number(props.data.saturates).toFixed(1)}
      </div>
      <div class="flex items-center justify-end bg-zinc-700 p-2 font-bold">
        {Number(props.data.sugars).toFixed(1)}
      </div>
      <div class="flex items-center justify-end bg-zinc-700 p-2 font-bold">
        {Number(props.data.fibre).toFixed(1)}
      </div>
      <div class="flex items-center justify-end bg-zinc-700 p-2 font-bold">
        {Number(props.data.salt).toFixed(2)}
      </div>
      <div class="col-span-full p-2"></div>
    </>
  );
}
