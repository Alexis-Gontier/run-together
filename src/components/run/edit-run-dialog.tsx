"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useTransition, useEffect } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcn-ui/dialog"
import { Button } from "@/components/shadcn-ui/button"
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
import { updateRunAction } from "@/lib/actions/runs"
import { toast } from "sonner"
import { Run } from "@/generated/prisma/client"

type EditRunDialogProps = {
    run: Run
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditRunDialog({ run, open, onOpenChange }: EditRunDialogProps) {
    const [isPending, startTransition] = useTransition()

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

    function onSubmit(values: CreateRunType) {
        startTransition(async () => {
            const toastId = toast.loading("Updating run...")
            try {
                const result = await updateRunAction({ ...values, id: run.id })
                if (result?.data?.success) {
                    toast.success("Run updated successfully!", { id: toastId })
                    onOpenChange(false)
                } else {
                    toast.error(result?.data?.error || "Failed to update run", { id: toastId })
                }
            } catch (error) {
                toast.error("Failed to update run. Please try again.", { id: toastId })
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Run</DialogTitle>
                    <DialogDescription>
                        Update your run details
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
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (minutes)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="30"
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
                        </div>

                        <FormField
                            control={form.control}
                            name="elevationGain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Elevation Gain (m)</FormLabel>
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
                                        Optional - Total elevation gained during the run
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
                                        Optional - Add any notes about the run
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
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="cursor-pointer"
                                disabled={isPending}
                            >
                                {isPending ? "Updating..." : "Update Run"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
