import React, { useState } from 'react';
import { LogOut, Sun, Moon, Bell, Search, Clock, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onNavigate?: (screen: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'BLOOM SKIN',
  subtitle = 'Estética & Fisioterapia',
  theme = 'light',
  onToggleTheme,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 glass-panel rounded-2xl flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-40 border border-border gap-2">
      <div className="leading-tight flex-shrink-0">
        <h1 className="text-sm md:text-base font-bold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground font-medium hidden sm:block">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground"
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Visible Mobile Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-xs font-bold transition-all"
          title="Cerrar Sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden xs:inline">Salir</span>
        </button>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-muted text-muted-foreground"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-card border-b border-border p-4 shadow-xl z-50 flex flex-col gap-3 sm:hidden animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <p className="text-sm font-bold text-foreground">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{user?.role || 'ADMIN'}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold shadow"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
