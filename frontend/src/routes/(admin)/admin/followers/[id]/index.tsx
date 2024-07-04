import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import Button from "~/components/ui/Button";
import HiddenInput from "~/components/ui/HiddenInput";
import Input from "~/components/ui/Input";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import Select from "~/components/ui/Select";
import { getRequest, putRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`followers/${params.id}`],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { data, userSelect };
}

export async function followerUpdate(
  form: FormData,
  { request }: { request: Request },
) {
  const id = form.get("id");
  const user_id = form.get("user_id");
  const follower_id = form.get("follower_id");
  const status = Number(form.get("status"));
  const data = await putRequest(request, `followers/${id}`, {
    user_id,
    follower_id,
    status,
  });
  if (data.errors) {
    return data.errors;
  }
  return redirect(`/admin/followers/${data.id}`);
}

export default function FollowerDetailPage() {
  const { data, userSelect } = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();
  const [update, { Form: UpdateForm }] = createServerAction$(followerUpdate);

  return (
    <main class="p-4">
      <Title>Follower Detail</Title>

      <h1 class="text-xl font-bold">Follower Detail</h1>

      <pre>{JSON.stringify(data(), null, 2)}</pre>

      <div class=" max-w-lg gap-4">
        <h2 class="mb-4 text-xl font-bold">Update Following</h2>
        <Show when={update.error}>
          <pre>{JSON.stringify(update.error, null, 2)}</pre>
        </Show>
        <Show when={data() && userSelect()} fallback={<LoadingSpinner />}>
          <UpdateForm>
            <HiddenInput name="id" value={params.id} />
            <Select
              name="user_id"
              label="User"
              options={userSelect()}
              value={data().user_id}
            />
            <Select
              name="follower_id"
              label="Follower"
              options={userSelect()}
              value={data().follower_id}
            />
            <Input name="status" type="number" value={Number(data().status)} />

            <Button loading={update.pending} label="Update Following" />
          </UpdateForm>
        </Show>
      </div>

      <div class="mt-8 max-w-lg">
        <DeleteForm
          url={`followers/${params.id}`}
          redirectTo={`/admin/followers`}
        />
      </div>
    </main>
  );
}
