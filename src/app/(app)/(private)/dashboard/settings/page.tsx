import { UpdateEmailForm, UpdatePasswordForm } from "@/components/settings";
import { getRequireUser } from "@/lib/auth/auth-session";

export default async function page() {
    const user = await getRequireUser();

    return (
        <>
            <UpdateEmailForm currentEmail={user.email} />
            <UpdatePasswordForm />
        </>
    )
}
