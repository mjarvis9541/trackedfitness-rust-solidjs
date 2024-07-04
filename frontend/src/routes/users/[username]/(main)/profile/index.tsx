import { A, RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`profiles/${params.username}`],
  });
}

export default function ProfileDetailPage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string }>();

  return (
    <main class="p-4">
      <Title>Profile</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Profile</h1>

        <pre>{JSON.stringify(data(), null, 2)}</pre>

        <p>
          <A href="edit">Edit</A>
        </p>
        <p>
          <A href="delete">Delete</A>
        </p>
      </div>
    </main>
  );
}
