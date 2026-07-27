import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  onGoHome?: () => void;
}

interface State {
  error: Error | null;
}

// Sin esto, cualquier error inesperado durante el render (un campo que llega
// null desde el servidor, un dato viejo en localStorage, etc.) tumbaba TODA la
// aplicación a una pantalla en blanco sin ningún aviso — la única forma de
// recuperarse era refrescar la página a ciegas. Ahora se atrapa acá, se
// muestra un aviso claro, y se puede reintentar o volver al inicio sin perder
// la sesión ni tener que adivinar qué pasó.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Error de renderizado atrapado por ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center text-error">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
              Ocurrió un error inesperado
            </h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-md">
              Esta pantalla encontró un problema y no se pudo mostrar. Tus datos ya guardados no se perdieron.
              Podés reintentar o volver al inicio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => this.setState({ error: null })}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
            {this.props.onGoHome && (
              <button
                onClick={() => {
                  this.setState({ error: null });
                  this.props.onGoHome?.();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-border text-xs font-bold text-muted-foreground rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Volver al Inicio
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
