import { ErrorBoundary, Suspense } from "solid-js";
import {
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import Filter from "~/components/ui/Filter";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";

export function routeData({ location }: RouteDataArgs) {
  const brands = createServerData$(getRequest, {
    key: () => [
      "brands/new",
      location.query,
      location.query["search"],
      location.query["username"],
      location.query["order"],
      location.query["page"],
      location.query["date"],
      location.query["size"],
    ],
  });
  const workout = createServerData$(getRequest, {
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

  return { brands, workout };
}

export default function NewBrandListPage() {
  const { brands, workout } = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main class="p-4">
      <Title>New Page</Title>

      <div class="flex border border-zinc-700 p-4">
        <div class="flex-1">
          <Search
            name="search"
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </div>
        <div class="flex-1">
          <Filter
            name="order"
            options={[
              { value: "name", label: "Name (A-z)" },
              { value: "-name", label: "Name (Z-a)" },
            ]}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </div>
      </div>

      <div class="grid grid-cols-12">
        <div class="col-span-4">
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary
              fallback={(err, reset) => (
                <ErrorComponent err={err} reset={reset} />
              )}
            >
              <pre>{JSON.stringify(brands(), null, 2)}</pre>
            </ErrorBoundary>
          </Suspense>
        </div>
        <div class="col-span-4">
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary
              fallback={(err, reset) => (
                <ErrorComponent err={err} reset={reset} />
              )}
            >
              <pre>{JSON.stringify(workout(), null, 2)}</pre>
            </ErrorBoundary>
          </Suspense>
        </div>
        <div class="col-span-4"></div>
      </div>
    </main>
  );
}

function ErrorComponent(props: any) {
  return (
    <div class="p-4">
      <h2>There has been an error!</h2>
      <pre>{props.err.toString()}</pre>
    </div>
  );
}
