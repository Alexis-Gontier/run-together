"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { LoadingButton } from "@/components/ui/loading-button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage,
} from "@/components/shadcn-ui/form"
import { Input } from "@/components/shadcn-ui/input"
import { Calendar } from "@/components/shadcn-ui/calendar"
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/shadcn-ui/card"

import {
    useState,
    useTransition,
    useEffect
} from "react"

import {
    bmiCreateSchema,
    BmiType,
} from "@/lib/schemas/bmi-schema"

import { useBmiStore } from "@/lib/stores/bmi-store"
import { healthMetricsCreateAction } from "@/lib/actions/bmi"
import { toast } from "sonner"

export function BmiForm() {

    const [isPending, startTransition] = useTransition()
    const [date, setDate] = useState<Date | undefined>(new Date())

    const { weight, height, setMetrics } = useBmiStore()

    const form = useForm<BmiType>({
        resolver: zodResolver(bmiCreateSchema),
        defaultValues: {
            weight: weight || 0,
            height: height || 0,
            date: date,
        },
    })

    useEffect(() => {
        if (weight > 0) form.setValue('weight', weight)
        if (height > 0) form.setValue('height', height)
    }, [weight, height, form])

    function onSubmit(values: BmiType) {
        startTransition(async () => {
            const toastId = toast.loading("Enregistrement des données...")
            try {
                await healthMetricsCreateAction(values)
                toast.success("Données enregistrées avec succès!", { id: toastId })
                // Sauvegarder les valeurs dans le store
                setMetrics(values.weight, values.height)
                // Réinitialiser uniquement la date
                form.setValue('date', new Date())
                setDate(new Date())
            } catch (error) {
                toast.error("Échec de l'enregistrement. Veuillez réessayer.", { id: toastId })
            }
        })
    }

    return (
        <Card>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap justify-between gap-8">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate)
                                                field.onChange(selectedDate)
                                            }}
                                            className="rounded-md border shadow-sm"
                                            captionLayout="dropdown"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex-1 flex flex-col justify-between gap-2">
                            <div className="space-y-1">
                                <CardTitle>
                                    Entrez vos données de santé
                                </CardTitle>
                                <CardDescription>
                                    Renseigner votre poids et votre taille
                                </CardDescription>
                            </div>
                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Poids (kg)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="70"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value) || 0
                                                        field.onChange(value)
                                                        setMetrics(value, form.getValues('height'))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Votre poids en kilogrammes.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taille (cm)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="170"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value) || 0
                                                        field.onChange(value)
                                                        setMetrics(form.getValues('weight'), value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Votre taille en centimètres.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <LoadingButton
                                    type="submit"
                                    isPending={isPending}
                                    className="w-full cursor-pointer"
                                >
                                    Enregistrer
                                </LoadingButton>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}