import { For, Match, Show, Switch } from "solid-js";
import { A } from "solid-start";
import Checkbox from "../ui/Checkbox";
import { RowProps } from "./AutoList";

type AutoListItemProps = {
  checkbox?: boolean;
  rows: RowProps[];
  data: any;
  checked: any;
  setChecked: any;
};

export default function AutoListItem(props: AutoListItemProps) {
  return (
    <For each={props.data}>
      {(row) => (
        <div class="group contents">
          <Show when={props.checkbox}>
            <div
              class={`truncate border-b-[1px] border-zinc-700 p-2 group-hover:bg-amber-300`}
            >
              <Checkbox
                checked={props.checked}
                setChecked={props.setChecked}
                data={row}
              />
            </div>
          </Show>

          <For each={props.rows}>
            {(item) => (
              <>
                <Switch>
                  <Match when={item.type === "link"}>
                    <A
                      href={`/${item.href}/${row[item.lookup!]}`}
                      class={`truncate border-b-[1px] border-zinc-700 p-2 group-hover:bg-amber-300 ${item.classes}`}
                    >
                      {row[item.title]}
                    </A>
                  </Match>
                  <Match when={item.type === "bool"}>
                    <div
                      class={`truncate border-b-[1px] border-zinc-700 p-2 group-hover:bg-amber-300 ${item.classes}`}
                    >
                      {row[item.title].toString()}
                    </div>
                  </Match>
                  <Match when={item.type === "number"}>
                    <div
                      class={`truncate border-b-[1px] border-zinc-700 p-2 group-hover:bg-amber-300 ${item.classes}`}
                    >
                      {Number(row[item.title]).toFixed(2)}
                    </div>
                  </Match>
                  <Match when={!item.type}>
                    <div
                      class={`truncate border-b-[1px] border-zinc-700 p-2 group-hover:bg-amber-300 ${item.classes}`}
                    >
                      {row[item.title]}
                    </div>
                  </Match>
                </Switch>
              </>
            )}
          </For>
        </div>
      )}
    </For>
  );
}
