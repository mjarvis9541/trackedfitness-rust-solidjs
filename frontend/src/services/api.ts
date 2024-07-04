import { Params } from "@solidjs/router";
import { ServerFunctionEvent, redirect } from "solid-start";
import { getToken } from "./sessions";

export async function getRequest(
  key: (string | Params)[],
  event: ServerFunctionEvent,
) {
  let url = new URL(`${process.env.API}/${key[0]}`);
  let query = key.find((obj) => typeof obj === "object" && obj !== null);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== void 0) {
        url.searchParams.set(key, value as string);
      }
    });
  }
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = await getToken(event.request);
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    if (res.status === 401) {
      console.log(res.status);
      console.log(res.statusText);
      return redirect("/login");
    }
    if (res.status === 400) throw await res.json();
    if (res.status === 422) throw await res.json();
    if (res.status === 404) return null;
    if (res.status === 405) {
      throw new Error(`Request failed with status: ${res.statusText}`);
    }
    if (res.status === 500) {
      throw new Error(`Request failed with status: ${res.statusText}`);
    }
  }
  return await res.json();
}

export async function postRequest(
  request: Request,
  path: string,
  postData: object,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = await getToken(request);
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${process.env.API}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    if (res.status === 400) throw await res.json();
    if (res.status === 401) return redirect("/login");
    if (res.status === 403) return redirect("/login");
    if (res.status === 404) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    if (res.status === 405) {
      throw new Error(`Request failed with status: ${res.statusText}`);
    }
    if (res.status === 422) throw await res.json();
    if (res.status === 500) throw await res.json();
    throw await res.json();
  }
  return await res.json();
}

export async function putRequest(
  request: Request,
  path: string,
  postData: any,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = await getToken(request);
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${process.env.API}/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    if (res.status === 400) throw await res.json();
    if (res.status === 401) return redirect("/login");
    if (res.status === 403) return redirect("/login");
    if (res.status === 404) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    if (res.status === 405) {
      throw new Error(`Request failed with status: ${res.statusText}`);
    }
    if (res.status === 422) throw await res.json();
    if (res.status === 500) throw await res.json();
    throw await res.json();
  }
  return await res.json();
}

export async function deleteRequest(request: Request, path: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = await getToken(request);
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${process.env.API}/${path}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    if (res.status === 400) throw await res.json();
    if (res.status === 401) return redirect("/login");
    if (res.status === 403) return redirect("/login");
    if (res.status === 404) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    if (res.status === 405) {
      throw new Error(`Request failed with status: ${res.statusText}`);
    }
    if (res.status === 422) throw await res.json();
    if (res.status === 500) throw await res.json();
    throw await res.json();
  }
  return await res.json();
}

export async function deleteMultiRequest(
  request: Request,
  path: string,
  postData: object,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = await getToken(request);
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${process.env.API}/${path}/delete-id-range`, {
    method: "DELETE",
    headers,
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    if (res.status === 400) throw await res.json();
    if (res.status === 401) return redirect("/login");
    if (res.status === 403) return redirect("/login");
    if (res.status === 404) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    if (res.status === 405) {
      throw new Error(`Request failed with status: ${res.statusText}`);
    }
    if (res.status === 422) throw await res.json();
    if (res.status === 500) throw await res.json();
    throw await res.json();
  }
  return await res.json();
}

export async function deleteWithDataRequest(
  request: Request,
  path: string,
  postData: object,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = await getToken(request);
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${process.env.API}/${path}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    if (res.status === 400) throw await res.json();
    if (res.status === 401) return redirect("/login");
    if (res.status === 403) return redirect("/login");
    if (res.status === 404) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    if (res.status === 405) {
      throw new Error(`Request failed with status: ${res.statusText}`);
    }
    if (res.status === 422) throw await res.json();
    if (res.status === 500) throw await res.json();
    throw await res.json();
  }
  return await res.json();
}

export async function APIMutation(
  request: Request,
  path: string,
  method: string,
  data: object,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = await getToken(request);
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${process.env.API}/${path}`, {
    method: method || "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 400) throw await res.json();
    if (res.status === 401) return redirect("/login");
    if (res.status === 403) return redirect("/login");
    if (res.status === 404) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    if (res.status === 405) {
      throw new Error(`Request failed with status: ${res.statusText}`);
    }
    if (res.status === 422) throw await res.json();
    if (res.status === 500) throw await res.json();
    throw await res.json();
  }
  return await res.json();
}
