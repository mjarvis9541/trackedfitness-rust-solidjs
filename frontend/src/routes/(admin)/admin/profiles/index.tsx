import { Show } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import AutoList from "~/components/admin/AutoList";
import Button from "~/components/ui/Button";
import Filter from "~/components/ui/Filter";
import FormSelect from "~/components/ui/FormSelect";
import Input from "~/components/ui/Input";
import Search from "~/components/ui/Search";
import Select from "~/components/ui/Select";
import { getRequest, postRequest } from "~/services/api";
import {
  activityLevelOptions,
  goalOptions,
  sexOptions,
} from "~/utils/constants";
import { now } from "~/utils/datetime";

export type Profile = {
  id: string;
  user_id: string;
  sex: string;
  height: string;
  date_of_birth: string;
  fitness_goal: string;
  activity_level: string;
  created_at: string;
  updated_at: string;
  created_by_id: string;
  updated_by_id: string;
};

export function routeData({ location }: RouteDataArgs) {
  const profiles = createServerData$(getRequest, {
    key: () => [
      "profiles",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
  const userSelect = createServerData$(getRequest, {
    key: () => ["users/select"],
  });
  return { profiles, userSelect };
}

export async function profileCreate(
  form: FormData,
  { request }: { request: Request },
) {
  const user_id = form.get("user_id");
  const height = form.get("height");
  const weight = form.get("weight");
  const date_of_birth = form.get("date_of_birth");
  const activity_level = form.get("activity_level");
  const sex = form.get("sex");
  const fitness_goal = form.get("fitness_goal");
  const data = await postRequest(request, "profiles", {
    user_id,
    date_of_birth,
    sex,
    activity_level,
    fitness_goal,
    height,
    weight,
  });
  return redirect(`/admin/profiles/${data.id}`);
}

export default function ProfileListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { classes: "", title: "id" },
    { classes: "", title: "user_id" },
    { classes: "", title: "sex" },
    { classes: "", title: "height" },
    { classes: "", title: "date_of_birth" },
    { classes: "", title: "fitness_goal" },
    { classes: "", title: "activity_level" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    { classes: "", title: "created_by_id" },
    { classes: "", title: "updated_by_id" },
  ];
  const rows = [
    {
      classes: "text-blue-500 hover:underline",
      title: "id",
      href: "admin/profiles",
      type: "link",
      lookup: "id",
    },
    {
      classes: "text-blue-500 hover:underline",
      title: "user_id",
      href: "admin/users",
      type: "link",
      lookup: "user_id",
    },
    { classes: "", title: "sex" },
    { classes: "", title: "height" },
    { classes: "", title: "date_of_birth" },
    { classes: "", title: "fitness_goal" },
    { classes: "", title: "activity_level" },
    { classes: "", title: "created_at" },
    { classes: "", title: "updated_at" },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/users",
      lookup: "created_by_id",
      title: "created_by_id",
    },
    {
      classes: "text-blue-500 hover:underline",
      type: "link",
      href: "admin/users",
      lookup: "updated_by_id",
      title: "updated_by_id",
    },
  ];

  const [create, { Form: CreateForm }] = createServerAction$(profileCreate);

  return (
    <main class="p-4">
      <Title>Profile List</Title>

      <div class="">
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">
            Profile List -{" "}
            <Show when={data.profiles()}>
              ({data.profiles().count} Results)
            </Show>
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
                { value: "-updated_at", label: "Updated (desc)" },
                { value: "updated_at", label: "Updated (asc)" },
              ]}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>

        <Show when={data.profiles()}>
          <AutoList
            data={data.profiles().results}
            headers={headers}
            rows={rows}
            checkbox={true}
            url="profiles"
          />
        </Show>
      </div>

      <div class="mt-4 max-w-lg border p-4">
        <h2 class="mb-4 text-xl font-bold">New Profile</h2>
        <Show when={create.error}>
          <pre>{JSON.stringify(create.error, null, 2)}</pre>
        </Show>

        <CreateForm>
          <Select name="user_id" label="User" options={data.userSelect()} />
          <FormSelect name="activity_level" options={activityLevelOptions} />
          <FormSelect name="fitness_goal" options={goalOptions} />
          <FormSelect name="sex" options={sexOptions} />
          <Input name="height" value={180} />
          <Input name="weight" value={100} />
          <Input
            name="date_of_birth"
            label="Date of Birth"
            type="date"
            value={now()}
          />

          <Button loading={create.pending} />
        </CreateForm>
      </div>
      <pre>{JSON.stringify(data.profiles(), null, 2)}</pre>
    </main>
  );
}
