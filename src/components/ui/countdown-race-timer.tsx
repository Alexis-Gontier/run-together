"use client"

// import { Card, CardContent, CardFooter, CardHeader } from '@/components/shadcn-ui/card'
// import { Calendar, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, parseISO } from 'date-fns';
// import { fr } from 'date-fns/locale';

export default function CountdownRaceTimer() {

    const raceDateISO = '2026-05-01T09:00:00';
    // const raceDate = format(parseISO(raceDateISO), "EEEE d MMMM yyyy", { locale: fr });

    const [timeRemaining, setTimeRemaining] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date();
            const targetDate = parseISO(raceDateISO);

            if (now >= targetDate) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = differenceInDays(targetDate, now);
            const hours = differenceInHours(targetDate, now) % 24;
            const minutes = differenceInMinutes(targetDate, now) % 60;
            const seconds = differenceInSeconds(targetDate, now) % 60;

            setTimeRemaining({ days, hours, minutes, seconds });
        };

        calculateTimeRemaining();

        const intervalId = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(intervalId);
    }, [raceDateISO]);

    const countdownItems = [
        { value: timeRemaining.days, label: 'J' },
        { value: timeRemaining.hours, label: 'H' },
        { value: timeRemaining.minutes, label: 'M' },
        { value: timeRemaining.seconds, label: 'S' }
    ];

  return (
    <div className="">
        <div className="flex items-center gap-2">
            {countdownItems.map((item, idx) => (
                <div key={idx} className="text-muted-foreground">
                    <span className="text-xs">{item.value}</span>
                    <span className="text-xs">{item.label}</span>
                </div>
            ))}
        </div>
    </div>
  )
}
