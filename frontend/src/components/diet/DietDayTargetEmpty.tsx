import { A } from "solid-start";

export type DietDayTargetEmptyProps = {
  username: string;
  date: string;
};

export default function DietDayTargetEmpty(props: DietDayTargetEmptyProps) {
  return (
    <div class="contents">
      <div class="col-span-full bg-zinc-800 p-2 text-amber-400">
        <A
          class="hover:underline"
          href={`/users/${props.username}/diet-target/create?date=${props.date}`}
        >
          Set up diet target
        </A>
      </div>
    </div>
  );
}
