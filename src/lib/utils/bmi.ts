/**
 * Calcule l'IMC (Indice de Masse Corporelle) à partir du poids et de la taille
 * @param weight - Poids en kilogrammes
 * @param height - Taille en centimètres
 * @returns L'IMC calculé ou null si les données sont invalides
 */
export function calculateBMI(weight: number | null, height: number | null): number | null {
  if (!weight || !height || height === 0) return null
  const heightInMeters = height / 100 // Convertir cm en m
  return weight / (heightInMeters * heightInMeters)
}

/**
 * Détermine la catégorie de poids en fonction de l'IMC
 * @param bmi - L'indice de masse corporelle
 * @returns La catégorie de poids correspondante
 */
export function getBMICategory(bmi: number | null): string {
  if (!bmi) return "Aucune donnée"
  if (bmi < 18.5) return "Insuffisance pondérale"
  if (bmi < 25) return "Poids normal"
  if (bmi < 30) return "Surpoids"
  return "Obésité"
}

/**
 * Détermine la couleur associée à une catégorie d'IMC
 * @param bmi - L'indice de masse corporelle
 * @returns La classe de couleur Tailwind correspondante
 */
export function getBMIColor(bmi: number | null): string {
  if (!bmi) return "text-muted-foreground"
  if (bmi < 18.5) return "text-blue-500"
  if (bmi < 25) return "text-green-500"
  if (bmi < 30) return "text-orange-500"
  return "text-red-500"
}