import { A, Title } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";

export default function SignUpPage() {
  const [_, { Form }] = createServerAction$(async (form: FormData) => {
    const name = form.get("name");
    const email = form.get("email");
    const username = form.get("username");
    const password = form.get("password");
    const res = await fetch(`${process.env.API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, password }),
    });
    if (!res.ok) return { errors: await res.json() };

    return redirect("/activate");
  });

  return (
    <main class="p-4">
      <Title>Sign up</Title>
      <div class="mx-auto max-w-lg">
        <h1 class="mb-4 text-xl font-bold">Create account</h1>
        <Form>
          <Input name="name" />
          <Input name="email" type="email" />
          <Input name="username" />
          <Input name="password" type="password" />
          <Button label="Confirm Email" />
        </Form>
        <p class="mt-6">
          Already have an account?{" "}
          <span>
            <A class="text-blue-500 hover:underline" href="/login">
              Log in
            </A>
          </span>
        </p>
      </div>
    </main>
  );
}
