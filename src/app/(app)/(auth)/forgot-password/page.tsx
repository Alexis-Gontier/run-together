import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function page() {
    return (
        <>
            <div className="space-y-2">
                <h2 className="text-3xl">
                    Forgot your password?
                </h2>
                <h3 className="text-sm text-muted-foreground">
                    Enter your email and we&lsquo;ll send you a reset link.
                </h3>
            </div>
            <ForgotPasswordForm />
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
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
