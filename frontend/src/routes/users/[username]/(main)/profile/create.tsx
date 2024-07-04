import { Title, useParams } from "solid-start";
import {
  ServerFunctionEvent,
  createServerAction$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import FormSelect from "~/components/ui/FormSelect";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import { postRequest } from "~/services/api";
import {
  activityLevelOptions,
  goalOptions,
  sexOptions,
} from "~/utils/constants";

async function userProfileCreate(form: FormData, event: ServerFunctionEvent) {
  const username = form.get("username");
  const height = form.get("height");
  const weight = form.get("weight");
  const sex = form.get("sex");
  const date_of_birth = form.get("date_of_birth");
  const fitness_goal = form.get("fitness_goal");
  const activity_level = form.get("activity_level");
  const data = await postRequest(event.request, "profiles", {
    username,
    height,
    weight,
    sex,
    date_of_birth,
    fitness_goal,
    activity_level,
  });
  return redirect(`/users/${username}`);
}

export default function ProfileCreatePage() {
  const params = useParams();
  const [action, { Form }] = createServerAction$(userProfileCreate);
  return (
    <main class="p-4">
      <Title>Profile Create</Title>

      <div class="mx-auto max-w-xl">
        <h1 class="mb-4 text-xl font-bold">Profile Create</h1>
        <Form>
          <HiddenInput name="username" value={params.username} />
          <Input name="height" />
          <Input name="weight" />
          <FormSelect name="sex" options={sexOptions} />
          <Input name="date_of_birth" type="date" />
          <FormSelect
            name="fitness_goal"
            label="Fitness Goal"
            options={goalOptions}
          />
          <FormSelect
            name="activity_level"
            label="Activity Level"
            options={activityLevelOptions}
          />
          <Button label="Create Profile" loading={action.pending} />
        </Form>
      </div>
    </main>
  );
}
