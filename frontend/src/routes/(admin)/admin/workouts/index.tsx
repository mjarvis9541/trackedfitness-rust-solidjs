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
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import Search from "~/components/ui/Search";
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";
import { now } from "~/utils/datetime";

type Workout = {
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
      "workouts",
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["date"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { data, userSelect };
}

export async function workoutCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const user_id = form.get("user_id");
  const date = form.get("date");
  return await postRequest(request, "workouts", { user_id, date });
}

export type WorkoutCreateFormProps = {
  userSelect: object[];
};

export function WorkoutCreateForm(props: WorkoutCreateFormProps) {
  const [action, { Form }] = createServerAction$(workoutCreate);
  return (
    <>
      <Show when={action.error}>
        <pre>{JSON.stringify(action.error, null, 2)}</pre>
      </Show>
      <Form>
        <Select name="user_id" label="User" options={props.userSelect} />
        <Input name="date" type="date" value={now()} />
        <Button loading={action.pending} />
      </Form>
    </>
  );
}

export default function AdminWorkoutListPage() {
  const { data, userSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "username" },
    { classes: "", title: "date" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "exercise_count" },
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
      lookup: "id",
      title: "id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "users",
      lookup: "username",
      title: "username",
    },
    { classes: "", title: "date" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "" },
    { classes: "", title: "exercise_count" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];

  return (
    <main class="p-4">
      <Title>Workout List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Workout List - <Show when={data()}>({data().count} Results)</Show>
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
            url="workouts"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">New Workout</h2>
        <Show when={data() && userSelect()} fallback={<LoadingSpinner />}>
          <WorkoutCreateForm userSelect={userSelect()} />
        </Show>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
