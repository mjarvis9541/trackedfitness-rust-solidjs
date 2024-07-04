import {
  RouteDataArgs,
  Title,
  useParams,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  const data = createServerData$(getRequest, {
    key: () => [`diet/${params.username}/${params.date}/${params.meal}`],
  });
  return data;
}

export default function DietCopyMealView() {
  const data = useRouteData<typeof routeData>();
  const params = useParams<{ username: string; date: string; meal: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>Copy Meal</Title>
      <h1>DietCopyMealView</h1>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
