import { createSafeActionClient } from "next-safe-action";
import { getRequireUser } from "@/lib/auth/auth-session";

export const actionClient = createSafeActionClient();

export const authActionClient = actionClient.use(async ({ next }) => {
    const user = await getRequireUser();

    return next({
        ctx: {
            user,
        },
    });
});