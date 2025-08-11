"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/shadcn-ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form"
import { Input } from "@/components/shadcn-ui/input"

import { useTransition } from "react"

import { Loader, Send } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

const formSchema = z.object({
    username: z
        .string()
        .min(2),
    name: z
        .string()
        .min(2),
    email: z
        .string()
        .email(),
    password: z
        .string()
        .min(2)
})

export function SignUpForm() {
    const [isPending, setIsPending] = useTransition()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
            defaultValues: {
                username: "",
                name: "",
                email: "",
                password: "",
            },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(async () => {
            await authClient.signUp.email(
                {
                    username: values.username,
                    name: values.name,
                    email: values.email,
                    password: values.password,
                },
                {
                    onRequest: () => {},
                    onSuccess: () => {
                        toast.success("Inscription réussie !");
                    },
                    onError: () => {
                        toast.error("Erreur d'inscription.");
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
                            <FormLabel>Nom d'utilisateur</FormLabel>
                            <FormControl>
                                <Input placeholder="Nom d'utilisateur" {...field} />
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
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                                <Input placeholder="Nom complet" {...field} />
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
                                <Input placeholder="you@example.com" {...field} />
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
                                <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full cursor-pointer"
                >
                    {isPending ? (
                        <Loader className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                    S'inscrire
                </Button>
            </form>
        </Form>
    )
}