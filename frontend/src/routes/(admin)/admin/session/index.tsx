import { Title, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { storage } from "~/services/sessions";

export function routeData() {
  return createServerData$(async (key, { request }) => {
    const cookie = request.headers.get("Cookie");
    const session = await storage.getSession(cookie);
    const user = session.get("user");
    const username = session.get("username");
    const token = session.get("token");
    const superuser = session.get("superuser");
    return { user, username, token, superuser };
  });
}

export default function AdminSessionPage() {
  const data = useRouteData<typeof routeData>();
  return (
    <main class="overflow-hidden p-4">
      <Title>Session</Title>
      <h1 class="mb-4 text-xl font-bold">Admin Session Page</h1>
      <pre class="">{JSON.stringify(data(), null, 2)}</pre>
    </main>
  );
}
