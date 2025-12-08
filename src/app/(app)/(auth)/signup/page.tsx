import { SignupForm } from "@/components/auth/signup-form";

export default function page() {
    return (
        <>
            <div className="space-y-2">
                <h2 className="text-4xl font-semibold">
                    Get started
                </h2>
                <h3 className="text-md text-muted-foreground">
                    Create a new account
                </h3>
            </div>
            <SignupForm />
        </>
    )
}
