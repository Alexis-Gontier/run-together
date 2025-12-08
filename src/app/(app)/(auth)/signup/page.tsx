import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function page() {
    return (
        <>
            <div className="space-y-2">
                <h2 className="text-4xl">
                    Get started
                </h2>
                <h3 className="text-sm text-muted-foreground">
                    Create a new account
                </h3>
            </div>
            <SignupForm />
            <p className="text-center text-sm text-muted-foreground">
                Have an account?{" "}
                <Link
                    href="/signin"
                    className="text-foreground underline hover:text-muted-foreground"
                >
                    Sign in
                </Link>
            </p>
        </>
    )
}
