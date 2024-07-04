import { Outlet } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import AdminNavbar from "~/components/admin/AdminNavbar";
import { getUser } from "~/services/sessions";

export const useSession = () => {
  return createServerData$(
    async (_, { request }) => {
      const user = await getUser(request);
      // console.log("admin checker - check user is of the type super");
      if (!user || (user && user.is_superuser === false)) {
        redirect("/login");
      }
      return user;
    },
    { key: () => ["admin"] },
  );
};

export default function AdminLayout() {
  const user = useSession();

  return (
    <main class="grid grid-cols-12">
      <div class="col-span-2 p-4">
        <AdminNavbar user={user()} />
      </div>
      <div class="col-span-10">
        <Outlet />
      </div>
    </main>
  );
}
