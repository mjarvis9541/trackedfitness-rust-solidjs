import { A } from "solid-start";

type LinkBtnProps = {
  href: string;
  label: string;
};

export default function LinkBtn(props: LinkBtnProps) {
  return (
    <A
      class="inline-block bg-zinc-700 px-4 py-1.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
      href={props.href}
    >
      {props.label}
    </A>
  );
}
