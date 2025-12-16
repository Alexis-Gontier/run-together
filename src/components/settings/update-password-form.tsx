"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordType, changePasswordSchema } from "@/lib/schemas";
import { changePasswordAction } from "@/lib/actions/auth";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Button } from "@/components/shadcn-ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/shadcn-ui/card";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { authClient } from "@/lib/auth/auth-client";

export function UpdatePasswordForm() {
    const router = useRouter();
    const { refetch } = authClient.useSession();
    const [isPending, startTransition] = useTransition();

    const form = useForm<ChangePasswordType>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            revokeOtherSessions: false,
        },
    });

    function onSubmit(values: ChangePasswordType) {
        startTransition(async () => {
            const toastId = toast.loading("Changement du mot de passe...");

            const result = await changePasswordAction(values);

            if (result?.data?.success) {
                toast.success(result.data.message, {
                    id: toastId,
                });
                form.reset();

                // Rafraîchir la session Better Auth
                await refetch();

                // Rafraîchir les données du serveur
                router.refresh();
            } else {
                toast.error(result?.data?.error || "Une erreur est survenue", {
                    id: toastId,
                });
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>
                    Mettez à jour votre mot de passe pour sécuriser votre compte
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mot de passe actuel</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            autoComplete="current-password"
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
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nouveau mot de passe</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Minimum 6 caractères avec majuscule, minuscule, chiffre et caractère spécial
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
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
                            name="revokeOtherSessions"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Déconnecter les autres appareils
                                        </FormLabel>
                                        <FormDescription>
                                            Fermer toutes les sessions actives sur les autres appareils
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Mise à jour..." : "Changer le mot de passe"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
