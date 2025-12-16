"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma";

export const getChallengesAction = authActionClient
    .action(async ({ ctx }) => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    displayUsername: true,
                    image: true,
                    challenges: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                    gages: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            });

            return {
                success: true,
                data: users,
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Échec de la récupération des défis",
                data: null,
            };
        }
    });
