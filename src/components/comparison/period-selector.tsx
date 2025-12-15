"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn-ui/select";
import { Button } from "@/components/shadcn-ui/button";
import { Calendar } from "@/components/shadcn-ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn-ui/popover";
import { parseAsString, useQueryState } from "nuqs";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { DateRange } from "react-day-picker";

type PeriodOption = {
  value: string;
  label: string;
  getDateRange: () => { start: Date; end: Date };
};

const PERIOD_OPTIONS: PeriodOption[] = [
  {
    value: "7days",
    label: "7 derniers jours",
    getDateRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start, end };
    },
  },
  {
    value: "30days",
    label: "30 derniers jours",
    getDateRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start, end };
    },
  },
  {
    value: "3months",
    label: "3 derniers mois",
    getDateRange: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return { start, end };
    },
  },
  {
    value: "6months",
    label: "6 derniers mois",
    getDateRange: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return { start, end };
    },
  },
  {
    value: "year",
    label: "Cette année",
    getDateRange: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), 0, 1);
      return { start, end };
    },
  },
  {
    value: "all",
    label: "Toutes les données",
    getDateRange: () => {
      const end = new Date();
      const start = new Date(2020, 0, 1); // Arbitrary old date
      return { start, end };
    },
  },
];

export function PeriodSelector() {
  const [period, setPeriod] = useQueryState("period", parseAsString.withDefault("all"));
  const [startDate, setStartDate] = useQueryState("startDate", parseAsString);
  const [endDate, setEndDate] = useQueryState("endDate", parseAsString);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (value !== "custom") {
      // Clear custom dates when selecting a preset
      setStartDate(null);
      setEndDate(null);
      setDateRange(undefined);
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setPeriod("custom");
      setStartDate(format(range.from, "yyyy-MM-dd"));
      setEndDate(format(range.to, "yyyy-MM-dd"));
    }
  };

  const clearCustomDates = () => {
    setDateRange(undefined);
    setStartDate(null);
    setEndDate(null);
    setPeriod("all");
  };

  const isCustomPeriod = period === "custom" && startDate && endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Période de comparaison</CardTitle>
        <CardDescription>
          Filtrez les statistiques par période
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex-1 min-w-[200px]">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Période personnalisée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`justify-start text-left font-normal ${
                !dateRange && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {isCustomPeriod ? (
                <>
                  {format(new Date(startDate), "dd MMM yyyy", { locale: fr })} -{" "}
                  {format(new Date(endDate), "dd MMM yyyy", { locale: fr })}
                </>
              ) : dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd MMM yyyy", { locale: fr })} -{" "}
                    {format(dateRange.to, "dd MMM yyyy", { locale: fr })}
                  </>
                ) : (
                  format(dateRange.from, "dd MMM yyyy", { locale: fr })
                )
              ) : (
                <span>Choisir une période</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              locale={fr}
            />
          </PopoverContent>
        </Popover>

        {isCustomPeriod && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearCustomDates}
            title="Réinitialiser"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
