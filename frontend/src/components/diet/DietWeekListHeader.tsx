export type DietWeekListHeaderProps = {
  title: string;
  subtitle: string;
};

export default function DietWeekListHeader(props: DietWeekListHeaderProps) {
  const headers = [
    "Calories",
    "Protein",
    "Carbs",
    "Fat",
    "Sat. Fat",
    "Sugars",
    "Fibre",
    "Salt",
    "Cals/kg",
    "Pro/kg",
    "Carbs/kg",
    "Fat/kg",
    "Weight",
  ];
  return (
    <>
      <div class="grid place-content-center border-b-[1px] p-2">
        <input type="checkbox" name="" id="" />
      </div>
      <div class="border-b-[1px] p-2 font-bold">{props.title}</div>
      <div class="border-b-[1px] p-2 font-bold">{props.subtitle}</div>
      {headers.map((header) => (
        <div class="border-b-[1px] p-2 text-end font-bold">{header}</div>
      ))}
    </>
  );
}
