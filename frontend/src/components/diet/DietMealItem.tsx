import { A } from "solid-start";
import MacroTitles from "../food/MacroTitles";

type DietMealItemProps = {
  data: any;
  handleCheck: any;
  isChecked: any;
};

export default function DietMealItem(props: DietMealItemProps) {
  return (
    <div class="group contents">
      <div class="hidden p-2 group-hover:bg-amber-300 md:block">
        <input
          type="checkbox"
          name="checkbox"
          value={props.data.id}
          checked={props.isChecked().includes(props.data.id)}
          oninput={props.handleCheck}
        />
      </div>
      <div class="col-span-3 truncate p-2 group-hover:bg-amber-300 md:col-span-1">
        <A
          class="hover:underline"
          href={`/users/${props.data.username}/${props.data.date}/diet/${props.data.meal_slug}/${props.data.id}`}
        >
          {props.data.name}, {props.data.brand_name}
        </A>
      </div>
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        <A
          class="hover:underline"
          href={`/users/${props.data.username}/${props.data.date}/diet/${props.data.meal_slug}/${props.data.id}/edit`}
        >
          {props.data.data_value}
          {props.data.data_measurement}
        </A>
      </div>
      <MacroTitles />
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        {Number(props.data.energy).toFixed(0)}kcal
      </div>
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        {Number(props.data.protein).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        {Number(props.data.carbohydrate).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        {Number(props.data.fat).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        {Number(props.data.saturates).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        {Number(props.data.sugars).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        {Number(props.data.fibre).toFixed(1)}
      </div>
      <div class="flex items-center justify-end p-2 group-hover:bg-amber-300">
        {Number(props.data.salt).toFixed(2)}
      </div>
    </div>
  );
}
