// Qué categorías de servicio puede atender cada rol clínico, y en qué
// cabina/box lo hace. Se usa tanto en el Calendario (Nueva Cita) como en la
// venta de paquetes desde la ficha del paciente — vive en un solo lugar para
// que no se desincronice entre pantallas (ya pasó una vez con lógica
// duplicada de fechas de cupón entre dos controllers del backend).
export const CATEGORIES_BY_ROLE: Record<string, string[]> = {
  PHYSIO: ["FISIOTERAPIA"],
  AESTHETICIAN: ["FACIAL", "CORPORAL", "ESTETICA"],
};

// El Administrador y roles no clínicos pueden elegir cualquier cabina (se les
// muestran todas).
export const CABINS_BY_ROLE: Record<string, string[]> = {
  PHYSIO: ["Box Fisioterapia"],
  AESTHETICIAN: ["Cabina Facial 1", "Cabina Corporal 2"],
};

// Duraciones rápidas disponibles como chips en los formularios de citas.
export const DURATION_PRESETS = [30, 45, 60, 90, 120];

// Todas las cabinas/box del centro, para cuando no hay un rol específico que
// las restrinja (ej. Administrador armando una cita).
export const ALL_CABINS = ["Cabina Facial 1", "Cabina Corporal 2", "Box Fisioterapia", "Ninguna"];
