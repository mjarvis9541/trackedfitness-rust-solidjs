import { MoreHorizontalIcon } from "../ui/Icon";

export type FoodHeaderProps = {};

function FoodWrapper(props: any) {
  return (
    <div class="mb-2">
      <div>
        <FoodHeader {...props.data} />
      </div>
    </div>
  );
}

function FoodHeader(props: any) {
  return (
    <div class="bg-zinc-800 p-2">
      <div class="flex justify-between">
        <div>
          <div class="flex items-start gap-4">
            <h3 class="font-semibold">{props.name}</h3>
            <FoodDataValue {...props} />
          </div>
          <div class="pb-2 text-sm text-gray-500 hover:underline">
            {props.brand_name}
          </div>
        </div>
        <div>
          <button class="p-1 hover:bg-zinc-600">
            <MoreHorizontalIcon />
          </button>
        </div>
      </div>
      <div class="flex gap-1">
        <FoodNutritionItem value={props.energy} label="Calories" />
        <FoodNutritionItem value={props.protein} label="Protein" />
        <FoodNutritionItem value={props.carbohydrate} label="Carbs" />
        <FoodNutritionItem value={props.fat} label="Fat" />
      </div>
    </div>
  );
}

function FoodDataValue(props: any) {
  return (
    <div class="bg-zinc-900 px-2 py-1 text-sm font-bold">
      {props.data_value}
      {props.data_measurement}
    </div>
  );
}

function FoodNutritionItem(props: any) {
  return (
    <div class="flex-1 rounded bg-zinc-700 p-1 px-2 text-end">
      <div class="">{Number(props.value).toFixed(0)}</div>
      <div class="text-xs text-zinc-500">{props.label}</div>
    </div>
  );
}
