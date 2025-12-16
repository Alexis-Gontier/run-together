"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcn-ui/dialog"
import { Button } from "@/components/shadcn-ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/shadcn-ui/form"
import { Input } from "@/components/shadcn-ui/input"
import { Textarea } from "@/components/shadcn-ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"

import { createRunSchema, type CreateRunType } from "@/lib/schemas/run-schema"
import { useUpdateRun } from "@/lib/api/mutations/use-update-run"
import { toast } from "sonner"
import { Run } from "@/lib/api/schemas/runs.schema"

type EditRunDialogProps = {
    run: Run
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditRunDialog({ run, open, onOpenChange }: EditRunDialogProps) {
    const { mutateAsync, isPending } = useUpdateRun()

    const form = useForm<CreateRunType>({
        resolver: zodResolver(createRunSchema),
        defaultValues: {
            date: new Date(run.date),
            distance: run.distance,
            duration: run.duration / 60, // Convert seconds to minutes
            elevationGain: run.elevationGain,
            notes: run.notes || "",
        },
    })

    // Reset form when run changes
    useEffect(() => {
        form.reset({
            date: new Date(run.date),
            distance: run.distance,
            duration: run.duration / 60, // Convert seconds to minutes
            elevationGain: run.elevationGain,
            notes: run.notes || "",
        })
    }, [run, form])

    async function onSubmit(values: CreateRunType) {
        const toastId = toast.loading("Mise à jour de la course...")
        try {
            const result = await mutateAsync({ ...values, id: run.id })
            if (result?.success) {
                toast.success(result.message || "Course mise à jour avec succès !", { id: toastId })
                onOpenChange(false)
            } else {
                toast.error("Échec de la mise à jour. Veuillez réessayer.", { id: toastId })
            }
        } catch (error) {
            toast.error("Échec de la mise à jour. Veuillez réessayer.", { id: toastId })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Modifier une course</DialogTitle>
                    <DialogDescription>
                        Mettez à jour les détails de votre course
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            date={field.value}
                                            onSelect={field.onChange}
                                            disabled={isPending}
                                            placeholder="Sélectionner une date"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="distance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Distance (km)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="5.00"
                                                disabled={isPending}
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    field.onChange(value === '' ? 0 : parseFloat(value))
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => {
                                    const totalSeconds = (field.value || 0) * 60
                                    const hours = Math.floor(totalSeconds / 3600)
                                    const minutes = Math.floor((totalSeconds % 3600) / 60)
                                    const seconds = totalSeconds % 60
                                    const timeValue = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

                                    return (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Durée</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="time"
                                                    step="1"
                                                    value={timeValue}
                                                    onChange={(e) => {
                                                        const [h, m, s] = e.target.value.split(":")
                                                        const totalSeconds = parseInt(h || "0") * 3600 + parseInt(m || "0") * 60 + parseInt(s || "0")
                                                        const totalMinutes = totalSeconds / 60
                                                        field.onChange(totalMinutes)
                                                    }}
                                                    disabled={isPending}
                                                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="elevationGain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dénivelé (m)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            disabled={isPending}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                field.onChange(value === '' ? 0 : parseFloat(value))
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optionnel - Dénivelé total gagné pendant la course
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="How did the run feel?"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optionnel - Ajoutez des notes sur la course
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Annuler
                            </Button>
                            <LoadingButton
                                type="submit"
                                className="cursor-pointer"
                                isPending={isPending}
                            >
                                Mettre à jour la course
                            </LoadingButton>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
