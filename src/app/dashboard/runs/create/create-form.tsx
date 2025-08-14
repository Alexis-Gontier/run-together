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
    CreateRunData,
    createRunSchema
} from "@/schemas/run.schema"
import { createRun } from "@/actions/run/create-run.action"
import { Textarea } from "@/components/shadcn-ui/textarea"

export function CreateRunForm() {

    const [isPending, startTransition] = useTransition()

    const form = useForm<CreateRunData>({
        resolver: zodResolver(createRunSchema),
            defaultValues: {
                date: new Date(),
                distance: 0,
                duration: 0,
                elevation: null,
                location: "",
                notes: "",
            },
    })

    async function onSubmit(values: CreateRunData) {
        startTransition(async () => {
            try {
                await createRun(values);
                toast.success("Course créée avec succès!");
            } catch (error) {
                toast.error("Erreur lors de la création de la course");
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
                                    {...field}
                                    value={field.value?.toISOString().slice(0, 16)}
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
                                    step="0.1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                            <FormLabel>Durée (secondes)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                                <Input {...field} />
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
                                <Textarea {...field} rows={3} />
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
                    {isPending ? "Création..." : "Créer la course"}
                </Button>
            </form>
        </Form>
    )
}