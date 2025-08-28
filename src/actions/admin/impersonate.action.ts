"use server"

import { impersonateUser } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";

export async function impersonate(userId: string) {
    try {
        await impersonateUser({ userId })
        revalidatePath("/dashboard/admin")

        return {
            success: true,
            message: "Successfully retrieved users",
        }
    } catch (error) {
        const e = error as Error
        return {
            success: false,
            message: e.message,
        }
    }
}