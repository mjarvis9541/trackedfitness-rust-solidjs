import { Show } from "solid-js";
import { A, Title } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { storage } from "~/services/sessions";

async function login(form: FormData, { request }: { request: Request }) {
  const username = form.get("username");
  const password = form.get("password");
  const res = await fetch(`${process.env.API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw await res.json();
  }
  const data = await res.json();

  const session = await storage.getSession();
  session.set("user", {
    user_id: data.user_id,
    username: data.username,
    token: data.token,
    is_superuser: data.is_superuser,
    is_staff: data.is_staff,
    email_verified: data.email_verified,
  });
  session.set("username", data.username);
  session.set("token", data.token);
  session.set("superuser", data.is_superuser);
  session.set("staff", data.is_staff);

  return redirect(`/users/${data.username}`, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export default function Login() {
  const [action, { Form }] = createServerAction$(login);

  return (
    <main class="p-4">
      <Title>Log in</Title>

      <div class="mx-auto max-w-lg">
        <h1 class="mb-4 text-xl font-bold">Log in</h1>
        <Form>
          <Show when={action.error}>
            <pre>{JSON.stringify(action.error, null, 2)}</pre>
          </Show>
          <Input name="username" action={action} />
          <Show when={action.error?.username}>
            <div class="text-sm font-bold text-red-500">
              {action.error?.username}
            </div>
          </Show>
          <Input name="password" type="password" action={action} />
          <Show when={action.error?.password}>
            <div class="text-sm font-bold text-red-500">
              {action.error?.password}
            </div>
          </Show>
          <div class="mt-6">
            <Button label="Log in" loading={action.pending} />
          </div>
        </Form>
        <p class="mt-6">
          <A class="text-blue-500 hover:underline" href="/password-reset">
            Forgot password?
          </A>
        </p>
        <p class="mt-2">
          Need an account?{" "}
          <A class="text-blue-500 hover:underline" href="/signup">
            Create account
          </A>
        </p>
      </div>
    </main>
  );
}
