"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma";

export const getMonthStatsAction = authActionClient
    .action(async ({ ctx }) => {
        try {
            // Calculer le premier et dernier jour du mois en cours
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            // Récupérer toutes les courses du mois
            const runs = await prisma.run.findMany({
                where: {
                    userId: ctx.user.id,
                    date: {
                        gte: firstDayOfMonth,
                        lte: lastDayOfMonth,
                    },
                },
                select: {
                    distance: true,
                },
            });

            // Calculer la distance totale
            const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);

            // Récupérer l'objectif de l'utilisateur
            const user = await prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: { monthObjectif: true },
            });

            // Calculer les jours restants dans le mois
            const daysRemaining = Math.ceil((lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return {
                success: true,
                data: {
                    totalDistance: Math.round(totalDistance * 100) / 100,
                    objective: user?.monthObjectif ?? null,
                    daysRemaining,
                    runsCount: runs.length,
                },
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Échec de la récupération des statistiques",
                data: null,
            };
        }
    });
