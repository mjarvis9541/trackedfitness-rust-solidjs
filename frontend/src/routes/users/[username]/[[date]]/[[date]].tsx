import { Outlet } from "solid-start";
import UserDateHeader from "~/components/UserDateHeader";

export default function DateLayout() {
  return (
    <>
      <UserDateHeader />

      <Outlet />
    </>
  );
}
