import { Show } from "solid-js";
import { A, RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DietTargetDetail from "~/components/diet-target/DietTargetDetail";
import ProfileDetail from "~/components/profiles/ProfileDetail";
import ProgressDetail from "~/components/progress/ProgressDetail";
import UserDetail from "~/components/users/UserDetail";
import { getRequest } from "~/services/api";
import { formatDateStrLong, now } from "~/utils/datetime";

export function routeData({ params }: RouteDataArgs) {
  const user = createServerData$(getRequest, {
    key: () => [`users/${params.username}`],
  });
  const profile = createServerData$(getRequest, {
    key: () => [`profiles/${params.username}`],
  });
  const dietTarget = createServerData$(getRequest, {
    key: () => [`diet-target/${params.username}/${now()}/latest`],
  });
  const progress = createServerData$(getRequest, {
    key: () => [`progress/${params.username}/${now()}/latest`],
  });
  return { user, profile, dietTarget, progress };
}

export default function UserSettingsPage() {
  const params = useParams<{ username: string }>();
  const { user, profile, dietTarget, progress } =
    useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Settings</Title>
      <h1 class="mb-4 text-xl font-bold">Settings</h1>

      <div class="grid grid-cols-4 gap-4 md:grid-cols-12">
        <div class="col-span-4">
          <div class="mb-4 border bg-zinc-900 p-4">
            <Show when={user()}>
              <div class="mb-4 flex items-start justify-between">
                <div>
                  <h3 class="text-xl font-bold">
                    <A href={`/users/${params.username}/account`}>User</A>
                  </h3>
                </div>
                <div class="flex gap-2">
                  <A href={`/users/${params.username}/account/edit`}>Edit</A>
                </div>
              </div>

              <UserDetail data={user()} />
            </Show>
          </div>
          <div class="p-4">
            <Show
              when={profile()}
              fallback={
                <div>
                  <A class="text-blue-500 hover:underline" href="/">
                    Create Profile
                  </A>
                </div>
              }
            >
              <div class="mb-4 flex items-start justify-between">
                <div>
                  <h3 class="text-xl font-bold">
                    <A href={`/users/${params.username}/profile`}>Profile</A>
                  </h3>
                </div>
                <div class="flex gap-2">
                  <A href={`/users/${params.username}/profile/create`}>
                    Create
                  </A>
                  <A href={`/users/${params.username}/profile/edit`}>Edit</A>
                  <A href={`/users/${params.username}/profile/delete`}>
                    Delete
                  </A>
                </div>
              </div>

              <ProfileDetail data={profile()} />
            </Show>
          </div>
        </div>

        <div class="col-span-4">
          <div class="p-4">
            <div class="mb-4 flex items-start justify-between">
              <Show when={dietTarget()}>
                <div>
                  <h3 class="text-xl font-bold">
                    <A
                      href={`/users/${params.username}/diet-target/${
                        dietTarget().date
                      }`}
                    >
                      Latest Diet Target
                    </A>
                  </h3>
                  <div class="text-sm text-gray-400">
                    {dietTarget()?.date && formatDateStrLong(dietTarget().date)}
                  </div>
                </div>
                <div class="flex gap-2">
                  <A
                    href={`/users/${params.username}/diet-target/${
                      dietTarget().date
                    }/edit`}
                  >
                    Edit
                  </A>
                  <A
                    href={`/users/${params.username}/diet-target/${dietTarget()
                      ?.date}/delete`}
                  >
                    Delete
                  </A>
                </div>
              </Show>
            </div>
            <div class="mb-4">
              <Show
                when={dietTarget()}
                fallback={
                  <A class="text-blue-500 hover:underline" href="/">
                    Create Diet Target
                  </A>
                }
              >
                <DietTargetDetail data={dietTarget()} />
              </Show>
            </div>
            <div class="flex justify-end">
              <A
                class="text-blue-500 hover:underline"
                href={`/users/${
                  params.username
                }/diet-target/create?date=${now()}`}
              >
                New Diet Target
              </A>
            </div>
          </div>
        </div>
        <div class="col-span-4">
          <div class="p-4">
            <div class="mb-4 flex items-start justify-between">
              <Show when={progress()}>
                <div>
                  <h3 class="text-xl font-bold">
                    <A
                      href={`/users/${params.username}/progress/${progress()
                        ?.date}`}
                    >
                      Latest Progress
                    </A>
                  </h3>
                  <div class="text-sm text-gray-400">
                    {progress()?.date && formatDateStrLong(progress()?.date)}
                  </div>
                </div>
                <div class="flex gap-2">
                  <A
                    href={`/users/${params.username}/progress/${progress()
                      ?.date}/edit`}
                  >
                    Edit
                  </A>
                  <A
                    href={`/users/${params.username}/progress/${progress()
                      ?.date}/delete`}
                  >
                    Delete
                  </A>
                </div>
              </Show>
            </div>
            <div class="mb-4">
              <Show
                when={progress()}
                fallback={
                  <A class="text-blue-500 hover:underline" href="/">
                    Log Progress
                  </A>
                }
              >
                <ProgressDetail data={progress()} />
              </Show>
              <div>
                <A class="text-blue-500 hover:underline" href="/">
                  Log Progress
                </A>
              </div>
            </div>
            <div class="flex justify-end">
              <A
                class="text-blue-500 hover:underline"
                href={`/users/${params.username}/progress/create?date=${now()}`}
              >
                New Progress Log
              </A>
            </div>
          </div>
        </div>
      </div>
      <div class="py-4">
        <ExtraLinks />
      </div>
    </main>
  );
}

function ExtraLinks() {
  return (
    <div class="border bg-zinc-800 p-4">
      <ul>
        <li>
          <A href="/logout">Logout</A>
        </li>
        <li>
          <A href="/change-password">Change Password</A>
        </li>
        <li>
          <A href="/change-email">Change Email</A>
        </li>
        <li>
          <A href="/change-email">Change Username</A>
        </li>
      </ul>
    </div>
  );
}
