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
import { toast } from "sonner"

import {
    UpdateRunData,
    updateRunSchema
} from "@/schemas/run.schema"
import { updateRun } from "@/actions/run/update-run.action"
import { Textarea } from "@/components/shadcn-ui/textarea"
import Link from "next/link"
import { Save, Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { secondsToTimeString, timeStringToSeconds } from "@/utils/date"
import { Run } from "@prisma/client"

type UpdateRunFormProps = {
    run: Run;
}

export function UpdateRunForm({ run }: UpdateRunFormProps) {

    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<UpdateRunData>({
        resolver: zodResolver(updateRunSchema),
        defaultValues: {
            date: run.date,
            distance: run.distance === null ? undefined : run.distance,
            duration: run.duration,
            elevation: run.elevation,
            location: run.location || "",
            notes: run.notes || "",
        },
    })

    async function onSubmit(values: UpdateRunData) {
        startTransition(async () => {
            try {
                await updateRun(run.id, values);
                toast.success("Course mise à jour avec succès!");
                router.push("/dashboard/runs");
            } catch (error) {
                toast.error("Erreur lors de la mise à jour de la course");
                console.error(error);
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Input
                                    type="datetime-local"
                                    placeholder="Entrez la date"
                                    {...field}
                                    value={
                                        field.value
                                            ? new Date(field.value).toLocaleString("sv-SE", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }).replace(" ", "T")
                                            : ""
                                    }
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Distance (km)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Entrez la distance"
                                    {...field}
                                    value={field.value === null || field.value === undefined ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Durée</FormLabel>
                            <FormControl>
                                <Input
                                    type="time"
                                    step="1"
                                    {...field}
                                    value={secondsToTimeString(field.value || 0)}
                                    onChange={(e) => {
                                        field.onChange(e.target.value === "" ? 0 : timeStringToSeconds(e.target.value));
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="elevation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Élévation (m) - Optionnel</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Entrez l'élévation"
                                    {...field}
                                    value={field.value === null || field.value === undefined ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lieu - Optionnel</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Entrez le lieu"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes - Optionnel</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ajoutez des notes ici..."
                                    {...field} 
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 cursor-pointer"
                        asChild
                    >
                        <Link href="/dashboard/runs">
                            Annuler
                        </Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex-1 cursor-pointer"
                    >
                        {isPending ? <Loader className="animate-spin" /> : <Save />}
                        Mettre à jour la course
                    </Button>
                </div>
            </form>
        </Form>
    )
}