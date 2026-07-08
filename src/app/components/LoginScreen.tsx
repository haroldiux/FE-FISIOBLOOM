import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Mail, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { animate } from "animejs";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        translateY: [40, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: "easeOutExpo",
      });
    }
    if (logoRef.current) {
      animate(logoRef.current, {
        scale: [0.6, 1],
        opacity: [0, 1],
        delay: 200,
        duration: 1200,
        easing: "easeOutElastic(1, .5)",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas. Reintenta.");
      if (cardRef.current) {
        animate(cardRef.current, {
          translateX: [-10, 10, -10, 10, 0],
          duration: 400,
          easing: "linear",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07040a] px-4 relative overflow-hidden font-sans">
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.05); }
        }
        .animate-float-1 {
          animation: float-1 18s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 15s ease-in-out infinite;
        }
      `}</style>

      {/* Spatial Background Orbs */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px] -top-60 -left-60 animate-float-1 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[130px] -bottom-60 -right-60 animate-float-2 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-cyan-500/8 blur-[110px] top-1/2 left-1/3 pointer-events-none" />

      <div 
        ref={cardRef} 
        className="w-full max-w-md glass-panel rounded-[2rem] p-8 border border-white/10 dark:border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center z-10"
      >
        {/* Brand/Logo */}
        <div ref={logoRef} className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center shadow-lg shadow-primary/30 mb-3 spring-hover">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            BLOOM SKIN
          </h1>
          <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase mt-1">
            Portal Médico & Estético
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-xs font-semibold animate-shake">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block px-1">
              Correo Electrónico
            </label>
            <div className="relative glowing-border rounded-2xl">
              <Mail className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="tour-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@bloomskin.com"
                className="w-full pl-11 pr-4 py-3.5 text-sm border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 text-white placeholder:text-white/20 bg-white/5 backdrop-blur-md spring-hover"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block px-1">
              Contraseña
            </label>
            <div className="relative glowing-border rounded-2xl">
              <Lock className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="tour-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 text-sm border border-white/5 rounded-2xl focus:outline-none focus:border-primary/50 text-white placeholder:text-white/20 bg-white/5 backdrop-blur-md spring-hover"
              />
            </div>
          </div>

          <button
            id="tour-login-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl shadow-lg shadow-primary/25 transition-all spring-hover flex items-center justify-center gap-2 mt-4 disabled:bg-primary/60 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Ingresar al Portal"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-white/30 font-semibold tracking-wider">
            ¿Olvidaste tu contraseña? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
