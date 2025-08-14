import { z } from 'zod';

const DISTANCE_MIN = 0.1;
const DISTANCE_MAX = 1000;
const DURATION_MIN = 1;
const DURATION_MAX = 86400; // 24 heures en secondes
const ELEVATION_MIN = -500;
const ELEVATION_MAX = 10000;
const LOCATION_MAX_LENGTH = 100;
const NOTES_MAX_LENGTH = 1000;

const distanceValidation = z
  .number()
  .min(DISTANCE_MIN, {
    message: `La distance doit être d'au moins ${DISTANCE_MIN} km.`
  })
  .max(DISTANCE_MAX, {
    message: `La distance ne peut pas dépasser ${DISTANCE_MAX} km.`
  });

const durationValidation = z
  .number()
  .int({
    message: "La durée doit être un nombre entier de secondes."
  })
  .min(DURATION_MIN, {
    message: `La durée doit être d'au moins ${DURATION_MIN} seconde.`
  })
  .max(DURATION_MAX, {
    message: `La durée ne peut pas dépasser ${DURATION_MAX} secondes.`
  });

const elevationValidation = z
  .number()
  .int({
    message: "L'élévation doit être un nombre entier."
  })
  .min(ELEVATION_MIN, {
    message: `L'élévation ne peut pas être inférieure à ${ELEVATION_MIN} mètres.`
  })
  .max(ELEVATION_MAX, {
    message: `L'élévation ne peut pas dépasser ${ELEVATION_MAX} mètres.`
  })
  .nullable()
  .optional();

const locationValidation = z
  .string()
  .max(LOCATION_MAX_LENGTH, {
    message: `Le lieu ne peut pas dépasser ${LOCATION_MAX_LENGTH} caractères.`
  })
  .optional();

const notesValidation = z
  .string()
  .max(NOTES_MAX_LENGTH, {
    message: `Les notes ne peuvent pas dépasser ${NOTES_MAX_LENGTH} caractères.`
  })
  .optional();

// Schema pour créer une course
export const createRunSchema = z.object({
  date: z.date().optional(),
  distance: distanceValidation,
  duration: durationValidation,
  elevation: elevationValidation,
  location: locationValidation,
  notes: notesValidation,
});

export type CreateRunData = z.infer<typeof createRunSchema>;