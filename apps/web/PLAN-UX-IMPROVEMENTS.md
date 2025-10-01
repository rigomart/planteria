# Workspace Layout & Responsive Behavior

## Goals
- Maintain a three-column desktop workspace where the outline stays central.
- Treat the AI assistant (left) as a contextual tool and the markdown preview (right) as secondary output.
- Provide mobile/tablet users with quick toggles to access assistant and preview without overwhelming the viewport.

## Key Changes

1. **Desktop Enhancements**
   - Keep current three-column flex layout, binding the assistant to the selected outline node while keeping the preview focused on the full plan.
   - Add sticky column headers with quick actions (“Open history”, “Export markdown”).
   - Allow resizing of assistant/preview columns via CSS grid or draggable split view (optional stretch goal).

2. **Mobile / Tablet Strategy**
   - Switch root container to column layout below `lg`. The outline occupies the main scrollable area.
   - Surface two primary affordances:
     - `Adjust with AI` button → opens a sheet/drawer with the assistant, scoped to the selected node or whole plan.
     - `Preview` button → opens a second sheet displaying markdown preview with export actions.
   - Optionally, add a compact segmented control (`Plan | AI | Preview`) for medium breakpoints.

3. **Assistant Integration**
   - Display active context (plan/outcome/deliverable) and a history of applied adjustments with timestamps.
   - Provide quick prompt templates (rewrite section, expand actions) and show loading/confirmation states when auto-applying changes.

4. **Markdown Preview**
   - Render live markdown for the entire plan using a deterministic template.
   - Optionally auto-scroll/highlight the selected node’s section without hiding the rest of the content.
   - Include export buttons (copy markdown, download `.md`, share link placeholder).

## Implementation Steps

1. Convert workspace container to responsive CSS grid/flex with breakpoint-driven layout switches.
2. Implement mobile sheets for assistant/preview; expose triggers in a sticky toolbar above the outline.
3. Create context bridge so assistant requests know the active node and can call Convex mutations when auto-applying changes.
4. Build markdown generation helper in `src/lib/plan-markdown.ts` and render via `react-markdown` (or similar) in the preview panel.
5. Wire export actions (copy, download) and add telemetry/logging for assistant usage.
6. Test on desktop, iPad, and small phone viewports; verify column toggles, sheet interactions, and markdown sync.

## Validation & Rollout
- Run `pnpm lint` and manual smoke tests for outline edits, assistant interactions, and markdown rendering.
- Capture before/after screen recordings for desk + mobile to document improvements.
- Prepare release notes highlighting new focused editing flow, AI assistant integration, and responsive access to preview.
