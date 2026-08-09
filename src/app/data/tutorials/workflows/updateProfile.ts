import { TourStep } from "../types";

export const updateProfileWorkflow: TourStep[] = [
  {
    selector: '[data-tour="profile-menu"]',
    title: "Paso 1: Menú de Usuario",
    content: "Haz clic en tu avatar, en la esquina superior derecha de la barra superior.",
    position: "bottom",
    mode: "interactive",
    advanceOn: { event: "click", selector: '[data-tour="profile-menu"]' }
  },
  {
    selector: "#tour-profile-edit-btn",
    title: "Paso 2: Editar Ficha Personal",
    content: "Haz clic en 'Mi Perfil' para abrir la ventana de ajustes personales.",
    position: "bottom",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-profile-edit-btn" }
  },
  {
    selector: "#tour-profile-form-phone",
    title: "Paso 3: Actualizar Nombre y Correo",
    content: "Actualiza tu nombre y tu correo electrónico de contacto.",
    position: "bottom"
  },
  {
    selector: "#tour-profile-form-submit",
    title: "Paso 4: Guardar Ajustes",
    content: "Si querés cambiar tu contraseña, escribila en 'Nueva Contraseña' antes de guardar. Presiona 'Guardar' para confirmar los cambios.",
    position: "top"
  }
];
