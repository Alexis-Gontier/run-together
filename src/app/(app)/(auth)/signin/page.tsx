import { SigninWithUsernameForm } from '@/components/auth/signin-with-username-form'

export default function page() {
    return (
        <>
            <div className="space-y-2">
                <h2 className="text-4xl font-semibold">
                    Welcome back
                </h2>
                <h3 className="text-md text-muted-foreground">
                    Sign in to your account
                </h3>
            </div>
            <SigninWithUsernameForm />
        </>
    )
}
