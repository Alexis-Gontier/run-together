"use client"

import { format, parse } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { fr as dayPickerFr } from "react-day-picker/locale"
import { Button } from "@/components/shadcn-ui/button"
import { Calendar } from "@/components/shadcn-ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover"
import { cn } from "@/lib/utils/cn"

const VALUE_FORMAT = "yyyy-MM-dd"

/** Date de la course : valeur `yyyy-MM-dd` (comme l'input natif), jours futurs désactivés. */
export function RunDatePicker({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? parse(value, VALUE_FORMAT, new Date()) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          <CalendarIcon />
          {selected
            ? format(selected, "EEE d MMM yyyy", { locale: fr })
            : "Choisir une date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={dayPickerFr}
          selected={selected}
          defaultMonth={selected}
          disabled={{ after: new Date() }}
          onSelect={(date) => {
            if (!date) return
            onChange(format(date, VALUE_FORMAT))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
