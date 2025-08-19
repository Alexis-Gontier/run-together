import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth-server';
import { predictRunPerformance } from '@/utils/predict';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer toutes les courses de l’utilisateur
    const runs = await prisma.run.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    // Objectif : 55 min = 3300s
    const prediction = predictRunPerformance(runs, 3300);

    return NextResponse.json({
      userId: user.id,
      ...prediction,
    });
  } catch (error) {
    console.error('Error in prediction API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
