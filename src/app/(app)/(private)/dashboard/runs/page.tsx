import { Button } from '@/components/shadcn-ui/button'
import { ButtonGroup } from '@/components/shadcn-ui/button-group'
import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/shadcn-ui/input-group"
import { Filter, LayoutGrid, List, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/shadcn-ui/card'

export default function page() {
  return (
    <>
      <DashboardTextHeading
        title="Runs"
        description="Manage and monitor your runs"
      />
      <div className="flex justify-between">
        <div className="flex gap-2">
          <InputGroup className="w-64">
            <InputGroupInput placeholder="Search for a run" />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
          >
            <Filter />
          </Button>
        </div>
        <div className="flex gap-2">
          <ButtonGroup>
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer"
            >
              <LayoutGrid />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="border cursor-pointer"
            >
              <List />
            </Button>
          </ButtonGroup>
          <Button
            className="cursor-pointer"
          >
            <Plus />
            Create New Run
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader></CardHeader>
        <CardContent></CardContent>
      </Card>
    </>
  )
}
