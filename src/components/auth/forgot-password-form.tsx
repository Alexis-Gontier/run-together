"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/shadcn-ui/button";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
    email: z.email({ message: "Please enter a valid email" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

    async function onSubmit({ email }: ForgotPasswordValues) {
        setSuccess(null);
        setError(null);

        const { error } = await authClient.requestPasswordReset({
            email,
            redirectTo: "/reset-password",
        });

        if (error) {
            setError(error.message || "Something went wrong");
            toast.error("Une erreur est survenue lors de l'envoi du lien de réinitialisation");
        } else {
            setSuccess(
                "If an account exists for this email, we've sent a password reset link.",
            );
            toast.success("Lien de réinitialisation du mot de passe envoyé à votre email");
            form.reset();
        }
    }

  const loading = form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                {success && (
                    <div role="status" className="text-sm text-green-600">
                        {success}
                    </div>
                )}
                {error && (
                    <div role="alert" className="text-sm text-red-600">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                >
                    Envoyer le lien de réinitialisation
                </Button>
            </form>
        </Form>
    );
}