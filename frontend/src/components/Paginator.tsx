import { A, useLocation, useSearchParams } from "solid-start";
import { ChevronLeft, ChevronRight } from "./ui/Icon";

type PaginatorProps = {};

export default function Paginator(props: PaginatorProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const next = () => {
    let page = searchParams.page;
    if (page) {
      let page_num = Number(page);
      return `?page=${page_num + 1}`;
    } else return `?page=${2}`;
  };

  const prev = () => {
    let page = searchParams.page;
    if (page) {
      let page_num = Number(page);
      if (page_num === 1) {
        return location.pathname;
      }
      return `?page=${page_num - 1}`;
    } else return location.pathname;
  };

  return (
    <div class="">
      <ul class="flex gap-2">
        <li class="flex">
          <A
            href={location.pathname}
            class="flex items-center justify-center bg-zinc-700 px-4 py-1 hover:bg-zinc-800"
          >
            First
          </A>
        </li>
        <li class="flex">
          <A
            href={prev()}
            class="flex items-center justify-center bg-zinc-700 px-4 py-1 hover:bg-zinc-800"
          >
            <ChevronLeft />
          </A>
        </li>
        <li class="flex">
          <A
            href={next()}
            class="flex items-center justify-center bg-zinc-700 px-4 py-1 hover:bg-zinc-800"
          >
            <ChevronRight />
          </A>
        </li>
      </ul>
    </div>
  );
}
