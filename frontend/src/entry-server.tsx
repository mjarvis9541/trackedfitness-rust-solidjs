import { redirect } from "solid-start";
import {
  createHandler,
  renderAsync,
  StartServer,
} from "solid-start/entry-server";
import { getUser } from "./services/sessions";

const protectedPaths = ["/admin"];

export default createHandler(
  ({ forward }) => {
    return async (event) => {
      // console.log("running middleware");
      if (protectedPaths.includes(new URL(event.request.url).pathname)) {
        const user = await getUser(event.request);
        if (user !== null) event.locals["user"] = user;

        if (!user) {
          return redirect("/"); // a page for a non logged in user
        }
      }
      return forward(event); // if we got here, and the pathname is inside the `protectedPaths` array - a user is logged in
    };
  },
  renderAsync((event) => <StartServer event={event} />),
);
