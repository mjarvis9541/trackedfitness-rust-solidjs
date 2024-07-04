import { A, RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`progress/user/${params.username}/${params.date}`],
  });
}

export default function ProgressDetailPage() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; date: string }>();

  return (
    <main class="p-4">
      <Title>Progress Detail</Title>

      <div class="p-4">
        <h1 class="text-xl font-bold">Progress Detail</h1>

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
