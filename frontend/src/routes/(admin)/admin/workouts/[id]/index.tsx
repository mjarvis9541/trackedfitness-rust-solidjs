import { A, RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const workout = createServerData$(getRequest, {
    key: () => [`workouts/${params.id}`],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { workout, userSelect };
}

export default function AdminWorkoutDetailPage() {
  const data = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Workout Detail</Title>

      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Workout Detail</h1>

        <pre>{JSON.stringify(data.workout(), null, 2)}</pre>
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
