"use client"

import {
    Card,
    CardContent
} from '@/components/shadcn-ui/card'
import {
    Table,
    TableBody,
    // TableCaption,
    TableCell,
    // TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn-ui/table"
import { Button } from "@/components/shadcn-ui/button"
import { EllipsisVertical } from "lucide-react"
import { formatDistance, formatDuration, formatPace } from '@/lib/utils/run'
import { formatDateShort } from '@/lib/utils/date'
import { Run } from '@/generated/prisma/client'

type RunTableProps = {
    runs: Run[]
}

export function RunTable({ runs }: RunTableProps) {
    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Distance</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead>Allure</TableHead>
                            <TableHead>Dénivelé</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {runs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    Aucune course enregistrée
                                </TableCell>
                            </TableRow>
                        ) : (
                            runs.map((run) => (
                                <TableRow key={run.id}>
                                    <TableCell className="font-medium">
                                        {formatDateShort(run.date)}
                                    </TableCell>
                                    <TableCell>{formatDistance(run.distance)}</TableCell>
                                    <TableCell>{formatDuration(run.duration)}</TableCell>
                                    <TableCell>{formatPace(run.pace)}</TableCell>
                                    <TableCell>{run.elevationGain.toFixed(0)} m</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {run.notes || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer"
                                        >
                                            <EllipsisVertical />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}