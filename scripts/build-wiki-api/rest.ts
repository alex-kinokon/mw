#!/usr/bin/env bun
import fs from "node:fs";
import openapiTS from "openapi-typescript";
import { getJSON } from "./fetch";

const json = await getJSON("https://en.wikipedia.org/api/rest_v1/", { spec: true });
const contents = await openapiTS(json);
fs.writeFileSync(
  "./src/wiki/rest.d.ts",
  contents.replace("interface paths", "interface MediawikiRESTPaths")
);
