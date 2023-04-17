#!/usr/bin/env -S node -r esbuild-register
import { ActionAPI } from "./src/wiki/api";

const api = new ActionAPI("https://en.wikipedia.org/w/api.php");
api
  .siteinfo({
    prop: ["general", "namespaces", "namespacealiases"],
    origin: "*",
  })
  .then(console.log);
