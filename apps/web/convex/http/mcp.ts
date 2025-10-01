import { z } from "zod/v3";

import { internal } from "../_generated/api";
import { type ActionCtx, httpAction } from "../_generated/server";

type AuthResult = { ok: true; userId: string } | { ok: false; response: Response };

const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

const pendingWorkRequestSchema = z.object({
  planId: z.string().trim().min(1, "planId is required"),
});

const planDetailsRequestSchema = z.object({
  planId: z.string().trim().min(1, "planId is required"),
});

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS,
  });
}

async function authenticate(apiKey: string | null, ctx: ActionCtx): Promise<AuthResult> {
  if (!apiKey) {
    return {
      ok: false,
      response: json(401, {
        error: "missing_api_key",
        message: "Authorization header with a Bearer Planteria API key is required.",
      }),
    };
  }

  const lookup = await ctx.runQuery(internal.userApiKeys.resolveUserByPlanteriaApiKey, {
    apiKey,
  });

  if (!lookup) {
    return {
      ok: false,
      response: json(401, {
        error: "invalid_api_key",
        message: "Planteria API key is invalid or expired.",
      }),
    };
  }

  return { ok: true, userId: lookup.userId };
}

function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) {
    return null;
  }

  return match[1];
}

export const listPlans = httpAction(async (ctx, request) => {
  const auth = await authenticate(readBearerToken(request), ctx);
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await ctx.runQuery(internal.mcp.latestPlansForUser, {
    userId: auth.userId,
    limit: 5,
  });

  return json(200, payload);
});

export const getPendingWork = httpAction(async (ctx, request) => {
  const auth = await authenticate(readBearerToken(request), ctx);
  if (!auth.ok) {
    return auth.response;
  }

  let parsedBody: z.infer<typeof pendingWorkRequestSchema>;

  try {
    const body = await request.json();
    const result = pendingWorkRequestSchema.safeParse(body);

    if (!result.success) {
      return json(400, {
        error: "invalid_plan_id",
        message: "Body must include a non-empty planId field.",
      });
    }

    parsedBody = result.data;
  } catch (_error) {
    return json(400, {
      error: "invalid_json",
      message: "Request body must be valid JSON.",
    });
  }

  try {
    const pendingWork = await ctx.runQuery(internal.mcp.pendingWorkForPlan, {
      userId: auth.userId,
      planId: parsedBody.planId,
    });
    if (!pendingWork) {
      return json(404, {
        error: "plan_not_found",
        message: "Plan could not be found for the supplied API key.",
      });
    }

    return json(200, pendingWork);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "invalid_plan_id") {
      return json(400, {
        error: "malformed_plan_id",
        message: "planId is not a valid Planteria document id.",
      });
    }

    throw error;
  }
});

export const getPlanDetails = httpAction(async (ctx, request) => {
  const auth = await authenticate(readBearerToken(request), ctx);
  if (!auth.ok) {
    return auth.response;
  }

  let parsedBody: z.infer<typeof planDetailsRequestSchema>;

  try {
    const body = await request.json();
    const result = planDetailsRequestSchema.safeParse(body);

    if (!result.success) {
      return json(400, {
        error: "invalid_plan_id",
        message: "Body must include a non-empty planId field.",
      });
    }

    parsedBody = result.data;
  } catch (_error) {
    return json(400, {
      error: "invalid_json",
      message: "Request body must be valid JSON.",
    });
  }

  try {
    const details = await ctx.runQuery(internal.mcp.planDetailsForUser, {
      userId: auth.userId,
      planId: parsedBody.planId,
    });

    if (!details) {
      return json(404, {
        error: "plan_not_found",
        message: "Plan could not be found for the supplied API key.",
      });
    }

    return json(200, details);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "invalid_plan_id") {
      return json(400, {
        error: "malformed_plan_id",
        message: "planId is not a valid Planteria document id.",
      });
    }

    throw error;
  }
});
