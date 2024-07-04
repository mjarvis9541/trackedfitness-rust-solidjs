import { Show } from "solid-js";
import { Title } from "solid-start";
import { ServerFunctionEvent, createServerAction$ } from "solid-start/server";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";

async function actionActivate(form: FormData, event: ServerFunctionEvent) {
  console.log(event);
}

export default function ActivatePage() {
  const [action, { Form }] = createServerAction$(actionActivate);
  return (
    <main class="p-4">
      <Title>Activate Account</Title>
      <h1>Activate Account</h1>
      <Form>
        <Show when={action.error}>
          <pre>{JSON.stringify(action.error, null, 2)}</pre>
        </Show>
        <Input name="token" />
        <Button />
      </Form>
    </main>
  );
}
