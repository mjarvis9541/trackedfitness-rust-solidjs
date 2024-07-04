import { Title, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import Button from "~/components/ui/Button";
import { storage } from "~/services/sessions";

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
export function routeData() {
  return createServerData$(async (_, { request }) => {
    return {};
  });
}

export default function Logout() {
  const user = useRouteData<typeof routeData>();
  const [action, { Form }] = createServerAction$((f: FormData, { request }) =>
    logout(request),
  );
  return (
    <main class="p-4">
      <Title>Log out</Title>
      <div class="mx-auto max-w-lg">
        <h1 class="mb-4 text-xl font-bold">Log out</h1>
        <p class="mb-6">Are you sure you wish to log out?</p>
        <Form>
          <div class="">
            <Button label="Log out" disabled={action.pending} />
          </div>
        </Form>
      </div>
    </main>
  );
}
