export async function request(
  endpoint: string,
  method: "GET" | "POST",
  payload?: Record<string, any>
) {
  let url = `${endpoint}`;
  let body: string | undefined;

  if (payload) {
    switch (method) {
      case "GET":
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(payload)) {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              params.append(key.toLowerCase(), value.join("|"));
            } else {
              params.append(key.toLowerCase(), String(value));
            }
          }
        }
        url += `?${params}`;
        break;

      case "POST":
        body = JSON.stringify(payload);
        break;

      default:
        // eslint-disable-next-line rules/restrict-template-expressions
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (body != null) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { method, headers, body });
  return res;
}

export async function requestJSON<T = unknown>(
  endpoint: string,
  method: "GET" | "POST",
  payload?: Record<string, any>
) {
  const res = await request(endpoint, method, payload);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const json = await res.json();

  if ("error" in json) {
    const error = new Error(json.error!.info) as Error & { code: string };
    error.code = json.error.code;
    throw error;
  }
  if ("warnings" in json) {
    console.warn(json.warnings[payload?.action as string] ?? json.warnings);
  }

  return json as T;
}
