import { createRoot } from "react-dom/client";
import { AuthProvider } from "./app/context/AuthContext.tsx";
import { TenantSettingsProvider } from "./app/context/TenantSettingsContext.tsx";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <TenantSettingsProvider>
      <App />
    </TenantSettingsProvider>
  </AuthProvider>
);