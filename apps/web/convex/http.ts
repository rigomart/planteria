import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { getPendingWork, listPlans } from "./http/mcp";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/mcp/list-plans",
  method: "GET",
  handler: listPlans,
});

http.route({
  path: "/mcp/pending-work",
  method: "POST",
  handler: getPendingWork,
});

export default http;
