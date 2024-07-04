import { Show } from "solid-js";
import { A, RouteDataArgs, Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import FoodDetail from "~/components/food/FoodDetail";
import { getRequest } from "~/services/api";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(getRequest, { key: () => [`diet/${params.id}`] });
}

export default function DietDetailPage() {
  const data = useRouteData<typeof routeData>();

  return (
    <main class="p-4">
      <Title>Diet Detail</Title>

      <div class="max-w-lg border bg-zinc-800 p-4">
        <Show when={data()}>
          <h1 class="text-xl font-bold hover:underline">
            <A href={`/food/${data().food_slug}`}>
              {data().food_name}, {data().data_value}
              {data().data_measurement}
            </A>
          </h1>

          <p class="mb-4 font-bold text-gray-500 hover:underline">
            <A href={`/brands/${data().brand_slug}`}>{data().brand_name}</A>
          </p>

          <h2 class="mb-2 font-bold">Nutrition Information</h2>
          <div class="mb-4 max-w-lg">
            <FoodDetail data={data()} />
          </div>
        </Show>
        <p>
          <A href="edit">Edit</A>
        </p>
        <p>
          <A href="delete">Delete</A>
        </p>
      </div>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
