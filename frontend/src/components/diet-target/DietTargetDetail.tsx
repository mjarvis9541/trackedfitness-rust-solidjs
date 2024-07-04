export default function DietTargetDetail(props: any) {
  return (
    <table class="w-full border-collapse">
      <tbody>
        <tr>
          <th class="w-1/2 border p-2 text-left">Date</th>
          <td class="w-1/2 border p-2 text-right">{props.data.date}</td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Weight</th>
          <td class="border p-2 text-right">
            {Number(props.data.latest_weight).toFixed(2)} kg
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Calories</th>
          <td class="border p-2 text-right">{props.data.energy} kcal</td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Protein</th>
          <td class="border p-2 text-right">
            <span class="mr-1"> {Number(props.data.protein).toFixed(1)} g</span>
            <span class="text-xs text-gray-400">
              ({Number(props.data.protein_pct).toFixed(2)}%)
            </span>
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Carbohydrate</th>
          <td class="border p-2 text-right">
            <span class="mr-1">
              {" "}
              {Number(props.data.carbohydrate).toFixed(1)} g
            </span>
            <span class="text-xs text-gray-400">
              ({Number(props.data.carbohydrate_pct).toFixed(2)}%)
            </span>
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Fat</th>
          <td class="border p-2 text-right">
            <span class="mr-1">{Number(props.data.fat).toFixed(1)} g</span>
            <span class="text-xs text-gray-400">
              ({Number(props.data.fat_pct).toFixed(2)}%)
            </span>
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Saturates</th>
          <td class="border p-2 text-right">
            {Number(props.data.saturates).toFixed(1)} g
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Sugars</th>
          <td class="border p-2 text-right">
            {Number(props.data.sugars).toFixed(1)} g
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Fibre</th>
          <td class="border p-2 text-right">
            {Number(props.data.fibre).toFixed(1)} g
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Salt</th>
          <td class="border p-2 text-right">
            {Number(props.data.salt).toFixed(2)} g
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Calories per kg</th>
          <td class="border p-2 text-right">
            <span>{Number(props.data.energy_per_kg).toFixed(0)} kcal</span>
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Protein per kg</th>
          <td class="border p-2 text-right">
            {Number(props.data.protein_per_kg).toFixed(2)} g
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Carbohydrate per kg</th>
          <td class="border p-2 text-right">
            {Number(props.data.carbohydrate_per_kg).toFixed(2)} g
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Fat per kg</th>
          <td class="border p-2 text-right">
            {Number(props.data.fat_per_kg).toFixed(2)} g
          </td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Created</th>
          <td class="border p-2 text-right">{props.data.created_at}</td>
        </tr>
        <tr>
          <th class="border p-2 text-left">Updated</th>
          <td class="border p-2 text-right">{props.data.updated_at}</td>
        </tr>
      </tbody>
    </table>
  );
}
