#!/usr/bin/env bun
import { promises as fs } from "node:fs";
import openApiTS from "openapi-typescript";
import { getJSON } from "./fetch";

const json = await getJSON("https://en.wikipedia.org/api/rest_v1/", { spec: true });
const contents = await openApiTS(json);
await fs.writeFile(
  "./src/wiki/rest.d.ts",
  contents.replace("interface paths", "interface MediawikiRESTPaths")
);
