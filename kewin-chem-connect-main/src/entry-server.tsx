/** Server entry used only by scripts/prerender.mjs at build time. */
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { dehydrate } from "@tanstack/react-query";
import App, { createQueryClient } from "./App";

export { sortOverview } from "@/lib/catalog";
export { INDUSTRIES } from "@/lib/industries";
export * as seo from "@/lib/seo";

/** Render one URL with the given query-cache entries; returns markup and the state to hydrate. */
export function render(url: string, seed: [unknown[], unknown][]) {
  const queryClient = createQueryClient();
  for (const [key, data] of seed) queryClient.setQueryData(key, data);
  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App queryClient={queryClient} />
      </StaticRouter>
    </React.StrictMode>,
  );
  return { html, state: dehydrate(queryClient) };
}
