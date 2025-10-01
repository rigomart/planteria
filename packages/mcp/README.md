# @planteria/mcp

A Model Context Protocol (MCP) stdio server that lets MCP-compatible AI clients access your Planteria plans.

It exposes tools to list your latest plans, review pending work, and fetch full plan details. Responses are formatted as Markdown for easy display in chat UIs.

## Requirements

- Node.js 18+
- A Planteria account with an API key

## Install

```bash
# npm
npm install --save-dev @planteria/mcp

# pnpm
pnpm add -D @planteria/mcp

# yarn
yarn add -D @planteria/mcp
```

## Get a Planteria API key

- In Planteria, open Settings → API Keys → Create Key.
- Copy the key and keep it secure.

## Configure an MCP client (Claude Desktop example)

Add a server entry that runs the Node script and passes your API key via env or args.

```json
{
  "mcpServers": {
    "planteria": {
      "command": "node",
      "args": [
        "./node_modules/@planteria/mcp/dist/server.js",
        "--api-key",
        "YOUR_KEY"
      ]
    }
  }
}
```

Any MCP client that supports stdio transports can be configured similarly.

## Exposed tools

- list-plans
  - Title: List Plans
  - Description: Return the latest five plans
  - Input: none
  - Output: Markdown with plan headings, ids, and summaries

- get-pending-work
  - Title: Get Pending Work
  - Description: Return the first incomplete outcome and open deliverables for a plan
  - Input: { "planId": string }
  - Output: Markdown with the active outcome, deliverables, and actions

- get-plan-details
  - Title: Get Plan Details
  - Description: Return the full plan with outcomes and deliverables
  - Input: { "planId": string }
  - Output: Markdown with plan summary, all outcomes, and nested deliverables/actions

## Quick check (manual start)

You can start the server to verify it launches (it will wait for an MCP client on stdio):

```bash
PLANTERIA_API_KEY=your_key node ./node_modules/@planteria/mcp/dist/server.js
```

Then use your MCP client to invoke `list-plans`, and pass a returned `id` to `get-pending-work` or `get-plan-details`.

## Troubleshooting

- 401 Unauthorized: API key missing or invalid. Check `PLANTERIA_API_KEY` or `--api-key`.
- 404 Plan not found: `planId` doesn’t exist for your account or is malformed.
- 400 Malformed plan id: `planId` is not a valid Planteria document id.
- Invalid JSON / network errors: Ensure a stable connection and retry.

## Security

- Treat your API key like a password; do not commit it to source control.
- Rotate from Planteria settings if a key may be exposed.

## License

MIT

## Links

- Repository: https://github.com/rigomart/planteria
- Issues: use the repository issue tracker for questions and problems.
