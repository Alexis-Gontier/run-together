import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const user = session.user;
    return user;
}

export async function getRequireUser() {
    const user = await getUser();

    if (!user) {
        unauthorized();
    }

    return user;
}