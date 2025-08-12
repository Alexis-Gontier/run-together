"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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

import { useRef, useTransition } from "react"

import {
    KeyRound,
    Loader
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    FingerprintIcon,
    FingerprintIconHandle
} from "@/components/shadcn-ui/fingerprint"

import { signInSchema, type SignInFormData } from "@/schemas/auth.schema"

const formSchema = z.object({
    username: z
        .string()
        .min(2),
    password: z
        .string()
        .min(2)
})

export function SignInForm() {

    const router = useRouter()

    const [isPending, setIsPending] = useTransition()

    const iconRef = useRef<FingerprintIconHandle>(null)

    const form = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
            defaultValues: {
                username: "",
                password: "",
            },
    })

    async function onSubmit(values: SignInFormData) {
        setIsPending(async () => {
            await authClient.signIn.username(
                {
                    username: values.username,
                    password: values.password,
                },
                {
                    onRequest: () => {},
                    onSuccess: () => {
                        toast.success("Connexion réussie !");
                        router.push("/dashboard");
                    },
                    onError: () => {
                        toast.error("Erreur de connexion.");
                    },
                }
            )
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pseudo</FormLabel>
                            <FormControl>
                                <Input placeholder="Votre pseudo" {...field} />
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
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full cursor-pointer"
                    onMouseEnter={() => iconRef.current?.startAnimation()}
                    onMouseLeave={() => iconRef.current?.stopAnimation()}
                >
                    {isPending ? (
                        <Loader className="size-4 animate-spin" />
                    ) : (
                        <FingerprintIcon
                            ref={iconRef}
                            className="size-4"
                        />
                    )}
                    Se connecter
                </Button>
            </form>
        </Form>
    )
}