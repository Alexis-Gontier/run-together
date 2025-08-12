import { Alert, AlertTitle, AlertDescription } from "@/components/shadcn-ui/alert";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="w-full h-full flex items-start justify-center">
            <Alert variant="destructive">
                <ShieldAlert />
                <AlertTitle>Accès non autorisé</AlertTitle>
                <AlertDescription>
                    Vous n&apos;avez pas la permission d&apos;accéder à cette page.
                </AlertDescription>
            </Alert>
        </div>
    );
}