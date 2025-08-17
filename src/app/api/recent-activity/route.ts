import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth-server';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Exemple : récupérer les 10 dernières courses du groupe
    const activities = await prisma.run.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        user: {
          select: {
            id: true,
            displayUsername: true,
            image: true
          },
        },
      },
    });

    return NextResponse.json({
      userId: user.id,
      activities: activities.map((a) => ({
        id: a.id,
        distance: a.distance,
        duration: a.duration, // en secondes par ex
        createdAt: a.createdAt,
        user: a.user,
      })),
    });
  } catch (error) {
    console.error('Error in recent activity API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
