"use client"

import {
  Table as TableComponent,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
import {
  ArrowUpDown,
  Clock,
  Ellipsis,
  MapPin,
  MountainSnow,
  Trash2
} from "lucide-react"
import { Run } from "@/types/run"
import { calculatePace } from "@/utils/peace"
import { formatSecondsToHMS } from "@/utils/date"
import { deleteRun } from "@/actions/run/delete-run.Action"
import { toast } from "sonner"

type RunTableProps = {
  runs: Run[]
}

export default function RunTable({ runs }: RunTableProps) {

  return (
    <div className="rounded-md border">
      <TableComponent>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="py-2">
              <Button
                variant="ghost"
                className="cursor-pointer"
                title="Trier par date"
              >
                Date
              </Button>
            </TableHead>
            <TableHead className="py-2">
              <Button
                variant="ghost"
                className="cursor-pointer"
                title="Trier par distance"
              >
                Distance
              </Button>
            </TableHead>
            <TableHead className="py-2">
              <Button
                variant="ghost"
                className="cursor-pointer"
                title="Trier par distance"
              >
                Temps
              </Button>
            </TableHead>
            <TableHead className="py-2">
              Allure
            </TableHead>
            <TableHead className="py-2">
              <Button
                variant="ghost"
                className="cursor-pointer"
                title="Trier par distance"
              >
                Elevation
              </Button>
            </TableHead>
            <TableHead className="py-2">
              Lieu
            </TableHead>
            <TableHead className="py-2">
              Note
            </TableHead>
            <TableHead className="py-2">

            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center p-4">
                <p className="text-muted-foreground">Aucune course trouvée.</p>
              </TableCell>
            </TableRow>
          ) : (
            runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="p-5">
                  {run.date
                    ? new Date(run.date).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "Inconnu"}
              </TableCell>
              <TableCell className="p-5">
                {run.distance} km
              </TableCell>
              <TableCell className="p-5">
                <span className="flex items-center gap-1">
                  <Clock className="size-4 text-muted-foreground" />
                  {formatSecondsToHMS(run.duration)}
                </span>
              </TableCell>
              <TableCell className="p-2">
                {calculatePace(run.distance, run.duration)} min/km
              </TableCell>
              <TableCell className="p-5">
                <span className="flex items-center gap-1">
                  <MountainSnow className="size-4 text-muted-foreground" />
                  {run.elevation ? `${run.elevation} m` : "Inconnu"}
                </span>
              </TableCell>
              <TableCell className="p-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin size="16" />
                  {run.location || "Inconnu"}
                </span>
              </TableCell>
              <TableCell className="p-2">
                <span className="text-muted-foreground italic truncate max-w-[250px] block">
                  {run.notes ? (
                    <>
                      &ldquo;{run.notes}&rdquo;
                    </>
                  ) : "Aucune note"}
                </span>
              </TableCell>
              <TableCell className="p-2">
                <DropdownAction id={run.id} />
              </TableCell>
            </TableRow>
          )))}
        </TableBody>
      </TableComponent>
    </div>
  )
}

function DropdownAction({ id } : { id: string }) {

  async function handleDelete() {
    try {
      await deleteRun(id);
      toast.success("Course supprimée avec succès.");
    } catch (error) {
      toast.error("Erreur lors de la suppression de la course.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="cursor-pointer"
          size="icon"
          title="Voir les détails de la course"
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={handleDelete}
        >
          <Trash2 />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}