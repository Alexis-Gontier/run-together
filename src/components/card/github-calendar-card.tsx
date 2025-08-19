"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/shadcn-ui/card";
import { useEffect, useState } from "react";
import {
  format,
  isSameDay,
  subDays,
  startOfWeek,
  differenceInDays,
} from "date-fns";
import { fr } from "date-fns/locale/fr";
import clsx from "clsx";
import Link from "next/link";

export default function GithubCalendarCard() {
  const [runData, setRunData] = useState<{ date: Date; id: string }[]>([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await fetch("/api/github-calendar");
        const data = await response.json();
        const runs = data.map((item: { date: string; id: string }) => ({
          date: new Date(item.date),
          id: item.id
        }));
        setRunData(runs);
      } catch (error) {
        console.error("Erreur lors du fetch du calendrier GitHub:", error);
      }
    };
    fetchCalendar();
  }, []);

  const today = new Date();
  // Commencer exactement il y a 365 jours (ou 364 pour avoir 365 jours au total)
  const exactStartDate = subDays(today, 364);
  // Trouver le lundi de cette semaine pour l'affichage en grille
  const startDate = startOfWeek(exactStartDate, { weekStartsOn: 1 });

  const days: Date[] = [];
  // Calculer le nombre de jours entre le début de la grille et aujourd'hui
  const totalDays = differenceInDays(today, startDate) + 1;
  
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getRunData = (date: Date) =>
    runData.find((run) => isSameDay(run.date, date));

  const isRunDay = (date: Date) =>
    runData.some((run) => isSameDay(run.date, date));

  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendrier d&apos;Activité</CardTitle>
        <CardDescription>
          Heatmap de vos courses sur l&apos;année (jusqu&apos;à aujourd&apos;hui)
        </CardDescription>
      </CardHeader>

      <CardContent className="overflow-x-auto pb-4">
        <div className="flex items-start">
          {/* Légende jours */}
          <div className="z-10 sticky top-0 left-0 flex flex-col gap-[4px] mr-2 bg-card">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-4 text-xs text-muted-foreground">
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[4px]">
                {week.map((day, dayIdx) => {
                  const runInfo = getRunData(day);
                  const daySquare = (
                    <div
                      title={format(day, "PPP", { locale: fr })}
                      className={clsx(
                        "w-4 h-4 rounded-[3px] transition-all duration-200",
                        day > today
                          ? "bg-muted opacity-30"
                          : day < exactStartDate
                          ? "bg-muted opacity-50"
                          : isRunDay(day)
                          ? "bg-muted-foreground hover:bg-foreground cursor-pointer"
                          : "bg-muted"
                      )}
                    />
                  );

                  return (
                    <div key={dayIdx}>
                      {runInfo ? (
                        <Link
                          href={`/dashboard/runs/${runInfo.id}`}
                          className="block hover:scale-110 transition-transform duration-200"
                        >
                          {daySquare}
                        </Link>
                      ) : (
                        daySquare
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <CardDescription>
          {runData.length} course{runData.length > 1 ? "s" : ""} enregistrée{runData.length > 1 ? "s" : ""}
        </CardDescription>
      </CardFooter>
    </Card>
  );
}