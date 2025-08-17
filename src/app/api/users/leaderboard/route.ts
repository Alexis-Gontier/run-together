import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');

    // Par défaut, prendre les 30 derniers jours
    const days = daysParam ? parseInt(daysParam) : 30;

    // Calculer la date de début (il y a X jours)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Requête pour récupérer les statistiques des utilisateurs
    const usersWithStats = await prisma.user.findMany({
      select: {
        id: true,
        image: true,
        displayUsername: true,
        runs: {
          where: {
            date: {
              gte: startDate
            }
          },
          select: {
            distance: true
          }
        }
      }
    });

    // Calculer les statistiques pour chaque utilisateur
    const userStats = usersWithStats.map(user => {
      const totalDistance = user.runs.reduce((sum, run) => sum + run.distance, 0);
      const numberOfRuns = user.runs.length;

      return {
        id: user.id,
        image: user.image,
        displayUsername: user.displayUsername,
        totalDistance,
        numberOfRuns
      };
    })
    // Trier par distance totale décroissante (les utilisateurs avec 0 course seront à la fin)
    .sort((a, b) => b.totalDistance - a.totalDistance);

    return NextResponse.json({
      success: true,
      userId: user?.id,
      data: userStats,
      meta: {
        periodDays: days,
        startDate: startDate.toISOString(),
        totalUsers: userStats.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    );
  }
}

