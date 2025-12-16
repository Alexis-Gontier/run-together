"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/shadcn-ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadcn-ui/form"
import { Input } from "@/components/shadcn-ui/input"
import { PasswordInput } from "@/components/ui/password-input"

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
            confirmPassword: "",
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
                            <FormLabel>Pseudo</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="jhondoe"
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
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="John Doe"
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
                                    placeholder="johndoe@example.com"
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
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="••••••••••"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="••••••••••"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <LoadingButton
                    type="submit"
                    className="w-full cursor-pointer"
                    isPending={isPending}
                >
                    S'inscrire
                </LoadingButton>
            </form>
        </Form>
    )
}