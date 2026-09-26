// Paliers de distance cumulée (km) mis en avant dans le panneau de progression.
const MILESTONES = [
  50, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000,
]

export type Milestone = {
  next: number
  previous: number
  remainingKm: number
  progress: number // 0 → 1 entre le palier précédent et le suivant
}

/** Prochain palier de distance cumulée ; au-delà du dernier, tous les 5 000 km. */
export function nextMilestone(totalKm: number): Milestone {
  const next =
    MILESTONES.find((m) => m > totalKm) ??
    Math.floor(totalKm / 5000) * 5000 + 5000
  const previous = [...MILESTONES].reverse().find((m) => m <= totalKm) ?? 0
  const base = next > MILESTONES[MILESTONES.length - 1] ? next - 5000 : previous
  return {
    next,
    previous: base,
    remainingKm: Math.round((next - totalKm) * 10) / 10,
    progress: (totalKm - base) / (next - base),
  }
}
