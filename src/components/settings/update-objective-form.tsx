"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateObjectiveAction } from "@/lib/actions/objectives";
import { useTransition } from "react";
import { toast } from "sonner";
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
import { LoadingButton } from "@/components/ui/loading-button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/shadcn-ui/card";
import { useRouter } from "next/navigation";

const objectiveFormSchema = z.object({
    monthObjectif: z.number().min(0, "L'objectif doit être positif").max(1000, "L'objectif ne peut pas dépasser 1000 km").nullable(),
});

type ObjectiveFormType = z.infer<typeof objectiveFormSchema>;

interface UpdateObjectiveFormProps {
    currentObjective: number | null;
}

export function UpdateObjectiveForm({ currentObjective }: UpdateObjectiveFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<ObjectiveFormType>({
        resolver: zodResolver(objectiveFormSchema),
        defaultValues: {
            monthObjectif: currentObjective ?? undefined,
        },
    });

    function onSubmit(values: ObjectiveFormType) {
        startTransition(async () => {
            const toastId = toast.loading("Mise à jour de l'objectif...");

            // Convertir les valeurs vides en null
            const dataToSubmit = {
                monthObjectif: values.monthObjectif === null || values.monthObjectif === undefined || values.monthObjectif === 0
                    ? null
                    : values.monthObjectif
            };

            const result = await updateObjectiveAction(dataToSubmit);

            if (result?.data?.success) {
                toast.success(result.data.message, {
                    id: toastId,
                });

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
                <CardTitle>Objectif mensuel de course</CardTitle>
                <CardDescription>
                    Définissez votre objectif de distance mensuelle (en kilomètres)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="monthObjectif"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Distance mensuelle (km)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            min="0"
                                            max="1000"
                                            disabled={isPending}
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                field.onChange(val === "" ? null : Number(val));
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Laissez vide pour désactiver l'objectif
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <LoadingButton type="submit" isPending={isPending}>
                            Mettre à jour l'objectif
                        </LoadingButton>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
