"use client"

import { Button } from '@/components/shadcn-ui/button'
import { ButtonGroup } from '@/components/shadcn-ui/button-group'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/shadcn-ui/input-group"
import { Card, CardContent, CardHeader } from '@/components/shadcn-ui/card'
import { CreateRunDialog } from '@/components/run/create-run-dialog'
import { Filter, LayoutGrid, List, Search } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'


export function RunToolbar() {

    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
    }

    const [search, setSearch] = useQueryState(
        "search",
        parseAsString.withDefault("").withOptions({
            shallow: false,
            throttleMs: 500,
        })
    )

    return (
        <>
            <div className="flex justify-between">
                <div className="flex gap-2">
                    {/* <InputGroup className="w-64">
                        <InputGroupInput
                            placeholder="Search for a run"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                    <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer"
                        onClick={toggleDropdown}
                    >
                        <Filter />
                    </Button> */}
                </div>
                <div className="flex gap-2">
                    {/* <ButtonGroup>
                        <Button
                            variant={viewMode === 'grid' ? 'outline' : 'ghost'}
                            size="icon"
                            className="border cursor-pointer"
                            onClick={() => toggleViewMode('grid')}
                        >
                            <LayoutGrid />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'outline' : 'ghost'}
                            size="icon"
                            className="border cursor-pointer"
                            onClick={() => toggleViewMode('list')}
                        >
                            <List />
                        </Button>
                    </ButtonGroup> */}
                    <CreateRunDialog />
                </div>
            </div>
            {isOpen && (
                <Card>
                    <CardHeader></CardHeader>
                    <CardContent></CardContent>
                </Card>
            )}
        </>
    );
}
