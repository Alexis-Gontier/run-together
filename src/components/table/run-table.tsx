"use client"

import { useState, useTransition } from "react"
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
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
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
import { Badge } from "@/components/shadcn-ui/badge"
import {
  Clock,
  EllipsisVertical,
  Eye,
  Loader,
  MapPin,
  MountainSnow,
  SquarePen,
  Trash2
} from "lucide-react"
import { RunTableData } from "@/types/run"
import { calculatePace } from "@/utils/peace"
import { formatSecondsToHMS } from "@/utils/date"
import { deleteRun } from "@/actions/run/delete-run.action"
import { toast } from "sonner"
import Link from "next/link"

type RunTableProps = {
  runs: RunTableData[]
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
                <TableCell className="px-5 py-2">
                  {run.date
                    ? new Date(run.date).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "Inconnu"}
              </TableCell>
              <TableCell className="px-5 py-2">
                <Badge variant="outline" className="text-md">{run.distance} km</Badge>
              </TableCell>
              <TableCell className="px-5 py-2">
                <span className="flex items-center gap-1">
                  <Clock className="size-4 text-muted-foreground" />
                  {formatSecondsToHMS(run.duration)}
                </span>
              </TableCell>
              <TableCell className="p-2">
                {calculatePace(run.distance, run.duration)} min/km
              </TableCell>
              <TableCell className="px-5 py-2">
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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    try {
      startTransition(async () => {
        await deleteRun(id)
      })
      toast.success("Course supprimée avec succès.");
      setAlertOpen(false);
      setDropdownOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression de la course.");
      console.error(error);
    }
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="cursor-pointer"
            size="icon"
            title="Voir les détails de la course"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/runs/${id}`}
              className="cursor-pointer"
            >
              <Eye />
              Voir
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/runs/${id}/edit`}
              className="cursor-pointer"
            >
              <SquarePen />
              Modifier
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setDropdownOpen(false);
              setAlertOpen(true);
            }}
          >
            <Trash2 />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement cette course de votre historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isPending ? <Loader className="animate-spin" /> : <Trash2 />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}