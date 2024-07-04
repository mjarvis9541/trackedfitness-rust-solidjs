import { A } from "solid-start";

type UserIconProps = { params: { username: string } };

export default function UserIcon(props: UserIconProps) {
  return (
    <A
      href={`/users/${props.params.username}`}
      class="grid aspect-square h-10 w-auto select-none place-items-center rounded-full bg-blue-700 text-xl font-semibold capitalize text-white"
    >
      {props.params.username?.charAt(0) || "U"}
    </A>
  );
}
