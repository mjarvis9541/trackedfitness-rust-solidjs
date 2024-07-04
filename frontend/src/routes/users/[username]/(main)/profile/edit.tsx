import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  ServerFunctionEvent,
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import FormSelect from "~/components/ui/FormSelect";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import { getRequest, putRequest } from "~/services/api";
import {
  activityLevelOptions,
  goalOptions,
  sexOptions,
} from "~/utils/constants";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`profiles/${params.username}`],
  });
}

async function userProfileUpdate(form: FormData, event: ServerFunctionEvent) {
  const id = form.get("id");
  const username = form.get("username");
  const height = form.get("height");
  const sex = form.get("sex");
  const date_of_birth = form.get("date_of_birth");
  const fitness_goal = form.get("fitness_goal");
  const activity_level = form.get("activity_level");
  const data = await putRequest(event.request, `profiles/${username}`, {
    username,
    height,
    sex,
    date_of_birth,
    fitness_goal,
    activity_level,
  });
  return redirect(`/users/${username}`);
}

export default function ProfileUpdatePage() {
  const params = useParams();
  const data = useRouteData<typeof routeData>();
  const [action, { Form }] = createServerAction$(userProfileUpdate);

  return (
    <main class="p-4">
      <Title>Profile Update</Title>

      <div class="mx-auto max-w-xl">
        <h1 class="mb-4 text-xl font-bold">Profile Update</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <Show when={data()}>
          <Form>
            <HiddenInput name="username" value={params.username} />
            <Input name="height" value={data().height} />
            <FormSelect name="sex" options={sexOptions} value={data().sex} />
            <Input
              name="date_of_birth"
              type="date"
              value={data().date_of_birth}
            />
            <FormSelect
              name="fitness_goal"
              label="Fitness Goal"
              options={goalOptions}
              value={data().fitness_goal}
            />
            <FormSelect
              name="activity_level"
              label="Activity Level"
              options={activityLevelOptions}
              value={data().activity_level}
            />
            <Button label="Update Profile" loading={action.pending} />
          </Form>
        </Show>
      </div>
    </main>
  );
}
