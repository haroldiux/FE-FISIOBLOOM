import { createRoot } from "react-dom/client";
import { AuthProvider } from "./app/context/AuthContext.tsx";
import { TenantSettingsProvider } from "./app/context/TenantSettingsContext.tsx";
import { ErrorBoundary } from "./app/components/ErrorBoundary.tsx";
import App from "./app/App.tsx";
import "./styles/index.css";

// Red de seguridad de último recurso: si algo revienta fuera del área que ya
// protege su propio ErrorBoundary interno (ej. el encabezado o el menú
// lateral), esto evita que el usuario se quede con la pantalla en blanco sin
// ninguna explicación ni forma de recuperarse.
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <TenantSettingsProvider>
        <App />
      </TenantSettingsProvider>
    </AuthProvider>
  </ErrorBoundary>
);