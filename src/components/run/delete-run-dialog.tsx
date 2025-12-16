"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/shadcn-ui/alert-dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import { deleteRunAction } from "@/lib/actions/runs"
import { toast } from "sonner"
import { Run } from "@/lib/api/schemas/runs.schema"
import { formatDateShort } from "@/lib/utils/date"
import { formatDistance } from "@/lib/utils/run"

type DeleteRunDialogProps = {
    run: Run
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteRunDialog({ run, open, onOpenChange }: DeleteRunDialogProps) {
    const [isPending, startTransition] = useTransition()
    const queryClient = useQueryClient()

    function handleDelete() {
        startTransition(async () => {
            const toastId = toast.loading("Deleting run...")
            try {
                const result = await deleteRunAction({ id: run.id })
                if (result?.data?.success) {
                    toast.success("Run deleted successfully!", { id: toastId })

                    // Invalidate all run-related queries
                    queryClient.invalidateQueries({ queryKey: ["runs"] })
                    queryClient.invalidateQueries({ queryKey: ["runs-calendar"] })
                    queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
                    queryClient.invalidateQueries({ queryKey: ["recent-runs"] })

                    onOpenChange(false)
                } else {
                    toast.error(result?.data?.error || "Failed to delete run", { id: toastId })
                }
            } catch (error) {
                toast.error("Failed to delete run. Please try again.", { id: toastId })
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete your run from {formatDateShort(run.date)} ({formatDistance(run.distance)}).
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <LoadingButton
                        onClick={handleDelete}
                        isPending={isPending}
                        variant="destructive"
                    >
                        Delete
                    </LoadingButton>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
