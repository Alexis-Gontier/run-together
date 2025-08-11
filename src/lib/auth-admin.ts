import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-server";


export async function isAdmin() {
    const session = await getSession();

    return session?.user?.role === "admin";
}

export async function listUsers() {
    const users = await auth.api.listUsers({
        query: {

        },
        headers: await headers(),
    })

    return users
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(newPassword);
  await ctx.internalAdapter.updatePassword(userId, hash);
}

export async function impersonateUser(params: { userId: string }) {
    return await auth.api.impersonateUser({
        body: params,
        headers: await headers(),
    });
}

export async function stopImpersonating() {
    return await auth.api.stopImpersonating({
        headers: await headers(),
    });
}