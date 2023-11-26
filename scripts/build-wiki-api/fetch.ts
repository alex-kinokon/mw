import fs from "node:fs";
import { resolve } from "node:path";

const Cache = {
  resolve(url: string) {
    return resolve(__dirname, "../../.cache", encodeURIComponent(url));
  },
  has(url: string) {
    return fs.existsSync(Cache.resolve(url));
  },
  get(url: string): Record<string, any> | undefined {
    if (Cache.has(url)) {
      const path = Cache.resolve(url);
      return JSON.parse(fs.readFileSync(path, "utf-8"));
    }
  },
  set(url: string, data: Record<string, any>) {
    fs.writeFileSync(Cache.resolve(url), JSON.stringify(data, null, 2));
    return data;
  },
};

export async function getJSON<T = any>(host: string, options: Record<string, any>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    params.append(key.toLowerCase(), value);
  }

  const url = `${host}?${params}`;

  if (Cache.has(url)) {
    return Cache.get(url) as T;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const result = (await res.json()) as T;
  Cache.set(url, result as any);
  return result;
}
