import { format } from "date-fns";

type ProfileDetailProps = {
  data: any;
};

export default function ProfileDetail(props: ProfileDetailProps) {
  return (
    <table class="w-full border-collapse">
      <tbody>
        <tr>
          <th class="w-1/2 border p-2 text-left">Activity Level</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.activity_level}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Fitness Goal</th>
          <td class="w-1/2 border p-2 text-right">{props.data.fitness_goal}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Sex</th>
          <td class="w-1/2 border p-2 text-right">{props.data.sex}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Height</th>
          <td class="w-1/2 border p-2 text-right">{props.data.height} cm</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Weight</th>
          <td class="w-1/2 border p-2 text-right">
            <span class="mr-1">
              {Number(props.data.latest_weight).toFixed(2)} kg
            </span>
            <span class="text-xs text-gray-400">
              ({format(new Date(props.data.latest_weight_date), "P")})
            </span>
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Date of Birth</th>
          <td class="w-1/2 border p-2 text-right">
            {format(new Date(props.data.date_of_birth), "P")}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Age</th>
          <td class="w-1/2 border p-2 text-right">{props.data.age}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Body Mass Index (BMI)</th>
          <td class="w-1/2 border p-2 text-right">
            {Number(props.data.bmi).toFixed(2)}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Basal Metabolic Rate (BMR)</th>
          <td class="w-1/2 border p-2 text-right">
            {Number(props.data.bmr).toFixed(0)} kcal
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">
            Total Daily Energy Expenditure (TDEE)
          </th>
          <td class="w-1/2 border p-2 text-right">
            {Number(props.data.tdee).toFixed(0)} kcal
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Target Calories</th>
          <td class="w-1/2 border p-2 text-right">
            {Number(props.data.target_calories).toFixed(0)} kcal
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Created</th>
          <td class="w-1/2 border p-2 text-right">
            {format(new Date(props.data.created_at), "eee dd MMM, p")}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Updated</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.updated_at
              ? format(new Date(props.data.updated_at), "eee dd MMM, p")
              : "-"}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
