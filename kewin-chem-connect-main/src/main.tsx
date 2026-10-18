import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { hydrate, type DehydratedState } from "@tanstack/react-query";
import App, { createQueryClient } from "./App.tsx";
import "./index.css";

declare global {
  interface Window { __RQ_STATE__?: DehydratedState }
}

const queryClient = createQueryClient();
// Pages pre-rendered at build time ship their data, so the browser doesn't fetch it again.
if (window.__RQ_STATE__) hydrate(queryClient, window.__RQ_STATE__);

const root = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App queryClient={queryClient} />
    </BrowserRouter>
  </React.StrictMode>
);

if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
