"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateEmailType, updateEmailSchema } from "@/lib/schemas";
import { updateEmailAction } from "@/lib/actions/auth";
import { useTransition } from "react";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

interface UpdateEmailFormProps {
    currentEmail: string;
}

export function UpdateEmailForm({ currentEmail }: UpdateEmailFormProps) {
    const router = useRouter();
    const { refetch } = authClient.useSession();
    const [isPending, startTransition] = useTransition();

    const form = useForm<UpdateEmailType>({
        resolver: zodResolver(updateEmailSchema),
        defaultValues: {
            newEmail: "",
        },
    });

    function onSubmit(values: UpdateEmailType) {
        startTransition(async () => {
            const toastId = toast.loading("Mise à jour de l'email...");

            const result = await updateEmailAction(values);

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
                <CardTitle>Changer l&apos;adresse email</CardTitle>
                <CardDescription>
                    Email actuel: {currentEmail}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="newEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nouvel email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="nouveau@email.com"
                                            autoComplete="email"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Mise à jour..." : "Mettre à jour l'email"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
