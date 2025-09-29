# Plan Outline & Workspace UX Improvements

This plan covers two areas we identified:

1. Tightening the plan outline experience (outcomes → deliverables → actions) so it scales, stays readable, and reinforces Planteria’s guardrails.
2. Reshaping the workspace layout/columns so desktop remains primary while mobile users can still reach the AI assistant and markdown preview without friction.

---

## 1. Plan Outline Experience

### 1.1 Goals
- Make large plans scannable without losing context for nested items.
- Reduce visual noise from inline editors while preserving explicit save/cancel affordances.
- Surface guardrails and status cues so users understand what’s missing.
- Prepare the outline to integrate tightly with the AI assistant (auto-apply adjustments, contextual targeting).

### 1.2 Key Changes

1. **Selection & Focus Model**
   - Introduce a `selectedNode` state (plan > outcome > deliverable > action).
   - Highlight the active node, collapse siblings by default, and ensure keyboard navigation works.
   - Emit selection events so the AI assistant and preview can stay in sync.

2. **Progressive Disclosure**
   - Outcomes render collapsed with counts (`Outcome 2 • 3 deliverables • 7 actions`).
   - Deliverables show title/status inline; details (doneWhen, notes, actions) move into a disclosure panel or side editor.
   - Persist collapse state per outline item in local state (and eventually user prefs).

3. **Streamlined Inline Editing**
   - Hide `Editable` toolbars until the field is active; replace check/cancel icons with compact badge-style buttons or auto-save on blur where safe.
   - Add quick placeholders (“Use AI to draft summary”) that directly open the assistant with pre-filled prompts.

4. **Status & Guardrail Indicators**
   - Summary row per outcome showing completion percentage (e.g., actions done / total).
   - Empty-state banners nudging users to add missing deliverables/actions.
   - Visual distinction between AI-generated vs. user-edited content (e.g., badge or subtle shimmer until user confirms).

5. **Mutation Integration**
   - Replace `console.log` stubs with real Convex mutations for outcomes/deliverables.
   - Ensure optimistic updates mirror the approach in `plan-actions.tsx` and update plan `updatedAt` timestamps.

### 1.3 Implementation Steps

1. Build outline state container (selected node, collapsed map, counts) using React context or Zustand.
2. Refactor `OutcomeSection` / `DeliverableItem` to consume the state container and emit selection events.
3. Update `EditableField` to delay toolbar rendering and support optional auto-save.
4. Add computed summary badges (counts, progress) and empty-state helpers.
5. Wire Convex mutations for titles/summaries/status with optimistic flows; add error toasts.
6. QA with seeded plans of varying sizes; document manual verification steps (collapsing, selection sync, AI prompt shortcuts).

---

## 2. Workspace Layout & Responsive Behavior

### 2.1 Goals
- Maintain a three-column desktop workspace where the outline stays central.
- Treat the AI assistant (left) as a contextual tool and the markdown preview (right) as secondary output.
- Provide mobile/tablet users with quick toggles to access assistant and preview without overwhelming the viewport.

### 2.2 Key Changes

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

### 2.3 Implementation Steps

1. Convert workspace container to responsive CSS grid/flex with breakpoint-driven layout switches.
2. Implement mobile sheets for assistant/preview; expose triggers in a sticky toolbar above the outline.
3. Create context bridge so assistant requests know the active node and can call Convex mutations when auto-applying changes.
4. Build markdown generation helper in `src/lib/plan-markdown.ts` and render via `react-markdown` (or similar) in the preview panel.
5. Wire export actions (copy, download) and add telemetry/logging for assistant usage.
6. Test on desktop, iPad, and small phone viewports; verify column toggles, sheet interactions, and markdown sync.

---

## 3. Validation & Rollout
- Run `pnpm lint` and manual smoke tests for outline edits, assistant interactions, and markdown rendering.
- Capture before/after screen recordings for desk + mobile to document improvements.
- Prepare release notes highlighting new focused editing flow, AI assistant integration, and responsive access to preview.
