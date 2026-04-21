"use client"

import { intervalToDuration, isPast, parseISO } from "date-fns"
import { useEffect, useState } from "react"

type CountdownProps = {
  target: string // ISO 8601
}

function getTimeLeft(target: Date) {
  if (isPast(target)) return null
  return intervalToDuration({ start: new Date(), end: target })
}

export function Countdown({ target }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(parseISO(target)))

  useEffect(() => {
    const targetDate = parseISO(target)
    const id = setInterval(() => {
      const next = getTimeLeft(targetDate)
      setTimeLeft(next)
      if (!next) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  if (!timeLeft)
    return <p className="text-4xl font-bold">Le site est en ligne !</p>

  const units = [
    { id: "days", label: "Jours", value: timeLeft.days ?? 0 },
    { id: "hours", label: "Heures", value: timeLeft.hours ?? 0 },
    { id: "minutes", label: "Minutes", value: timeLeft.minutes ?? 0 },
    { id: "seconds", label: "Secondes", value: timeLeft.seconds ?? 0 },
  ]

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10 md:gap-16">
      {units.map(({ id, label, value }) => (
        <div key={id} className="flex flex-col items-center gap-3 sm:gap-4">
          <span className="text-6xl font-black tabular-nums md:text-7xl lg:text-8xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-base font-semibold tracking-widest text-muted-foreground uppercase sm:text-lg md:text-xl">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
