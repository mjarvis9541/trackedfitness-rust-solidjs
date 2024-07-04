import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  ServerError,
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import FormSelect from "~/components/ui/FormSelect";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { getRequest, putRequest } from "~/services/api";

import {
  activityLevelOptions,
  goalOptions,
  sexOptions,
} from "~/utils/constants";

export function routeData({ params }: RouteDataArgs) {
  const profile = createServerData$(getRequest, {
    key: () => [`profiles/admin/${params.id}`],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { profile, userSelect };
}

export async function profileUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const user_id = form.get("user_id");
  const height = form.get("height");
  const sex = form.get("sex");
  const date_of_birth = form.get("date_of_birth");
  const fitness_goal = form.get("fitness_goal");
  const activity_level = form.get("activity_level");

  const data = await putRequest(request, `profiles/admin/${id}`, {
    user_id,
    height,
    sex,
    date_of_birth,
    fitness_goal,
    activity_level,
  });
  if (data.error) {
    throw new ServerError(data);
  }
  return redirect(`/admin/profiles/${id}`);
}

export default function AdminProfileUpdatePage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  const [action, { Form }] = createServerAction$(profileUpdate);

  return (
    <main class="p-4">
      <Title>Profile Update</Title>

      <div class="max-w-md border bg-zinc-800 p-4">
        <h1 class="mb-4 text-xl font-bold">Profile Update</h1>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>

        <Show when={data.profile() && data.userSelect()}>
          <Form>
            <HiddenInput name="id" value={params.id} />
            <Select
              name="user_id"
              label="User"
              options={data.userSelect()}
              value={data.profile().user_id}
            />
            <Input name="height" value={data.profile().height} />
            <Input name="date_of_birth" value={data.profile().date_of_birth} />
            <FormSelect
              options={sexOptions}
              name="sex"
              value={data.profile().sex}
            />
            <FormSelect
              options={goalOptions}
              name="fitness_goal"
              value={data.profile().fitness_goal}
            />
            <FormSelect
              options={activityLevelOptions}
              name="activity_level"
              value={data.profile().activity_level}
            />
            <Button loading={action.pending} label="Update Profile" />
          </Form>
        </Show>
      </div>

      <pre>{JSON.stringify(data.profile(), null, 2)}</pre>
    </main>
  );
}
