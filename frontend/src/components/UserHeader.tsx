import { Params } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import { A, useParams } from "solid-start";
import { createServerAction$ } from "solid-start/server";

import { deleteWithDataRequest, postRequest } from "~/services/api";
import HiddenInput from "./ui/HiddenInput";
import UserIcon from "./users/UserIcon";

export type UserHeaderProps = {
  params: Params;
  userHeaderData: any;
};

export async function followerCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  return await postRequest(request, "followers", { username });
}

export async function followerDelete(
  form: FormData,
  { request }: { request: Request },
) {
  const username = form.get("username");
  return await deleteWithDataRequest(request, "followers/delete", {
    username,
  });
}

export default function UserHeader(props: UserHeaderProps) {
  const params = useParams<{ username: string }>();

  return (
    <div class="flex justify-between bg-zinc-600 px-4 py-2">
      <div class="flex items-start gap-4">
        <UserIcon params={params} />

        <div>
          <div class="text-xl font-bold capitalize">
            <A href={`/users/${props.params.username}`}>
              {props.params.username}
            </A>
          </div>
          <div class="text-sm font-normal text-zinc-400">
            {props.userHeaderData.email}
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <FollowerForm userHeaderData={props.userHeaderData} />

        <A
          class="flex items-center gap-2 rounded bg-zinc-800 px-4 py-1.5  text-sm hover:bg-zinc-900"
          href="settings"
        >
          Settings
        </A>
      </div>
    </div>
  );
}

function FollowerForm(props: any) {
  const [action, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const form_action = Number(form.get("button"));
      if (form_action === 1) {
        return await followerCreate(form, { request });
      }
      if (form_action === 0) {
        return await followerDelete(form, { request });
      }
    },
  );
  return (
    <>
      <Form class="contents">
        <HiddenInput name="username" value={props.userHeaderData.username} />
        <Switch
          fallback={
            <button
              value="1"
              name="button"
              class="flex items-center gap-2 rounded bg-zinc-800 px-4 py-1.5 text-sm hover:bg-zinc-900"
            >
              Follow User
            </button>
          }
        >
          <Match when={props.userHeaderData.is_following > 0}>
            <button
              value="0"
              name="button"
              class="flex items-center gap-2 rounded bg-zinc-800 px-4 py-1.5 text-sm hover:bg-zinc-900"
            >
              Unfollow User
            </button>
          </Match>
          <Match when={props.userHeaderData.is_self}>
            <></>
          </Match>
        </Switch>
      </Form>
      <A
        class="flex items-center gap-2 rounded bg-zinc-800 px-4 py-1.5 text-sm hover:bg-zinc-900"
        href="followers"
      >
        {props.userHeaderData.follower_count} Followers
      </A>
      <A
        class="flex items-center gap-2 rounded bg-zinc-800 px-4 py-1.5 text-sm hover:bg-zinc-900"
        href="following"
      >
        {props.userHeaderData.following_count} Following
      </A>
    </>
  );
}
