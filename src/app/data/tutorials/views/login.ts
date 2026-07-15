import { TourStep } from "../types";

export const loginTour: TourStep[] = [
  {
    selector: "#tour-login-email",
    title: "Correo Electrónico",
    content: "Ingresa tu email institucional configurado por el administrador del centro clínico.",
    position: "bottom"
  },
  {
    selector: "#tour-login-password",
    title: "Contraseña de Acceso",
    content: "Introduce tu clave secreta de seguridad. Si la olvidaste, por favor solicita un blanqueo al administrador.",
    position: "bottom"
  },
  {
    selector: "#tour-login-submit",
    title: "Ingresar al Panel",
    content: "Haz clic para autenticarte. El sistema cargará el dashboard y tus permisos específicos de rol.",
    position: "top"
  }
];
