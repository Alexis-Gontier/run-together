import { UpdateObjectiveForm } from "@/components/settings";
import { getRequireUser } from "@/lib/auth/auth-session";

export default async function GoalsPage() {
    const user = await getRequireUser();

    return (
        <div className="space-y-6">
            <UpdateObjectiveForm currentObjective={user.monthObjectif ?? null} />
        </div>
    );
}
