// @refresh reload
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import Navbar from "./components/Navbar";
import "./root.css";

// export function routeData() {
//   return createServerData$(async (_, { request }) => {
//     console.log("root data");
//     const user = await getUsername(request);
//     return user;
//   });
// }

export default function Root() {
  // const [user] = createResource(userId, fetchUser);

  return (
    <Html lang="en">
      <Head>
        <Title>Trackedfitness</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* <Body class="bg-zinc-900 text-gray-100"> */}
      <Body class="bg-gray-300 text-gray-900">
        <Suspense>
          <ErrorBoundary>
            <Navbar />
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
