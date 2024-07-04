import { A, RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`diet-target/${params.username}/${params.date}`],
  });
}
export default function DietTargetDetailPage() {
  const data = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Diet Target Detail</Title>

      <div class="p-4">
        <h1 class="text-xl font-bold">Diet Target Detail</h1>

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
