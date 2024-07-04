import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import {
  ServerFunctionEvent,
  createServerAction$,
  createServerData$,
} from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import Button from "~/components/ui/Button";
import Filter from "~/components/ui/Filter";
import Search from "~/components/ui/Search";
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";

type Exercise = {
  id: string;
  username: string;
  date: string;
  created_at: string;
  updated_at: string;
  exercise_count: number;
};

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "exercises",
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });
  const workoutSelect = createServerData$(getRequest, {
    key: () => ["workouts/select"],
  });
  const movementSelect = createServerData$(getRequest, {
    key: () => ["movements/select"],
  });
  return { data, workoutSelect, movementSelect };
}

export async function exerciseCreate(
  form: FormData,
  event: ServerFunctionEvent,
) {
  const workout_id = form.get("workout_id");
  const movement_id = form.get("movement_id");
  return await postRequest(event.request, `exercises`, {
    workout_id,
    movement_id,
  });
}

export type ExerciseCreateFormProps = {
  movementSelect: object[];
  workoutSelect: object[];
};

export function ExerciseCreateForm(props: ExerciseCreateFormProps) {
  const [action, { Form }] = createServerAction$(exerciseCreate);
  return (
    <>
      <Show when={action.error}>
        <pre>{JSON.stringify(action.error, null, 2)}</pre>
      </Show>
      <Form>
        <Select
          name="workout_id"
          label="Workout"
          options={props.workoutSelect}
        />
        <Select
          name="movement_id"
          label="Movement"
          options={props.movementSelect}
        />
        <Button loading={action.pending} label="Create Exercise" />
      </Form>
    </>
  );
}

export default function AdminExerciseListPage() {
  const { data, workoutSelect, movementSelect } =
    useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "workout_id" },
    { classes: "", title: "exercise_id" },
    { classes: "", title: "movement_id" },
    { classes: "", title: "created_by" },
    { classes: "text-end", title: "order" },
    { classes: "text-end", title: "set_count" },
    { classes: "text-end", title: "rep_count" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];
  const rows = [
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/workouts",
      lookup: "workout_id",
      title: "workout_id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/exercises",
      lookup: "id",
      title: "id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/movements",
      lookup: "movement_id",
      title: "movement_id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "users",
      lookup: "created_by",
      title: "created_by",
    },
    { classes: "text-end", title: "order" },
    { classes: "text-end", title: "set_count" },
    { classes: "text-end", title: "rep_count" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];

  return (
    <main class="p-4">
      <Title>Exercise List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Exercise List - <Show when={data()}>({data().count} Results)</Show>
          </h1>
          <div class="flex gap-2">
            <Search
              name="search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <Filter
              name="order"
              options={[
                { value: "", label: "Sort" },
                { value: "-date", label: "Date (desc)" },
                { value: "date", label: "Date (asc)" },
                { value: "-created_at", label: "Created (desc)" },
                { value: "created_at", label: "Created (asc)" },
              ]}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>

        <Show when={data()}>
          <AutoList
            data={data().results}
            headers={headers}
            rows={rows}
            checkbox={true}
            url="exercises"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border bg-zinc-800 p-4">
        <h2 class="mb-4 text-xl font-bold">New Exercise</h2>
        <ExerciseCreateForm
          workoutSelect={workoutSelect()}
          movementSelect={movementSelect()}
        />
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
