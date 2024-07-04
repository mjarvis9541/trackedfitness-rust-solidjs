import { useParams } from "solid-start";
import { createServerAction$ } from "solid-start/server";

import { postRequest } from "~/services/api";
import { now } from "~/utils/datetime";
import { WorkoutButton } from "../ui/Button";
import HiddenInput from "../ui/HiddenInput";

export async function workoutCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const user_id = form.get("user_id");
  const date = form.get("date");
  const data = await postRequest(request, "workouts", {
    user_id,
    date,
  });
  return data;
}

export default function WorkoutCreateForm() {
  const params = useParams<{ username: string; date?: string }>();
  const [action, { Form }] = createServerAction$(workoutCreate);
  const getDate = () => params.date || now();

  return (
    <Form>
      <HiddenInput name="date" value={getDate()} />
      <HiddenInput name="username" value={params.username} />
      <WorkoutButton label="New Workout" loading={action.pending} />
    </Form>
  );
}
