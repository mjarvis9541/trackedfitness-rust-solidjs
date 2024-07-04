import { For, Show } from "solid-js";
import { A, useLocation } from "solid-start";

export default function AdminNavbar(props: any) {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname ? "bg-amber-300 text-zinc-900" : "";

  const navLink = [
    { href: "/admin", name: "Admin" },
    { href: "/admin/brands", name: "Brands" },
    { href: "/admin/diet", name: "Diet" },
    { href: "/admin/diet-meal-totals", name: "Diet Meal Totals" },
    { href: "/admin/diet-day-totals", name: "Diet Day Totals" },
    { href: "/admin/diet-week-avg", name: "Diet Week Average" },
    { href: "/admin/diet-targets", name: "Diet Targets" },
    { href: "/admin/exercises", name: "Exercises" },
    { href: "/admin/followers", name: "Followers" },
    { href: "/admin/food", name: "Food" },
    { href: "/admin/meal-food", name: "Meal Food" },
    { href: "/admin/meal-of-day", name: "Meal of Day" },
    { href: "/admin/meals", name: "Meals" },
    { href: "/admin/movements", name: "Movements" },
    { href: "/admin/muscle-groups", name: "Muscle Groups" },
    { href: "/admin/profiles", name: "Profiles" },
    { href: "/admin/progress", name: "Progress" },
    { href: "/admin/sets", name: "Sets" },
    { href: "/admin/users", name: "Users" },
    { href: "/admin/workouts", name: "Workouts" },
    { href: "/admin/diet-day-json", name: "Diet-day-json" },
    { href: "/admin/diet-meal-json", name: "Diet-meal-json" },
    { href: "/admin/workout-json", name: "Workout-json" },
    { href: "/admin/meal-json", name: "Meal-json" },
    { href: "/login", name: "Log In" },
    { href: "/logout", name: "Log Out" },
    { href: "/signup", name: "Sign Up" },
    { href: "/admin/activate", name: "Activate" },
    { href: "/admin/session", name: "Session" },
    { href: "/admin/new-brand", name: "Error Boundary Suspense " },
    { href: "/admin/user-stats", name: "User Stats" },
  ];
  return (
    <nav class="border border-zinc-700 p-2">
      <ul class="">
        <For each={navLink}>
          {(link) => (
            <li>
              <A
                class={`block whitespace-nowrap px-3 py-1.5 hover:bg-amber-300 hover:text-zinc-900 ${active(
                  link.href,
                )}`}
                href={link.href}
              >
                {link.name}
              </A>
            </li>
          )}
        </For>
        <li>
          <Show when={props.user}>
            <A
              class={`block whitespace-nowrap px-3 py-1.5 capitalize hover:bg-amber-300 hover:text-zinc-900 ${active(
                `/admin/users/${props.user.user_id}`,
              )}`}
              href={`/admin/users/${props.user.user_id}`}
            >
              {props.user.username}
            </A>
          </Show>
        </li>
      </ul>
    </nav>
  );
}
