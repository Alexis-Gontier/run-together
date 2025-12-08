"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/shadcn-ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadcn-ui/form"
import { Input } from "@/components/shadcn-ui/input"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

import {
    signInSchema,
    type SignInType,
} from "@/lib/schemas"

import { signInAction } from "@/lib/actions/auth"
import { toast } from "sonner"

export function SigninWithUsernameForm() {

    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<SignInType>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    function onSubmit(values: SignInType) {
        startTransition(async () => {
            const toastId = toast.loading("Signing in...")
            const result = await signInAction(values)
            if (result.data?.success) {
                toast.success(result.data.message, { id: toastId })
                router.replace(result.data.redirectTo || "/dashboard")
            } else {
                toast.error(result.data?.error, { id: toastId })
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your username"
                                    disabled={isPending}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    disabled={isPending}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isPending}
                >
                    {isPending ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </Form>
    )
}
