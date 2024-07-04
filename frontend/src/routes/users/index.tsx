import { For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import {
  A,
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import Paginator from "~/components/Paginator";
import Checkbox from "~/components/ui/Checkbox";
import CheckboxAll from "~/components/ui/CheckboxAll";
import Filter from "~/components/ui/Filter";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";
import { userSortOptions } from "~/utils/constants";

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  profile_id: number;
  target_id: number;
  privacy_level: string;
  is_active: boolean;
  is_staff: boolean;
  email_verified: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  is_private: boolean;
  is_followed: boolean;
  followers: any[];
  following: any[];
  follower_count: number;
  following_count: number;
  last_login: string;
  updated_at: string;
  created_at: string;
};

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [
      "users",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
}

export default function UserListPage() {
  const users = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checked, setChecked] = createStore([]);

  return (
    <main class="p-4">
      <Title>Users</Title>
      <div class="p-4">
        <h1 class="mb-4 text-xl font-bold">Users</h1>
        <div class="mb-4 flex gap-2">
          <div class="flex-1">
            <Search
              name="search"
              label="Search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
          <div class="flex-1"></div>
          <div class="flex-1"></div>
          <div class="flex-1">
            <Filter
              name="order"
              label="Sort"
              options={userSortOptions}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>
        <Paginator />
        <div class="grid grid-cols-checkbox-12">
          <div class="border-b-[1px] p-2 font-bold">
            <Show when={users()}>
              <CheckboxAll
                data={users().results}
                checked={checked}
                setChecked={setChecked}
              />
            </Show>
          </div>
          <div class="border-b-[1px] p-2 font-bold">Username</div>
          <div class="border-b-[1px] p-2 font-bold">Name</div>
          <div class="border-b-[1px] p-2 font-bold">Email</div>
          <div class="border-b-[1px] p-2 font-bold">Email Verified</div>
          <div class="border-b-[1px] p-2 font-bold">Privacy</div>
          <div class="border-b-[1px] p-2 font-bold">Active</div>
          <div class="border-b-[1px] p-2 font-bold">Followers</div>
          <div class="border-b-[1px] p-2 font-bold">Following</div>
          <div class="border-b-[1px] p-2 font-bold">Last Login</div>
          <div class="border-b-[1px] p-2 font-bold">Created</div>
          <div class="border-b-[1px] p-2 font-bold">Updated</div>
          <For each={users().results}>
            {(user) => (
              <UserListItem
                data={user}
                checked={checked}
                setChecked={setChecked}
              />
            )}
          </For>
        </div>

        <Paginator />
      </div>
    </main>
  );
}

type UserListItemProps = {
  data: User | any;
  checked: any;
  setChecked: any;
};

function UserListItem(props: UserListItemProps) {
  return (
    <div class="group contents">
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <Checkbox {...props} />
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          href={`/users/${props.data.username}`}
          class="text-blue-500 hover:underline"
        >
          {props.data.username}
        </A>
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.name}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.email}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.email_verified.toString()}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.privacy_level}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {JSON.stringify(props.data.is_active, null, 2)}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.follower_count}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.following_count}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.last_login || "-"}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.created_at}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.updated_at || "-"}
      </div>
    </div>
  );
}
