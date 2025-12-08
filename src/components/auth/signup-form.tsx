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
    signUpSchema,
    type SignUpType,
} from "@/lib/schemas"

import { signUpAction } from "@/lib/actions/auth"
import { toast } from "sonner"

export function SignupForm() {

    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<SignUpType>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            name: "",
            email: "",
            password: "",
        },
    })

    function onSubmit(values: SignUpType) {
        startTransition(async () => {
            const toastId = toast.loading("Creating account...")
            const result = await signUpAction(values)
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
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your email"
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
                >
                    Sign Up
                </Button>
            </form>
        </Form>
    )
}