"use client";

import * as XLSX from "xlsx";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
import { Button } from "@/components/shadcn-ui/button";
import { Ellipsis } from "lucide-react";

type ExportButtonsProps = {
  data: Record<string, unknown>[];
  filename?: string;
};

export default function ExportButtons({ data, filename = "export" }: ExportButtonsProps) {
  if (!Array.isArray(data) || data.length === 0) return null;

  function exportToJSON() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    triggerDownload(url, `${filename}.json`);
  }

  function convertToCSV() {
    const keys = Object.keys(data[0]);
    const csvRows = [
      keys.join(","),
      ...data.map(row =>
        keys
          .map(key => {
            const val = row[key];
            if (typeof val === "string") {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val ?? "";
          })
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  }

  function exportToCSV() {
    const csv = convertToCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    triggerDownload(url, `${filename}.csv`);
  }

  function exportToXLSX() {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feuille1");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.xlsx`);
  }

  function triggerDownload(url: string, name: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
            >
                <Ellipsis />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            align="end"
            sideOffset={8}
        >
            <DropdownMenuItem
                className="cursor-pointer"
                onClick={exportToJSON}
            >
                Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem
                className="cursor-pointer"
                onClick={exportToCSV}
            >
                Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem
                className="cursor-pointer"
                onClick={exportToXLSX}
            >
                Export XLSX
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}