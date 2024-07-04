import { createCookieSessionStorage } from "solid-start";

export const storage = createCookieSessionStorage({
  cookie: {
    name: "user",
    // secure doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: false,
    secrets: ["hello"],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function getUserSession(request: Request) {
  const cookie = request.headers.get("Cookie") ?? "";
  const session = await storage.getSession(cookie);
  return session;
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const username = session.get("userId");
  if (!username || typeof username !== "string") return null;
  return username;
}

export async function getUser(request: Request) {
  const session = await getUserSession(request);
  const user = session.get("user");
  if (!user) return null;
  return user;
}

export async function isSuperuser(request: Request) {
  const session = await getUserSession(request);
  const isSuperuser = session.get("superuser");
  if (!isSuperuser) return false;
  return isSuperuser;
}

export async function getUsername(request: Request) {
  const session = await getUserSession(request);
  const username = session.get("username");
  if (!username || typeof username !== "string") return null;
  return username;
}

export async function getToken(request: Request) {
  const session = await getUserSession(request);
  const token = session.get("token");
  if (!token || typeof token !== "string") return null;
  return token;
}
