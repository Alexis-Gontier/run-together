import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const params = await searchParams
    const token = params.token
    const error = params.error

    if (error) {
        return (
            <>
                <div className="space-y-2">
                    <h2 className="text-3xl">
                        Invalid link
                    </h2>
                    <h3 className="text-sm text-muted-foreground">
                        The reset link is invalid or has expired
                    </h3>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/forgot-password"
                        className="text-foreground underline hover:text-muted-foreground"
                    >
                        Request a new link
                    </Link>
                </p>
            </>
        )
    }

    if (!token) {
        return (
            <>
                <div className="space-y-2">
                    <h2 className="text-3xl">
                        Missing token
                    </h2>
                    <h3 className="text-sm text-muted-foreground">
                        No reset token was provided
                    </h3>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/forgot-password"
                        className="text-foreground underline hover:text-muted-foreground"
                    >
                        Request a reset link
                    </Link>
                </p>
            </>
        )
    }

    return (
        <>
            <div className="space-y-2">
                <h2 className="text-3xl">
                    Reset your password
                </h2>
                <h3 className="text-sm text-muted-foreground">
                    Enter your new password below
                </h3>
            </div>
            <ResetPasswordForm token={token} />
            <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
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
