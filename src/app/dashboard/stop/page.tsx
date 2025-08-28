import { Button } from "@/components/shadcn-ui/button";
import { stopImpersonating } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function page() {

    return (
        <form>
            <Button
                formAction={async () => {
                    'use server'
                    await stopImpersonating();
                    revalidatePath('/dashboard/admin');
                    redirect('/dashboard/admin');
                }}
                className="cursor-pointer"
            >
                Arrêter l&apos;imitation
            </Button>
        </form>
    )
}