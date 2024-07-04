import { For } from "solid-js";
import {
  A,
  RouteDataArgs,
  Title,
  useRouteData,
  useSearchParams,
} from "solid-start";
import { createServerData$ } from "solid-start/server";
import Paginator from "~/components/Paginator";
import Filter from "~/components/ui/Filter";
import GridHeader from "~/components/ui/GridHeader";
import LinkBtn from "~/components/ui/LinkBtn";
import Search from "~/components/ui/Search";
import { getRequest } from "~/services/api";
import { brandSortOptions } from "~/utils/constants";

type Brand = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  food_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  created_by_id: string;
  updated_by_id: string;
};

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(getRequest, {
    key: () => [
      "brands",
      location.query,
      location.query["search"],
      location.query["order"],
      location.query["page"],
      location.query["size"],
    ],
  });
}

export default function BrandListPage() {
  const data = useRouteData<typeof routeData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const headers = [
    { class: "", title: "Brand" },
    { class: "", title: "Food" },
    { class: "", title: "Created By" },
    { class: "", title: "Updated By" },
    { class: "", title: "Created" },
    { class: "", title: "Updated" },
    { class: "", title: "Edit" },
    { class: "", title: "Delete" },
  ];
  return (
    <main class="p-4">
      <Title>Brands</Title>

      <div class="p-4">
        <div class="mb-4 flex items-start justify-between">
          <h1 class="text-xl font-bold">Brands</h1>
          <div class="flex gap-2">
            <LinkBtn href="/food/create" label="New Food" />
            <LinkBtn href="/brands/create" label="New Brand" />
            <LinkBtn href="/meals/create" label="New Meal" />
          </div>
        </div>

        <div class="mb-4 flex gap-2">
          <div class="flex-1">
            <Search
              name="search"
              label="Search"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
          <div class="flex-1"></div>
          <div class="flex-1"></div>
          <div class="flex-1">
            <Filter
              name="order"
              label="Sort"
              options={brandSortOptions}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>
        <Paginator />
        <div class="grid grid-cols-8">
          <GridHeader headers={headers} />
          <For each={data()}>{(data) => <BrandListItem data={data} />}</For>
        </div>
        <Paginator />
      </div>
    </main>
  );
}

type BrandListItemProps = {
  data: Brand;
};

function BrandListItem(props: BrandListItemProps) {
  return (
    <div class="group contents">
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          href={`/brands/${props.data.slug}`}
          class="text-blue-500 hover:underline"
        >
          {props.data.name}
        </A>
      </div>
      <div class="p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A href={`/food?brand=${props.data.slug}`} class="hover:underline">
          {props.data.food_count}
        </A>
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          class="text-blue-500 hover:underline"
          href={`/users/${props.data.created_by}`}
        >
          {props.data.created_by}
        </A>
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          class="text-blue-500 hover:underline"
          href={`/users/${props.data.updated_by}`}
        >
          {props.data.updated_by}
        </A>
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.created_at}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        {props.data.updated_at}
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          class="text-blue-500 hover:underline"
          href={`${props.data.slug}/edit`}
        >
          Edit
        </A>
      </div>
      <div class="truncate p-2 group-odd:bg-zinc-800 group-hover:bg-amber-300">
        <A
          class="text-blue-500 hover:underline"
          href={`${props.data.slug}/delete`}
        >
          Delete
        </A>
      </div>
    </div>
  );
}
