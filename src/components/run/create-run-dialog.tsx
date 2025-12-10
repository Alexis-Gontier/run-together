"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useTransition } from "react"

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
import { createRunAction } from "@/lib/actions/runs"
import { toast } from "sonner"
import { Plus } from "lucide-react"

export function CreateRunDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

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

    function onSubmit(values: CreateRunType) {
        startTransition(async () => {
            try {
                await createRunAction(values)
                toast.success("Run created successfully!")
                form.reset()
                setOpen(false)
            } catch (error) {
                toast.error("Failed to create run. Please try again.")
            }
        })
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
