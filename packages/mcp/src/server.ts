import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const CONVEX_HTTP_BASE = new URL("https://valuable-gopher-881.convex.site");

type CliOptions = {
	apiKey: string;
};

type FetchOptions = {
	method: "GET" | "POST";
	body?: unknown;
	requestId?: string;
};

type LoggerLevel = "info" | "error";

const CLI_SCHEMA = z.object({
	apiKey: z
		.string()
		.min(1, "API key is required. Generate one from Planteria settings and pass --api-key <KEY>"),
});

const LIST_PLANS_SCHEMA = z.object({
	plans: z
		.array(
			z.object({
				id: z.string(),
				title: z.string(),
				summary: z.string(),
			}),
		)
		.max(5),
});

const PENDING_WORK_SCHEMA = z.object({
	plan: z.object({
		id: z.string(),
		title: z.string(),
	}),
	done: z.boolean(),
	outcome: z
		.object({
			title: z.string(),
			summary: z.string(),
		})
		.nullable(),
	deliverables: z.array(
		z.object({
			title: z.string(),
			doneWhen: z.string(),
			notes: z.string().nullable(),
			actions: z.array(
				z.object({
					title: z.string(),
				}),
			),
		}),
	),
	summary: z.object({
		lines: z.array(z.string()),
	}),
});

const PLAN_DETAILS_SCHEMA = z.object({
	plan: z.object({
		id: z.string(),
		title: z.string(),
		summary: z.string(),
	}),
	outcomes: z.array(
		z.object({
			title: z.string(),
			summary: z.string(),
			deliverables: z.array(
				z.object({
					title: z.string(),
					doneWhen: z.string(),
					notes: z.string().nullable(),
					actions: z.array(
						z.object({
							title: z.string(),
						}),
					),
				}),
			),
		}),
	),
});

type ListPlansPayload = z.infer<typeof LIST_PLANS_SCHEMA>;
type PendingWorkPayload = z.infer<typeof PENDING_WORK_SCHEMA>;
type PlanDetailsPayload = z.infer<typeof PLAN_DETAILS_SCHEMA>;

function safeHeadingText(value: string): string {
	const cleaned = value
		.replace(/[\r\n#*_`>|]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return cleaned || "Untitled";
}

function formatParagraph(value: string | null | undefined): string | null {
	if (!value) {
		return null;
	}
	const normalized = value.replace(/\r\n?/g, "\n").trim();
	return normalized ? normalized : null;
}

function formatPlansMarkdown(payload: ListPlansPayload): string {
	const sections: string[] = ["# Plans"];

	if (payload.plans.length === 0) {
		sections.push("No plans found.");
		return sections.join("\n\n");
	}

	for (const plan of payload.plans) {
		const block: string[] = [];
		const headingSource = plan.title || plan.summary;
		block.push(`## ${safeHeadingText(headingSource)}`);
		block.push(`Plan ID: ${plan.id}`);

		const summary = formatParagraph(plan.summary);
		if (summary) {
			block.push("", summary);
		}

		sections.push(block.join("\n"));
	}

	return sections.join("\n\n");
}

function formatPendingWorkMarkdown(payload: PendingWorkPayload): string {
	const sections: string[] = [
		"# Pending Work",
		`Plan ID: ${payload.plan.id}`,
		`Title: ${safeHeadingText(payload.plan.title)}`,
	];

	if (payload.done || !payload.outcome) {
		sections.push("", "All outcomes are complete.");
		return sections.join("\n");
	}

	sections.push("", "## Outcome", safeHeadingText(payload.outcome.title));
	const outcomeSummary = formatParagraph(payload.outcome.summary);
	if (outcomeSummary) {
		sections.push("", outcomeSummary);
	}

	sections.push("", "## Deliverables");
	if (payload.deliverables.length === 0) {
		sections.push("No outstanding deliverables.");
		return sections.join("\n");
	}

	for (const deliverable of payload.deliverables) {
		const block: string[] = [`### ${safeHeadingText(deliverable.title)}`];
		const doneWhen = formatParagraph(deliverable.doneWhen);
		if (doneWhen) {
			block.push("", "Done When:", "```", doneWhen, "```");
		}
		const notes = formatParagraph(deliverable.notes ?? undefined);
		if (notes) {
			block.push("", "Notes:", "```", notes, "```");
		}
		if (deliverable.actions.length > 0) {
			block.push("", "Actions:");
			for (const action of deliverable.actions) {
				block.push(`- ${safeHeadingText(action.title)}`);
			}
		}
		sections.push(block.join("\n"));
	}

	return sections.join("\n\n");
}

function formatPlanDetailsMarkdown(payload: PlanDetailsPayload): string {
	const sections: string[] = [
		"# Plan",
		`Plan ID: ${payload.plan.id}`,
		`Title: ${safeHeadingText(payload.plan.title)}`,
	];

	const summary = formatParagraph(payload.plan.summary);
	if (summary) {
		sections.push("", summary);
	}

	if (payload.outcomes.length === 0) {
		sections.push("", "No outcomes defined.");
		return sections.join("\n");
	}

	for (const outcome of payload.outcomes) {
		const outcomeSection: string[] = ["", `## ${safeHeadingText(outcome.title)}`];
		const outcomeSummary = formatParagraph(outcome.summary);
		if (outcomeSummary) {
			outcomeSection.push("", outcomeSummary);
		}

		if (outcome.deliverables.length === 0) {
			outcomeSection.push("", "No deliverables in this outcome.");
			sections.push(outcomeSection.join("\n"));
			continue;
		}

		for (const deliverable of outcome.deliverables) {
			const deliverableBlock: string[] = [`### ${safeHeadingText(deliverable.title)}`];
			const doneWhen = formatParagraph(deliverable.doneWhen);
			if (doneWhen) {
				deliverableBlock.push("", "Done When:", "```", doneWhen, "```");
			}
			const notes = formatParagraph(deliverable.notes ?? undefined);
			if (notes) {
				deliverableBlock.push("", "Notes:", "```", notes, "```");
			}
			if (deliverable.actions.length > 0) {
				deliverableBlock.push("", "Actions:");
				for (const action of deliverable.actions) {
					deliverableBlock.push(`- ${safeHeadingText(action.title)}`);
				}
			}
			outcomeSection.push(deliverableBlock.join("\n"));
		}

		sections.push(outcomeSection.join("\n\n"));
	}

	return sections.join("\n");
}

class HttpError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly statusText: string,
	) {
		super(message);
		this.name = "HttpError";
	}
}

function parseCliOptions(argv: readonly string[]): CliOptions {
	const parsedPairs: Record<string, string | undefined> = {};
	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (!token.startsWith("--")) continue;

		const [rawKey, rawValue] = token.slice(2).split("=", 2);
		const key = rawKey.trim();
		if (!key) continue;

		if (rawValue !== undefined) {
			parsedPairs[key] = rawValue;
			continue;
		}

		const next = argv[index + 1];
		if (next && !next.startsWith("--")) {
			parsedPairs[key] = next;
			index += 1;
		} else {
			parsedPairs[key] = undefined;
		}
	}

	const result = CLI_SCHEMA.safeParse({
		apiKey: parsedPairs["api-key"] ?? process.env.PLANTERIA_API_KEY,
	});

	if (!result.success) {
		const formatted = result.error.issues.map((issue) => `- ${issue.message}`).join("\n");
		log("error", "startup", "invalid_cli", { details: formatted });
		throw new Error("Invalid CLI arguments. See stderr for details.");
	}

	return result.data;
}

function log(level: LoggerLevel, area: string, message: string, extra?: Record<string, unknown>) {
	const payload = {
		ts: new Date().toISOString(),
		level,
		area,
		message,
		...extra,
	};
	console.error(JSON.stringify(payload));
}

function maskKey(value: string): string {
	if (value.length <= 8) {
		return "****";
	}
	return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

function joinUrl(base: URL, path: string): string {
	if (!path.startsWith("/")) {
		return new URL(path, base).toString();
	}
	const joined = new URL(base.toString());
	joined.pathname = `${joined.pathname.replace(/\/$/, "")}${path}`;
	return joined.toString();
}

async function callConvex<T>(
	options: CliOptions,
	schema: z.ZodSchema<T>,
	path: string,
	fetchOptions: FetchOptions,
): Promise<T> {
	const requestId = fetchOptions.requestId ?? randomUUID();
	const url = joinUrl(CONVEX_HTTP_BASE, path);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
		Authorization: `Bearer ${options.apiKey}`,
		"X-Request-Id": requestId,
	};

	const response = await fetch(url, {
		method: fetchOptions.method,
		headers,
		body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : undefined,
	});

	const text = await response.text();
	let json: unknown;
	try {
		json = text ? JSON.parse(text) : {};
	} catch (error) {
		throw new HttpError(
			"Convex returned an invalid JSON payload",
			response.status,
			response.statusText,
		);
	}

	if (!response.ok) {
		const message =
			typeof json === "object" &&
			json !== null &&
			"message" in json &&
			typeof json.message === "string"
				? json.message
				: response.statusText || "Unknown error";
		throw new HttpError(message, response.status, response.statusText);
	}

	return schema.parse(json);
}

async function main() {
	const cliOptions = parseCliOptions(process.argv.slice(2));

	log("info", "startup", "options", {
		convexUrl: CONVEX_HTTP_BASE.toString(),
		apiKey: maskKey(cliOptions.apiKey),
	});

	const server = new McpServer({
		name: "planteria",
		version: "0.1.0",
	});

	server.registerTool(
		"list-plans",
		{
			title: "List Plans",
			description: "Return the latest five plans.",
			inputSchema: {},
		},
		async () => {
			try {
				const payload = await callConvex(cliOptions, LIST_PLANS_SCHEMA, "/mcp/list-plans", {
					method: "GET",
				});

				return {
					content: [{ type: "text", text: formatPlansMarkdown(payload) }],
				};
			} catch (error) {
				log("error", "list-plans", "failed", serializeError(error));
				return {
					isError: true,
					content: [
						{
							type: "text",
							text: `list-plans failed: ${humanizeError(error)}`,
						},
					],
				};
			}
		},
	);

	server.registerTool(
		"get-pending-work",
		{
			title: "Get Pending Work",
			description: "Return the first incomplete outcome and open deliverables for a plan.",
			inputSchema: {
				planId: z.string().min(1, "planId is required"),
			},
		},
		async ({ planId }) => {
			try {
				const payload = await callConvex(cliOptions, PENDING_WORK_SCHEMA, "/mcp/pending-work", {
					method: "POST",
					body: { planId },
				});

				return {
					content: [{ type: "text", text: formatPendingWorkMarkdown(payload) }],
				};
			} catch (error) {
				log("error", "get-pending-work", "failed", serializeError(error));
				return {
					isError: true,
					content: [
						{
							type: "text",
							text: `get-pending-work failed: ${humanizeError(error)}`,
						},
					],
				};
			}
		},
	);

	server.registerTool(
		"get-plan-details",
		{
			title: "Get Plan Details",
			description: "Return the full plan with outcomes and deliverables.",
			inputSchema: {
				planId: z.string().min(1, "planId is required"),
			},
		},
		async ({ planId }) => {
			try {
				const payload = await callConvex(cliOptions, PLAN_DETAILS_SCHEMA, "/mcp/plan-details", {
					method: "POST",
					body: { planId },
				});

				return {
					content: [{ type: "text", text: formatPlanDetailsMarkdown(payload) }],
				};
			} catch (error) {
				log("error", "get-plan-details", "failed", serializeError(error));
				return {
					isError: true,
					content: [
						{
							type: "text",
							text: `get-plan-details failed: ${humanizeError(error)}`,
						},
					],
				};
			}
		},
	);

	const transport = new StdioServerTransport();
	await server.connect(transport);

	process.on("unhandledRejection", (reason) => {
		log("error", "process", "unhandled_rejection", { reason: String(reason) });
	});

	process.on("uncaughtException", (error) => {
		log("error", "process", "uncaught_exception", serializeError(error));
	});
}

function serializeError(error: unknown): Record<string, unknown> {
	if (error instanceof HttpError) {
		return {
			status: error.status,
			statusText: error.statusText,
			message: error.message,
		};
	}
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		};
	}
	return { message: String(error) };
}

function humanizeError(error: unknown): string {
	if (error instanceof HttpError) {
		if (error.status === 401) {
			return "Planteria API key is missing or invalid.";
		}
		if (error.status === 404) {
			return "Resource not found for the provided input.";
		}
		return `${error.status} ${error.statusText}: ${error.message}`;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}

await main();
