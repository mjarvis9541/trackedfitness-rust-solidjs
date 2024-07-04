import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import Button from "~/components/ui/Button";
import Filter from "~/components/ui/Filter";
import Input from "~/components/ui/Input";
import Search from "~/components/ui/Search";
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";
import { createdUpdatedSortOptions } from "~/utils/constants";
import { ExerciseCreateForm } from "../exercises";
import { WorkoutCreateForm } from "../workouts";

export type Set = {
  id: string;
  username: string;
  date: string;
  created_at: string;
  updated_at: string;
  Set_count: number;
};

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "sets",
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });
  const exerciseSelect = createServerData$(getRequest, {
    key: () => ["exercises/select"],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  const workoutSelect = createServerData$(getRequest, {
    key: () => ["workouts/select"],
  });
  const movementSelect = createServerData$(getRequest, {
    key: () => ["movements/select"],
  });
  return { data, exerciseSelect, userSelect, workoutSelect, movementSelect };
}

export async function setCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const exercise_id = form.get("exercise_id");
  const weight = form.get("weight");
  const order = Number(form.get("order"));
  const reps = Number(form.get("reps"));
  const rest = Number(form.get("rest"));
  const notes = form.get("notes");
  return await postRequest(request, "sets", {
    exercise_id,
    order,
    weight,
    reps,
    rest,
    notes,
  });
}

export type SetCreateFormProps = {
  exerciseSelect: object[];
};

export function SetCreateForm(props: SetCreateFormProps) {
  const [action, { Form }] = createServerAction$(setCreate);
  return (
    <>
      <Show when={action.error}>
        <pre>{JSON.stringify(action.error, null, 2)}</pre>
      </Show>
      <Form>
        <Select
          name="exercise_id"
          label="Exercise"
          options={props.exerciseSelect}
        />
        <Input name="order" value={100} />
        <Input name="weight" value={100} />
        <Input name="reps" value={10} />
        <Input name="rest" value={60} />
        <Input name="notes" />
        <Button loading={action.pending} label="Create Set" />
      </Form>
    </>
  );
}

export default function AdminSetListPage() {
  const { data, exerciseSelect, userSelect, workoutSelect, movementSelect } =
    useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "workout_id" },
    { classes: "", title: "exercise_id" },
    { classes: "", title: "set_id" },
    { classes: "", title: "weight" },
    { classes: "", title: "reps" },
    { classes: "", title: "rest" },
    { classes: "", title: "order" },
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
      lookup: "exercise_id",
      title: "exercise_id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/sets",
      lookup: "id",
      title: "id",
    },
    { classes: "", title: "weight" },
    { classes: "", title: "reps" },
    { classes: "", title: "rest" },
    { classes: "", title: "order" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];

  return (
    <main class="p-4">
      <Title>Set List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Set List - <Show when={data()}>({data().count} Results)</Show>
          </h1>
          <div class="flex gap-2">
            <Search
              name="search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            <Filter
              name="order"
              defaultValue=""
              defaultOption="Sort"
              options={createdUpdatedSortOptions}
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
            url="sets"
          />
        </Show>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-4">
          <div class="mt-4 max-w-lg border p-4">
            <h3 class="mb-4 text-xl font-bold">New Workout</h3>
            <WorkoutCreateForm userSelect={userSelect()} />
          </div>
        </div>
        <div class="col-span-4">
          <div class="mt-4 max-w-lg border p-4">
            <h3 class="mb-4 text-xl font-bold">New Exercise</h3>
            <ExerciseCreateForm
              workoutSelect={workoutSelect()}
              movementSelect={movementSelect()}
            />
          </div>
        </div>
        <div class="col-span-4">
          <div class="mt-4 max-w-lg border p-4">
            <h3 class="mb-4 text-xl font-bold">New Set</h3>
            <Show when={exerciseSelect()}>
              <SetCreateForm exerciseSelect={exerciseSelect()} />
            </Show>
          </div>
        </div>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
