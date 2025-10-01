# AI Usage Caps

Planteria enforces lifetime limits on AI-heavy operations to protect external spend:

- `MAX_PLANS_PER_USER = 3`
  - Checked in `internal.plans.generation.createPlanShell` before inserting a new plan.
  - Counts are stored in `user_ai_usage.plansGenerated` and decremented when a plan is deleted.
- `MAX_PLAN_ADJUSTMENTS_PER_PLAN = 3`
  - Enforced in `planAi.adjustPlan` and `planAi.applyPlanAdjustment` using the `plans.aiAdjustmentsUsed` field.

Update the constants in `lib/limits.ts` if you need to change these ceilings. After modifying the schema or Convex functions, run `pnpm exec convex codegen` to refresh generated types.
