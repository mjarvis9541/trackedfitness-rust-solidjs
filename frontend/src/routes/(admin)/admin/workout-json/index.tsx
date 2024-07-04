import { For, Show, createSignal } from "solid-js";
import {
  A,
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import DeleteFormIcon from "~/components/DeleteFormIcon";
import { WorkoutButton } from "~/components/ui/Button";
import Filter from "~/components/ui/Filter";
import FilterDate from "~/components/ui/FilterDate";
import HiddenInput from "~/components/ui/HiddenInput";
import { PlusIcon } from "~/components/ui/Icon";
import Search from "~/components/ui/Search";
import { exerciseCreateWithSets } from "~/components/workouts-sm/ExerciseCreateForm";
import { setCreateMulti } from "~/components/workouts-sm/SetCreateForm";
import SetInput from "~/components/workouts/SetInput";
import WorkoutSelect from "~/components/workouts/WorkoutSelect";
import { getRequest } from "~/services/api";

import { formatDateStrLong } from "~/utils/datetime";
import { classNames } from "~/utils/text";

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "workouts/json",
      location.query,
      location.query["username"],
      location.query["date"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const movementSelect = createServerData$(getRequest, {
    key: () => ["movements/select"],
  });
  return { data, movementSelect };
}

export default function AdminPage() {
  const { data, movementSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>Workout JSON List</Title>

      <div class="flex justify-between">
        <h1 class="text-xl font-bold">Workout JSON List</h1>
        <div class="flex gap-2">
          <Search
            name="username"
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
          <FilterDate
            name="date"
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
          <Filter
            name="order"
            options={[
              { value: "", label: "Sort" },
              { value: "-t1.date", label: "Date (desc)" },
              { value: "t1.date", label: "Date (asc)" },
              { value: "-created_at", label: "Created (desc)" },
              { value: "created_at", label: "Created (asc)" },
            ]}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4 py-4">
        <div class="col-span-12">
          <Show when={data()}>
            <For each={data()}>
              {(workout) => (
                <WorkoutItem
                  workout={workout}
                  movementSelect={movementSelect()}
                />
              )}
            </For>
          </Show>
        </div>
        <div class="col-span-6">2</div>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}

function WorkoutItem(props: any) {
  const headers = [
    { classes: "col-span-3", title: "Exercise" },
    { classes: "", title: "Set 1" },
    { classes: "", title: "Set 2" },
    { classes: "", title: "Set 3" },
    { classes: "", title: "Set 4" },
    { classes: "", title: "Set 5" },
    { classes: "", title: "Set 6" },
    { classes: "", title: "Edit" },
  ];
  const [setCreateA, { Form: SetForm }] = createServerAction$(setCreateMulti);
  return (
    <div class="mb-2 border border-amber-400 p-1">
      <div class="mb-1 flex items-center justify-between bg-amber-400 p-1 pl-2 text-zinc-900">
        <div class="flex gap-2">
          <A
            href={`/admin/workouts/${props.workout.workout_id}`}
            class="font-bold hover:underline "
          >
            Workout - {formatDateStrLong(props.workout?.date)}
          </A>
          <div>|</div>
          <A
            href={`/users/${props.workout.username}`}
            class="font-bold capitalize hover:underline"
          >
            {props.workout.username}
          </A>
          <div>|</div>
          <div class="font-bold">{props.workout.exercise_count} exercises</div>
          <div>|</div>
          <div class="font-bold">{props.workout.set_count} sets</div>
          <div>|</div>
          <div class="text-zinc-700">{props.workout.workout_id}</div>
        </div>
        <div>
          <DeleteFormIcon url={`workouts/${props.workout.workout_id}`} />
        </div>
      </div>

      <Show when={props?.workout?.exercise_count}>
        <div class="grid grid-cols-10">
          <For each={headers}>
            {(header) => (
              <div
                class={classNames(
                  "border-b-[1px] border-r-[1px] border-zinc-800 px-2 py-1 text-sm font-bold text-zinc-400",
                  header.classes,
                )}
              >
                {header.title}
              </div>
            )}
          </For>
          <For each={props.workout.exercises}>
            {(exercise) => <ExerciseItem exercise={exercise} />}
          </For>
        </div>
      </Show>

      <div class="ml-auto max-w-4xl">
        <CreateExerciseForm
          workout={props.workout}
          movementSelect={props.movementSelect}
        />
      </div>
    </div>
  );
}

function ExerciseItem(props: any) {
  // let set_count = 6 - props.exercise.set_count
  const [setCount, setSetCount] = createSignal(0);
  const setCounter = () => setSetCount(6 - props.exercise.set_count);
  return (
    <>
      <div class="col-span-3 flex items-center justify-between border-b-[1px] border-r-[1px] border-zinc-800 p-1 pl-2 text-zinc-300">
        <A
          href={`/admin/exercises/${props.exercise.exercise_id}`}
          class="block hover:underline"
        >
          {props.exercise.name}
        </A>
        <div class="flex items-center gap-4">
          <div class="text-sm text-zinc-500">
            {props.exercise.set_count} sets
          </div>
          <DeleteFormIcon url={`exercises/${props.exercise.exercise_id}`} />
        </div>
      </div>
      <Show when={props.exercise.set_count}>
        <For each={props.exercise.sets}>{(set) => <SetItem set={set} />}</For>
      </Show>
      <Show when={setCounter() > 0}>
        <div
          class={`border-b-[1px] border-r-[1px] border-zinc-800 px-2 py-1 text-zinc-500 col-span-${setCounter()}`}
        >
          -
        </div>
      </Show>
      <div class="flex items-center justify-end gap-2 border-b-[1px] border-r-[1px] border-zinc-800">
        <button
          class="block p-1 hover:bg-zinc-500"
          type="submit"
          name="setAdd"
          value="setAdd"
        >
          <PlusIcon />
        </button>
        <DeleteFormIcon
          url={`exercises/${props.exercise.exercise_id}/delete-last-set`}
        />
      </div>
    </>
  );
}

function SetItem(props: any) {
  return (
    <A
      href={`/admin/sets/${props.set.set_id}`}
      class="grid grid-cols-2 border-b-[1px] border-r-[1px] border-zinc-800 text-end hover:bg-amber-300"
    >
      <div class="border-r-[1px] border-zinc-800 px-2 py-1">
        {props.set.weight}
        <span class="ml-1 text-sm text-zinc-500">kg</span>
      </div>
      <div class="px-2 py-1">
        {props.set.reps} <span class="text-sm text-zinc-500">reps</span>
      </div>
    </A>
  );
}

function CreateExerciseForm(props: any) {
  const [action, { Form }] = createServerAction$(exerciseCreateWithSets);
  return (
    <div class="border border-purple-500 p-1">
      <Form class="flex gap-2">
        <HiddenInput name="username" value={props.workout.username} />
        <HiddenInput name="workout_id" value={props.workout.workout_id} />
        <WorkoutSelect name="movement_id" options={props.movementSelect} />
        <SetInput name="weight" value={60} label="kg" />
        <SetInput name="reps" value={10} label="Reps" />
        <SetInput name="rest" value={0} label="Rest" />
        <SetInput name="set_count" value={1} label="Sets" />
        <WorkoutButton label="Add Exercise" loading={action.pending} />
      </Form>
    </div>
  );
}
