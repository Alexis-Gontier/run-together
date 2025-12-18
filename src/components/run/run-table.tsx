"use client"

import { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/shadcn-ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn-ui/table"
import { Button } from "@/components/shadcn-ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/shadcn-ui/tooltip"
import { EllipsisVertical, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Activity, Eye } from "lucide-react"
import { formatDistance, formatDuration, formatPace } from '@/lib/utils/run'
import { formatDateShort } from '@/lib/utils/date'
import { Run } from '@/lib/api/schemas/runs.schema'
import { EditRunDialog } from './edit-run-dialog'
import { DeleteRunDialog } from './delete-run-dialog'
import { cn } from '@/lib/utils/cn'
import { parseAsString, useQueryState } from 'nuqs'
import { useRouter } from 'next/navigation'

type RunTableProps = {
    runs: Run[]
}

type SortField = 'date' | 'distance' | 'duration' | 'pace' | 'elevationGain'
type SortDirection = 'asc' | 'desc' | null

export function RunTable({ runs }: RunTableProps) {
    const router = useRouter()
    const [selectedRun, setSelectedRun] = useState<Run | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [sortBy, setSortBy] = useQueryState('sortBy', parseAsString.withDefault('date'))
    const [sortOrder, setSortOrder] = useQueryState('sortOrder', parseAsString.withDefault('desc'))

    const handleViewDetails = (run: Run) => {
        router.push(`/dashboard/runs/${run.id}`)
    }

    const handleEdit = (run: Run) => {
        setSelectedRun(run)
        setEditDialogOpen(true)
    }

    const handleDelete = (run: Run) => {
        setSelectedRun(run)
        setDeleteDialogOpen(true)
    }

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            if (sortOrder === 'desc') {
                setSortOrder('asc')
            } else if (sortOrder === 'asc') {
                setSortOrder('desc')
                setSortBy('date')
            } else {
                setSortOrder('desc')
            }
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        }
        return sortOrder === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        )
    }

    return (
        <>
            <Card className="p-4">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('date')}
                                            className="h-8 px-2 hover:bg-transparent cursor-pointer"
                                        >
                                            Date
                                            <SortIcon field="date" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('distance')}
                                            className="h-8 px-2 hover:bg-transparent cursor-pointer"
                                        >
                                            Distance
                                            <SortIcon field="distance" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('duration')}
                                            className="h-8 px-2 hover:bg-transparent cursor-pointer"
                                        >
                                            Durée
                                            <SortIcon field="duration" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('pace')}
                                            className="h-8 px-2 hover:bg-transparent cursor-pointer"
                                        >
                                            Allure
                                            <SortIcon field="pace" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('elevationGain')}
                                            className="h-8 px-2 hover:bg-transparent cursor-pointer"
                                        >
                                            Dénivelé
                                            <SortIcon field="elevationGain" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {runs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32">
                                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                                                <Activity className="h-12 w-12 mb-2 opacity-50" />
                                                <p className="font-medium">Aucune course enregistrée</p>
                                                <p className="text-sm mt-1">Créez votre première course pour commencer</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    runs.map((run) => (
                                        <TableRow
                                            key={run.id}
                                            className="group hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => handleViewDetails(run)}
                                        >
                                            <TableCell className="font-medium">
                                                {formatDateShort(run.date)}
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary px-4">
                                                {formatDistance(run.distance)}
                                            </TableCell>
                                            <TableCell>{formatDuration(run.duration)}</TableCell>
                                            <TableCell>{formatPace(run.pace)}</TableCell>
                                            <TableCell>
                                                {run.elevationGain > 0 ? `${run.elevationGain.toFixed(0)} m` : '-'}
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                {run.notes ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="truncate block cursor-help">
                                                                    {run.notes}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <p>{run.notes}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                        >
                                                            <EllipsisVertical className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleViewDetails(run)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Eye />
                                                            Voir les détails
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleEdit(run)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil />
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(run)}
                                                            className="cursor-pointer text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 />
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {selectedRun && (
                <>
                    <EditRunDialog
                        run={selectedRun}
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                    />
                    <DeleteRunDialog
                        run={selectedRun}
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                    />
                </>
            )}
        </>
    )
}