import { For } from "solid-js";
import {
  A,
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import Search from "~/components/ui/Search";
import NavUserIcon from "~/components/users/NavUserIcon";
import { getRequest } from "~/services/api";

export function routeData({ location, params }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [`followers?user=${params.username} ""`],
  });
}

export default function FollowerView() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>Followers</Title>
      <div class="mb-4 flex justify-between">
        <h1 class="text-xl font-bold">Followers</h1>
        <div>
          <Search
            name="search"
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </div>
      </div>

      <div>
        <For each={data()}>{(user) => <FollowerListItem user={user} />}</For>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}

function FollowerListItem(props: any) {
  return (
    <A href={`/users/${props.user.follower}`}>
      <div class="mb-2 flex gap-4 overflow-hidden rounded p-2 hover:bg-amber-200">
        <div class="grid place-items-center">
          <NavUserIcon username={props.user.follower} />
        </div>
        <div class="flex-1">
          <div class="font-semibold capitalize">{props.user.follower}</div>
          <div class="text-sm text-gray-400">{props.user.follower}</div>
        </div>
      </div>
    </A>
  );
}
