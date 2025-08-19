import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table"
import { Button } from "@/components/shadcn-ui/button"

export default function FriendRunTable() {
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
                User
              </Button>
            </TableHead>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={8} className="text-center p-4">
              <p className="text-muted-foreground">Aucune course trouvée.</p>
            </TableCell>
          </TableRow>
        </TableBody>
      </TableComponent>
    </div>
  )
}
