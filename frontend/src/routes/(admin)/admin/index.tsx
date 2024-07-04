import { For, Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import Button from "~/components/ui/Button";
import Filter from "~/components/ui/Filter";
import FilterDate from "~/components/ui/FilterDate";
import Input from "~/components/ui/Input";
import Search from "~/components/ui/Search";
import Select from "~/components/ui/Select";
import WorkoutContainer from "~/components/workouts-sm/WorkoutContainer";
import { getRequest, postRequest } from "~/services/api";
import { now } from "~/utils/datetime";

export function routeData({ location }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [
      "workouts/json",
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });
  const movementSelect = createServerData$(getRequest, {
    key: () => ["movements/select"],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { data, movementSelect, userSelect };
}

export async function workoutCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const user_id = form.get("user_id");
  const date = form.get("date");
  const data = await postRequest(request, "workouts", {
    user_id,
    date,
  });
  return data;
}

export default function AdminPage() {
  const { data, movementSelect, userSelect } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [action, { Form }] = createServerAction$(workoutCreate);
  return (
    <main class="p-4">
      <Title>Admin</Title>

      <div class="grid grid-cols-12">
        <div class="col-span-6">
          <div class="flex justify-between">
            <h1 class="text-xl font-bold">Workout List</h1>
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
        </div>
        <div class="col-span-6">
          <div class="col-span-6">
            <Show when={data()}>
              <For each={data()}>
                {(workout) => (
                  <WorkoutContainer
                    workout={workout}
                    movementSelect={movementSelect()}
                  />
                )}
              </For>
            </Show>
          </div>
          <div class="col-span-3">
            <Show when={data()}>
              <Form>
                <Select
                  name="user_id"
                  label="User"
                  options={userSelect()}
                  value={data().user_id}
                />
                <Input name="date" type="date" value={now()} />
                <Button />
              </Form>
            </Show>
          </div>
        </div>
      </div>

      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
