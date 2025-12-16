"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/shadcn-ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Activity, Calendar, Ruler, Trash2, Weight } from "lucide-react"
import { deleteBmiAction } from "@/lib/actions/bmi"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog"
import { type bmi } from "@/generated/prisma/client"
import { calculateBMI } from "@/lib/utils/bmi"

type BmiItemProps = {
    data: bmi
}

export default function BmiItem({ data }: BmiItemProps) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const toastId = toast.loading("Suppression...")
            try {
                const result = await deleteBmiAction({ id: data.id })

                if (result?.data?.success) {
                    toast.success("Données supprimées avec succès", { id: toastId })
                    setIsOpen(false)
                } else {
                    toast.error("Échec de la suppression", { id: toastId })
                }
            } catch (error) {
                toast.error("Échec de la suppression. Veuillez réessayer.", { id: toastId })
            }
        })
    }

    const bmi = calculateBMI(data.weight, data.height)

    const DATA = [
        {
            label: "Date",
            value: format(new Date(data.date), "dd MMM yy", { locale: fr }),
            icon: Calendar,
            color: "text-gray-300"
        },
        {
            label: "Poids",
            value: data.weight ? `${data.weight} kg` : "N/A",
            icon: Weight,
            color: "text-orange-500"
        },
        {
            label: "Taille",
            value: data.height ? `${data.height} cm` : "N/A",
            icon: Ruler,
            color: "text-green-500"
        },
        {
            label: "IMC",
            value: bmi ? `${bmi.toFixed(2)} kg/m²` : "N/A",
            icon: Activity,
            color: "text-blue-500"
        },
    ]

    return (
        <div className="border px-4 py-2 rounded-md flex justify-between items-center">
            <div className="flex space-x-4">
                {DATA.map((item) => (
                    <div key={item.label} className="flex items-center space-x-2">
                        <span className="p-2 bg-muted rounded-md">
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                        </span>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                            <span className="text-sm">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer ces données ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                            className="cursor-pointer"
                        >
                            Annuler
                        </Button>
                        <LoadingButton
                            variant="destructive"
                            onClick={handleDelete}
                            isPending={isPending}
                            className="cursor-pointer"
                        >
                            Supprimer
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}