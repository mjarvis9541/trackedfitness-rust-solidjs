export default function FoodDetail(props: any) {
  return (
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th class="w-1/2 border p-2 text-left">Typical Values</th>
          <th class="w-1/2 border p-2 text-right">
            Per {props.data.data_value} {props.data.data_measurement}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th class="border p-2 text-left">Energy (kcal)</th>
          <td class="border p-2 text-right">
            {Number(props.data.energy).toFixed(0)} kcal
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Protein</th>
          <td class="border p-2 text-right">
            {Number(props.data.protein).toFixed(1)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Carbohydrate</th>
          <td class="border p-2 text-right">
            {Number(props.data.carbohydrate).toFixed(1)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Fat</th>
          <td class="border p-2 text-right">
            {Number(props.data.fat).toFixed(1)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Saturates</th>
          <td class="border p-2 text-right">
            {Number(props.data.saturates).toFixed(1)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Sugars</th>
          <td class="border p-2 text-right">
            {Number(props.data.sugars).toFixed(1)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Fibre</th>
          <td class="border p-2 text-right">
            {Number(props.data.fibre).toFixed(1)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Salt</th>
          <td class="border p-2 text-right">
            {Number(props.data.salt).toFixed(2)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Protein %</th>
          <td class="border p-2 text-right">
            {Number(props.data.protein_pct).toFixed(2)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Carbohydrate %</th>
          <td class="border p-2 text-right">
            {Number(props.data.carbohydrate_pct).toFixed(2)}
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Fat %</th>
          <td class="border p-2 text-right">
            {Number(props.data.fat_pct).toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
