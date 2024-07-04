import { format } from "date-fns";
import { Show } from "solid-js";

type UserProfileProps = {
  data: any;
};
export default function UserProfile(props: UserProfileProps) {
  return (
    <div class="bg-zinc-800 p-4">
      <h2 class="mb-2 font-bold">Profile</h2>
      <table class="w-full text-zinc-300">
        <tbody>
          <tr>
            <td class="py-1 text-start">Activity</td>
            <td class="py-1 text-end">{props.data.activity_level}</td>
          </tr>
          <tr>
            <td class="py-1 text-start">Goal</td>
            <td class="py-1 text-end">{props.data.fitness_goal}</td>
          </tr>
          <tr>
            <td class="py-1 text-start">Height</td>
            <td class="py-1 text-end">{props.data.height}cm</td>
          </tr>
          <tr>
            <td class="py-1 text-start">Weight</td>
            <td class="py-1 text-end">
              <Show when={props.data.latest_weight} fallback={<span>-</span>}>
                <span class="mr-1">{Number(props.data.latest_weight)}kg</span>
                <span class="text-xs text-gray-400">
                  ({format(new Date(props.data.latest_weight_date), "P")})
                </span>
              </Show>
            </td>
          </tr>
          <tr>
            <td class="py-1 text-start">BMI</td>
            <td class="py-1 text-end">{Number(props.data.bmi).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="py-1 text-start">BMR</td>
            <td class="py-1 text-end">
              {Number(props.data.bmr).toFixed(0)} kcal
            </td>
          </tr>
          <tr>
            <td class="py-1 text-start">TDEE</td>
            <td class="py-1 text-end">
              {Number(props.data.tdee).toFixed(0)} kcal
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
