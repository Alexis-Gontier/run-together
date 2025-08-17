import { Run } from '@prisma/client';

/**
 * Prédit la performance de l'utilisateur
 * @param runs Liste des courses de l'utilisateur
 * @param targetTime Objectif en secondes (ex: 3300s = 55min)
 */
export function predictRunPerformance(runs: Run[], targetTime: number, objectiveDistance = 10) {
  if (!runs || runs.length === 0) {
    return {
      estimatedTime: null,
      objective: formatSeconds(targetTime),
      improve: null,
      confidence: 0,
    };
  }

  // Trier par date
  runs.sort((a, b) => b.date.getTime() - a.date.getTime());

  // On cherche les runs proches de l’objectif (ex : 7-15km pour un 10km)
  const comparableRuns = runs.filter(r => r.distance >= objectiveDistance * 0.7 && r.distance <= objectiveDistance * 1.5);

  let estimatedTimeSeconds: number;

  if (comparableRuns.length > 0) {
    // Prendre la meilleure perf (temps minimal sur distance proche)
    const best = comparableRuns.reduce((acc, r) => {
      const pace = r.duration / r.distance; // sec/km
      return pace < acc.duration / acc.distance ? r : acc;
    }, comparableRuns[0]);

    // Appliquer Riegel pour extrapoler précisément sur objectifDistance
    estimatedTimeSeconds = best.duration * Math.pow(objectiveDistance / best.distance, 1.06);
  } else {
    // Sinon fallback : moyenne pondérée de toutes les courses
    let totalWeightedPace = 0;
    let totalWeight = 0;
    let totalDistance = 0;

    runs.forEach((run, index) => {
      const pace = run.duration / run.distance; // sec/km
      const weight = 1 + (runs.length - index) / runs.length;
      totalWeightedPace += pace * weight;
      totalWeight += weight;
      totalDistance += run.distance;
    });

    const avgPace = totalWeightedPace / totalWeight;
    estimatedTimeSeconds = avgPace * objectiveDistance;
  }

  // Calcul amélioration par rapport à l’objectif
  const improve = estimatedTimeSeconds - targetTime;

  // Score de confiance
  const confidence = Math.min(
    100,
    Math.floor((runs.length * 10) + (runs.reduce((s, r) => s + r.distance, 0) / 10))
  );

  return {
    estimatedTime: formatSeconds(estimatedTimeSeconds),
    objective: formatSeconds(targetTime),
    improve: formatSeconds(Math.abs(improve)),
    confidence: confidence.toString(),
  };
}

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}