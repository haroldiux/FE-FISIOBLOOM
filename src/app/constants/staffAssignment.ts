// Qué categorías de servicio puede atender cada rol clínico, y en qué
// cabina/box lo hace. Se usa tanto en el Calendario (Nueva Cita) como en la
// venta de paquetes desde la ficha del paciente — vive en un solo lugar para
// que no se desincronice entre pantallas (ya pasó una vez con lógica
// duplicada de fechas de cupón entre dos controllers del backend).
export const CATEGORIES_BY_ROLE: Record<string, string[]> = {
  PHYSIO: ["FISIOTERAPIA"],
  AESTHETICIAN: ["FACIAL", "CORPORAL", "ESTETICA"],
};

// Duraciones rápidas disponibles como chips en los formularios de citas.
export const DURATION_PRESETS = [30, 45, 60, 90, 120];

// Las cabinas/box ya no son una constante fija: el Administrador las crea y
// activa/desactiva desde Configuración > Cabinas (modelo Cabin en la base de
// datos, endpoint /api/cabins). CalendarScreen.tsx las trae en vivo y las
// filtra por categoría usando CATEGORIES_BY_ROLE de acá arriba — ver
// cabinNamesForRole() en ese archivo.
