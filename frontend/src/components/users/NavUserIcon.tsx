import { A } from "solid-start";

type NavUserIconProps = {
  username: string | null | undefined;
};

export default function NavUserIcon(props: NavUserIconProps) {
  return (
    <A
      href={`/users/${props.username}`}
      class="grid h-8 w-8 select-none place-items-center rounded-full bg-blue-700 font-semibold capitalize text-white hover:bg-blue-800"
    >
      {props.username?.charAt(0) || "U"}
    </A>
  );
}
