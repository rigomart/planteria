import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { getPendingWork, getPlanDetails, listPlans } from "./http/mcp";

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

http.route({
	path: "/mcp/plan-details",
	method: "POST",
	handler: getPlanDetails,
});

export default http;
