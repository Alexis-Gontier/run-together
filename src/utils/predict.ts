import { Run } from '@prisma/client';

/**
 * Prédit la performance de l'utilisateur
 * @param runs Liste des courses de l'utilisateur
 * @param targetTime Objectif en secondes (ex: 3300s = 55min)
 * @param objectiveDistance Distance cible en km (par défaut 10km)
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

  // Trier les runs récents en premier
  runs.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Fonction de pondération : plus proche de la distance cible → plus de poids
  const weightByDistance = (d: number) => {
    const ratio = Math.abs(d - objectiveDistance) / objectiveDistance;
    // exemple : pile 10km = poids 1, à ±50% = poids ≈ 0.1
    return Math.max(0.1, 1 - ratio * 1.5);
  };

  let estimatedTimeSeconds: number;

  // On privilégie les runs autour de la cible (70–150% de l’objectif)
  const comparableRuns = runs.filter(
    (r) =>
      r.distance >= objectiveDistance * 0.7 &&
      r.distance <= objectiveDistance * 1.5
  );

  if (comparableRuns.length > 0) {
    // pondération selon distance + fraîcheur (récence)
    let totalWeightedTime = 0;
    let totalWeight = 0;

    comparableRuns.forEach((r, index) => {
      const pace = r.duration / r.distance; // sec/km
      const distanceWeight = weightByDistance(r.distance);
      const recencyWeight = 1 + (comparableRuns.length - index) / comparableRuns.length;
      const weight = distanceWeight * recencyWeight;

      totalWeightedTime += pace * objectiveDistance * weight;
      totalWeight += weight;
    });

    estimatedTimeSeconds = totalWeightedTime / totalWeight;
  } else {
    // fallback : moyenne pondérée de toutes les courses
    let totalWeightedPace = 0;
    let totalWeight = 0;

    runs.forEach((run, index) => {
      const pace = run.duration / run.distance;
      const distanceWeight = weightByDistance(run.distance);
      const recencyWeight = 1 + (runs.length - index) / runs.length;
      const weight = distanceWeight * recencyWeight;

      totalWeightedPace += pace * weight;
      totalWeight += weight;
    });

    const avgPace = totalWeightedPace / totalWeight;
    estimatedTimeSeconds = avgPace * objectiveDistance;
  }

  // Calcul amélioration par rapport à l’objectif
  const improve = estimatedTimeSeconds - targetTime;

  // Nouvelle formule de confiance :
  // - plus il y a de runs
  // - plus ils sont proches de l’objectif
  // - plus on monte vers 100, mais difficile d’y arriver
  const distanceFactor = Math.min(
    1,
    comparableRuns.reduce((acc, r) => acc + weightByDistance(r.distance), 0) /
      comparableRuns.length || 0
  );
  const volumeFactor = Math.log10(runs.length + 1) / 2; // tend vers 1 avec bcp de runs
  const confidence = Math.min(
    95,
    Math.floor(distanceFactor * 100 * volumeFactor)
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
