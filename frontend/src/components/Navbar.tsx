import { For, Show, createSignal } from "solid-js";
import { A } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getUser } from "~/services/sessions";
import { CloseIcon, MenuIcon } from "./ui/Icon";
import NavUserIcon from "./users/NavUserIcon";

export const useSession = () => {
  return createServerData$(
    async (_, { request }) => {
      const user = await getUser(request);
      return user;
    },
    { key: () => ["user"] },
  );
};

export default function Navbar() {
  const [show, setShow] = createSignal(false);
  const user = useSession();

  const navLinks = [
    { href: "/food", name: "Food" },
    { href: "/brands", name: "Brands" },
    { href: "/meals", name: "Meals" },
    { href: "/users", name: "Users" },
    { href: "/admin", name: "Admin" },
    { href: "/michael", name: "Micahq" },
  ];

  return (
    <>
      <div
        class="pointer-events-none fixed z-10 h-full w-full duration-200"
        classList={{ ["bg-black/50"]: show() }}
      />

      <nav class="flex justify-between gap-4 overflow-auto px-4 py-1 ">
        <div class="flex items-center gap-2">
          <button
            class="grid place-self-center p-1 hover:bg-zinc-800"
            onClick={(e) => setShow(!show())}
          >
            <MenuIcon />
          </button>

          <div class="">
            <A class="font-bold hover:text-amber-300" href="/">
              Trackedfitness
            </A>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <ul class="flex gap-4 overflow-auto whitespace-nowrap">
            <For each={navLinks}>
              {(link) => (
                <li>
                  <A class="hover:text-amber-300" href={link.href}>
                    {link.name}
                  </A>
                </li>
              )}
            </For>
          </ul>
          <Show when={user()} fallback={UnauthenticatedNavigation()}>
            <NavUserIcon username={user().username} />
          </Show>
        </div>
      </nav>

      <div
        class="fixed z-10 h-full w-80 bg-zinc-800 duration-200"
        classList={{ ["-translate-x-full"]: !show() }}
      >
        <div class="p-4">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-bold">Trackedfitness</h2>
            <button
              class="grid place-self-center bg-zinc-800 p-1 hover:bg-zinc-700"
              onClick={(e) => setShow(!show())}
            >
              <CloseIcon />
            </button>
            <div>
              <A href="/users/michael/workouts">Workouts</A>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function UnauthenticatedNavigation() {
  return (
    <ul class="flex gap-4 overflow-auto whitespace-nowrap">
      <li>
        <A class="hover:text-amber-300" href="/login">
          Log in
        </A>
      </li>
      <li>
        <A class="hover:text-amber-300" href="/signup">
          Sign Up
        </A>
      </li>
    </ul>
  );
}
