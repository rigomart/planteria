import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

export const updateUserPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await createAuth(ctx).api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers: await authComponent.getHeaders(ctx),
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
