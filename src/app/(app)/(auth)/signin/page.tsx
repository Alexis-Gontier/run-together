import Link from 'next/link'
import { SigninWithUsernameForm } from '@/components/auth/signin-with-username-form'

export default function page() {
    return (
        <>
            <div className="space-y-2">
                <h2 className="text-4xl">
                    Welcome back
                </h2>
                <h3 className="text-sm text-muted-foreground">
                    Sign in to your account
                </h3>
            </div>
            <SigninWithUsernameForm />
            <p className="text-center text-sm text-muted-foreground">
                Dont have an account?{" "}
                <Link
                    href="/signup"
                    className="text-foreground underline hover:text-muted-foreground"
                >
                    Sign up
                </Link>
            </p>
        </>
    )
}
