import { Show } from "solid-js";
import { Outlet, RouteDataArgs, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import UserHeader from "~/components/UserHeader";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`users/${params.username}/header`],
  });
}

export default function UserDetailLayout() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string }>();
  return (
    <>
      <Show when={data()}>
        <UserHeader userHeaderData={data()} params={params} />
      </Show>
      <Outlet />
    </>
  );
}
