import { Show } from "solid-js";
import { RouteDataArgs, Title, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import DietDay from "~/components/diet/DietDay";
import UserProfile from "~/components/profiles/UserProfile";
import EnergySummary from "~/components/progress/EnergySummary";
import ProgressSummary from "~/components/progress/ProgressSummary";
import Calendar from "~/components/ui/Calendar";
import WorkoutSummary from "~/components/workouts/WorkoutSummary";
import { getRequest } from "~/services/api";
import { now } from "~/utils/datetime";

export function routeData({ params, location }: RouteDataArgs) {
  const user = createServerData$(getRequest, {
    key: () => [`users/${params.username}`],
  });
  const profile = createServerData$(getRequest, {
    key: () => [`profiles/${params.username}/${params.date || now()}`],
  });
  const dietTarget = createServerData$(getRequest, {
    key: () => [
      `diet-target/${params.username}/${params.date || now()}/latest`,
    ],
  });
  const progress = createServerData$(getRequest, {
    key: () => [`progress/${params.username}/${params.date || now()}/latest`],
  });
  const workouts = createServerData$(getRequest, {
    key: () => [
      `workouts?username=${params.username}&date=${params.date || now()}`,
    ],
  });
  const progressSummary = createServerData$(getRequest, {
    key: () => [
      `progress/${params.username}/${params.date || now()}/aggregation`,
    ],
  });
  const exerciseSetSummary = createServerData$(getRequest, {
    key: () => [
      `workouts/${params.username}/${params.date || now()}/day-aggregation`,
    ],
  });
  const dietDay = createServerData$(getRequest, {
    key: () => [`diet/${params.username}/${params?.date || now()}`],
  });
  const movementSelect = createServerData$(getRequest, {
    key: () => [`movements/select`],
  });
  const workoutList = createServerData$(getRequest, {
    key: () => [
      `workouts/json?username=${params.username}&date=${params.date || now()}`,
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });
  return {
    user,
    profile,
    dietTarget,
    progress,
    workouts,
    progressSummary,
    exerciseSetSummary,
    workoutList,
    movementSelect,
    dietDay,
  };
}

export default function UserDetailPage() {
  const data = useRouteData();
  const params = useParams<{ username: string; date?: string }>();
  const getDate = () => params.date || now();

  return (
    <>
      <Title>Day</Title>

      <div class="grid grid-cols-12">
        <div class="col-span-2 hidden pl-4 pt-4 md:block">
          <div class="mb-4">
            <Calendar />
          </div>
          <div>
            <Show when={data.profile()}>
              <UserProfile data={data.profile()} />
            </Show>
          </div>
        </div>
        <div class="col-span-12 md:col-span-10">
          <div class="flex flex-wrap gap-4 px-4 pt-4">
            <div class="flex-1">
              <WorkoutSummary data={data.exerciseSetSummary()} />
            </div>
            <div class="flex-1">
              <EnergySummary data={data.progressSummary()} />
            </div>
            <div class="flex-1">
              <ProgressSummary data={data.progressSummary()} />
            </div>
          </div>

          <div class="mx-4 mt-4 grid grid-cols-4 gap-4 md:grid-cols-12">
            <div class="col-span-4 bg-zinc-800 p-4 md:col-span-12">
              <Show when={data.dietDay().results}>
                <DietDay
                  username={params.username}
                  date={getDate()}
                  dietDay={data.dietDay().results}
                  dietTarget={data.dietTarget()}
                />
              </Show>
            </div>
          </div>

          <pre>{JSON.stringify(data.diet().results, null, 2)}</pre>
        </div>
      </div>
    </>
  );
}
