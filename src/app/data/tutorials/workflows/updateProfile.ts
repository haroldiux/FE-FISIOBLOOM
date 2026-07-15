import { TourStep } from "../types";

export const updateProfileWorkflow: TourStep[] = [
  {
    selector: "#tour-user-footer",
    title: "Paso 1: Menú de Usuario",
    content: "Haz clic sobre tu nombre o avatar en la parte inferior del panel lateral.",
    position: "bottom"
  },
  {
    selector: "#tour-profile-edit-btn",
    title: "Paso 2: Editar Ficha Personal",
    content: "Haz clic en 'Editar Perfil' para abrir la ventana de ajustes personales.",
    position: "bottom"
  },
  {
    selector: "#tour-profile-form-phone",
    title: "Paso 3: Actualizar Contacto",
    content: "Actualiza tu teléfono, email de contacto o cambia tu contraseña de acceso.",
    position: "bottom"
  },
  {
    selector: "#tour-profile-form-submit",
    title: "Paso 4: Guardar Ajustes",
    content: "Presiona para guardar tus datos de perfil actualizados de forma permanente.",
    position: "top"
  }
];
