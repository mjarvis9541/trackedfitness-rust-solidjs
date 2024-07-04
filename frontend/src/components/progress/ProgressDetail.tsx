type ProgressDetailProps = {
  data: any;
};

export default function ProgressDetail(props: ProgressDetailProps) {
  return (
    <table class="mb-4 w-full border-collapse">
      <tbody>
        <tr>
          <th class="w-1/2 border p-2 text-left">Date</th>
          <td class="w-1/2 border p-2 text-right">{props.data.date}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Weight</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.weight_kg || "-"}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Energy Burnt (kcal)</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.energy_burnt} kcal
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Notes</th>
          <td class="w-1/2 border p-2 text-right">{props.data.notes || "-"}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Created</th>
          <td class="w-1/2 border p-2 text-right">{props.data.created_at}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Updated</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.updated_at || "-"}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
