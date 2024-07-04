import { ErrorBoundary } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DeleteForm from "~/components/DeleteForm";
import AdminUserForm from "~/components/users/AdminUserForm";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`users/admin/${params.id}`],
  });
  const userStats = createServerData$(getRequest, {
    key: () => [`users/admin/${params.id}/stats`],
  });
  return { data, userStats };
}

export default function AdminUserDetailPage() {
  const { data, userStats } = useRouteData<typeof routeData>();
  const params = useParams<{ id: string }>();

  return (
    <main class="p-4">
      <Title>User Detail</Title>

      <div class="mb-4 rounded border bg-zinc-800 p-4">
        <h1 class="text-xl font-bold">User Detail</h1>
      </div>

      <ErrorBoundary
        fallback={(err, reset) => <div onClick={reset}>{err.toString()}</div>}
      >
        <pre class="mb-4">{JSON.stringify(data(), null, 2)}</pre>

        <div class="mb-4 flex justify-end">
          <div class="">
            <DeleteForm
              url={`users/admin/${params.id}`}
              redirectTo={`/admin/users`}
            />
          </div>
        </div>
      </ErrorBoundary>

      <div class="flex gap-4">
        <div class="flex-1">
          <div class="mb-4 rounded border bg-zinc-800 p-4">
            <h1 class="text-xl font-bold">User Update</h1>
          </div>
          <div class="border border-zinc-700 p-4">
            <ErrorBoundary
              fallback={(err, reset) => (
                <div onClick={reset}>{err.toString()}</div>
              )}
            >
              <AdminUserForm data={data()} />
            </ErrorBoundary>
          </div>
        </div>
        <div class="flex-1">
          <div class="mb-4 rounded border bg-zinc-800 p-4">
            <h1 class="text-xl font-bold">User Stats</h1>
          </div>
          <ErrorBoundary
            fallback={(err, reset) => (
              <div onClick={reset}>{err.toString()}</div>
            )}
          >
            <pre class="mb-4">{JSON.stringify(userStats(), null, 2)}</pre>
          </ErrorBoundary>
        </div>
      </div>
    </main>
  );
}
