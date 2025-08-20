import { Run } from '@prisma/client';

/**
 * Prédit la performance de l'utilisateur
 * @param runs Liste des courses de l'utilisateur
 * @param targetTime Objectif en secondes (ex: 3300s = 55min)
 * @param objectiveDistance Distance de l'objectif (par défaut 10km)
 */
export function predictRunPerformance(
  runs: Run[],
  targetTime: number,
  objectiveDistance = 10
) {
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
  const comparableRuns = runs.filter(
    (r) =>
      r.distance >= objectiveDistance * 0.7 &&
      r.distance <= objectiveDistance * 1.5
  );

  let estimatedTimeSeconds: number;

  if (comparableRuns.length > 0) {
    // Meilleure performance pondérée
    const weightedBest = comparableRuns.reduce((best, r) => {
      const pace = r.duration / r.distance; // sec/km
      const distanceFactor = r.distance / objectiveDistance; // >1 si +long, <1 si +court
      const closenessFactor =
        1 / (1 + Math.abs(r.distance - objectiveDistance)); // pénalise si trop éloigné

      const score = (1 / pace) * distanceFactor * closenessFactor;

      return score > best.score
        ? { run: r, score }
        : best;
    }, { run: comparableRuns[0], score: 0 });

    const best = weightedBest.run;
    // Appliquer Riegel pour extrapoler précisément
    estimatedTimeSeconds =
      best.duration *
      Math.pow(objectiveDistance / best.distance, 1.06);
  } else {
    // Fallback : moyenne pondérée de toutes les courses
    let totalWeightedPace = 0;
    let totalWeight = 0;

    runs.forEach((run, index) => {
      const pace = run.duration / run.distance; // sec/km

      const distanceFactor = run.distance / objectiveDistance;
      const closenessFactor =
        1 / (1 + Math.abs(run.distance - objectiveDistance));

      const recencyFactor = 1 + (runs.length - index) / runs.length;

      const weight = distanceFactor * closenessFactor * recencyFactor;

      totalWeightedPace += pace * weight;
      totalWeight += weight;
    });

    const avgPace = totalWeightedPace / totalWeight;
    estimatedTimeSeconds = avgPace * objectiveDistance;
  }

  // Calcul amélioration par rapport à l’objectif
  const improve = estimatedTimeSeconds - targetTime;

  // Score de confiance (basé sur nombre + volume + qualité des runs)
  const totalDistance = runs.reduce((s, r) => s + r.distance, 0);
  const distanceScore = Math.min(50, totalDistance / 20); // 1000km max ~ 50 pts
  const volumeScore = Math.min(30, runs.length * 2); // 15 runs = 30 pts
  const qualityScore = Math.min(
    20,
    comparableRuns.length * 4
  ); // max 5 runs proches = 20 pts

  const confidence = Math.min(
    95,
    Math.floor(distanceScore + volumeScore + qualityScore)
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
    return `${h}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  } else {
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
