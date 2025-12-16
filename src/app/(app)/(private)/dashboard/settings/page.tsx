import { UpdateEmailForm, UpdatePasswordForm, UpdateAvatar } from "@/components/settings";
import { getRequireUser } from "@/lib/auth/auth-session";

export default async function page() {
    const user = await getRequireUser();

    return (
        <div className="space-y-6">
            <UpdateAvatar />
            <UpdateEmailForm currentEmail={user.email} />
            <UpdatePasswordForm />
        </div>
    )
}
