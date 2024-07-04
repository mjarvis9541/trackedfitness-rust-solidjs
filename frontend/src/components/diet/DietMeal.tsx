import { For, Show } from "solid-js";
import DietMealItem from "./DietMealItem";
import DietMealTotal from "./DietMealTotal";

type DietMealProps = {
  username: any;
  date: any;
  data: any;
  isChecked: any;
  handleCheck: any;
  setIsChecked: any;
};

export default function DietMeal(props: DietMealProps) {
  const headers = [
    { classes: "", title: "Quantity" },
    { classes: "", title: "Calories" },
    { classes: "", title: "Protein" },
    { classes: "", title: "Carbs" },
    { classes: "", title: "Fat" },
    { classes: "", title: "Saturates" },
    { classes: "", title: "Sugars" },
    { classes: "", title: "Fibre" },
    { classes: "", title: "Salt" },
  ];
  return (
    <>
      <div class="hidden bg-zinc-800 p-2 md:block">
        <input
          type="checkbox"
          name="meal_of_day_id"
          id={props.data.id}
          disabled={props.data.food.length === 0}
          checked={
            props.data.food.length > 0 &&
            props.data.food.every((obj: any) =>
              props.isChecked().includes(obj.id),
            )
          }
          oninput={(e) => {
            let checked = e.target.checked;
            let idList = props.data.food.map((obj: any) => obj.id);
            if (checked) {
              props.setIsChecked([...props.isChecked(), ...idList]);
            } else {
              props.setIsChecked((prev: any) =>
                prev.filter((id: string) => !idList.includes(id)),
              );
            }
          }}
        />
      </div>
      <div class="col-span-4 bg-zinc-800 p-2 font-bold md:col-span-1">
        {props.data.name}
      </div>
      <Show
        when={props.data.ordering == 1}
        fallback={<div class="col-span-9" />}
      >
        <For each={headers}>
          {(header) => (
            <div class="hidden items-center justify-end p-2 text-sm font-bold text-gray-400 md:flex">
              {header.title}
            </div>
          )}
        </For>
      </Show>
      <For each={props.data.food}>
        {(food) => (
          <DietMealItem
            data={food}
            handleCheck={props.handleCheck}
            isChecked={props.isChecked}
          />
        )}
      </For>
      <DietMealTotal
        data={props.data}
        username={props.username}
        date={props.date}
      />
    </>
  );
}
