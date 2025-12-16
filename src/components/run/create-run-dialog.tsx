"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { useCreateRun } from "@/lib/api/mutations/use-create-run"
import { toast } from "sonner"
import { Plus } from "lucide-react"

export function CreateRunDialog() {
    const [open, setOpen] = useState(false)
    const { mutateAsync, isPending } = useCreateRun()

    const form = useForm<CreateRunType>({
        resolver: zodResolver(createRunSchema),
        defaultValues: {
            date: new Date(),
            distance: 0,
            duration: 0,
            elevationGain: 0,
            notes: "",
        },
    })

    async function onSubmit(values: CreateRunType) {
        const toastId = toast.loading("Creating run...")
        try {
            const result = await mutateAsync(values)
            if (result?.success) {
                toast.success(result.message || "Run created successfully!", { id: toastId })
                form.reset()
                setOpen(false)
            } else {
                toast.error("Failed to create run. Please try again.", { id: toastId })
            }
        } catch (error) {
            toast.error("Failed to create run. Please try again.", { id: toastId })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <Plus />
                    Create New Run
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Run</DialogTitle>
                    <DialogDescription>
                        Add a new run to your activity log
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
                                            <FormLabel>Duration</FormLabel>
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
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="cursor-pointer"
                                disabled={isPending}
                            >
                                {isPending ? "Creating..." : "Create Run"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
