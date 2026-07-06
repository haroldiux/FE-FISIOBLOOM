import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  ChevronRight,
  Phone,
  Mail,
  UserCheck
} from "lucide-react";
import { api } from "../services/api";

interface Service {
  id: string;
  name: string;
  category: string;
  defaultDuration: number;
  defaultPrice: number;
  contraindications?: string;
}

interface Professional {
  id: string;
  name: string;
  role: string;
}

export default function PatientPortalScreen() {
  const [tenantSlug, setTenantSlug] = useState<string>("");
  const [tenantName, setTenantName] = useState<string>("Bloom Skin");
  const [loadingTenant, setLoadingTenant] = useState<boolean>(true);
  const [tenantError, setTenantError] = useState<string | null>(null);

  // Form selections
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [slots, setSlots] = useState<string[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Patient Info Form
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // UI Status
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [loadingProfessionals, setLoadingProfessionals] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // 1: Service, 2: Slot/Specialist, 3: Contact Form, 4: Success
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Initialize tenant slug from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("tenant") || "aura"; // default to aura if not provided
    setTenantSlug(slug);
    
    // Resolve Tenant settings/details dynamically
    async function fetchTenantDetails() {
      try {
        setLoadingTenant(true);
        // Call a public status check or just verify availability
        const res = await api.get<any>(`/public/services?tenant=${slug}`);
        if (Array.isArray(res)) {
          setTenantName(slug.charAt(0).toUpperCase() + slug.slice(1) + " Estética");
          setTenantError(null);
        } else {
          setTenantError("El centro estético solicitado no está disponible o no existe.");
        }
      } catch (err) {
        setTenantError("El centro estético solicitado no está disponible o no existe.");
      } finally {
        setLoadingTenant(false);
      }
    }
    fetchTenantDetails();
  }, []);

  // Fetch Services & Professionals once tenant is loaded
  useEffect(() => {
    if (!tenantSlug || tenantError) return;

    async function loadData() {
      try {
        setLoadingServices(true);
        setLoadingProfessionals(true);
        
        const servicesData = await api.get<Service[]>(`/public/services?tenant=${tenantSlug}`);
        setServices(servicesData);
        setLoadingServices(false);

        const profsData = await api.get<Professional[]>(`/public/professionals?tenant=${tenantSlug}`);
        setProfessionals(profsData);
        setLoadingProfessionals(false);
      } catch (err) {
        console.error("Error loading booking details:", err);
      }
    }
    loadData();
  }, [tenantSlug, tenantError]);

  // Load available time slots when date, service, or professional changes
  useEffect(() => {
    if (!selectedDate || !selectedServiceId || !selectedProfessionalId) {
      setSlots([]);
      return;
    }

    async function loadSlots() {
      try {
        setLoadingSlots(true);
        const slotsData = await api.get<string[]>(
          `/public/slots?tenant=${tenantSlug}&date=${selectedDate}&serviceId=${selectedServiceId}&professionalId=${selectedProfessionalId}`
        );
        setSlots(slotsData);
      } catch (err) {
        console.error("Error loading time slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedDate, selectedServiceId, selectedProfessionalId, tenantSlug]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !selectedServiceId || !selectedProfessionalId || !selectedDate || !selectedSlot) {
      setErrorMsg("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      
      const dateTimeString = `${selectedDate}T${selectedSlot}:00`;
      
      const payload = {
        fullName,
        phone,
        email: email || undefined,
        serviceId: selectedServiceId,
        professionalId: selectedProfessionalId,
        dateTime: dateTimeString
      };

      const result = await api.post<any>(`/public/bookings?tenant=${tenantSlug}`, payload);
      setBookingResult(result);
      setStep(4); // Proceed to Success
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al registrar la reserva. Inténtalo nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedService = () => services.find(s => s.id === selectedServiceId);
  const getSelectedProf = () => professionals.find(p => p.id === selectedProfessionalId);

  if (loadingTenant) {
    return (
      <div className="min-h-screen w-full bg-[#0b0f19] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#d946ef] mb-4" />
        <p className="text-sm font-bold tracking-widest text-slate-400 uppercase animate-pulse">
          Cargando Portal de Reservas...
        </p>
      </div>
    );
  }

  if (tenantError) {
    return (
      <div className="min-h-screen w-full bg-[#0b0f19] flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-black mb-2">Error de Conexión</h2>
        <p className="text-slate-450 max-w-md text-sm leading-relaxed mb-6">
          {tenantError}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#090d16] via-[#0f172a] to-[#1e112a] text-white py-12 px-4 flex justify-center items-center font-sans">
      <div className="w-full max-w-xl bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient lights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-fuchsia-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 border-b border-slate-800 pb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-fuchsia-500/20 animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
            {tenantName.toUpperCase()}
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-bold tracking-wider uppercase">
            Reserva de Tratamientos en Línea
          </p>
        </div>

        {/* Steps Bar */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-8 text-xs font-black relative z-10 px-4">
            <div className={`flex flex-col items-center gap-1.5 ${step >= 1 ? 'text-fuchsia-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-700'}`}>1</span>
              <span>Servicio</span>
            </div>
            <div className="w-full h-0.5 bg-slate-800 mx-2 -mt-4" />
            <div className={`flex flex-col items-center gap-1.5 ${step >= 2 ? 'text-fuchsia-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-700'}`}>2</span>
              <span>Horario</span>
            </div>
            <div className="w-full h-0.5 bg-slate-800 mx-2 -mt-4" />
            <div className={`flex flex-col items-center gap-1.5 ${step >= 3 ? 'text-fuchsia-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-700'}`}>3</span>
              <span>Tus Datos</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-center gap-3 mb-6 relative z-10">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STAGE 1: Service selection */}
        {step === 1 && (
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Selecciona el Tratamiento
              </label>
              {loadingServices ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" />
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {services.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => setSelectedServiceId(svc.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                        selectedServiceId === svc.id
                          ? "border-fuchsia-500 bg-fuchsia-500/5 shadow-md shadow-fuchsia-500/5"
                          : "border-slate-800 bg-[#131b2e]/60 hover:bg-[#131b2e] hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <h3 className="text-xs font-black text-white">{svc.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-fuchsia-400" /> {svc.defaultDuration} min
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-cyan-400">${svc.defaultPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedServiceId}
                className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-xs font-black rounded-xl hover:opacity-95 transition-all shadow-md shadow-fuchsia-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: Professional & Slot selection */}
        {step === 2 && (
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Selecciona al Especialista
              </label>
              {loadingProfessionals ? (
                <div className="py-4 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {professionals.map((prof) => (
                    <div
                      key={prof.id}
                      onClick={() => {
                        setSelectedProfessionalId(prof.id);
                        setSelectedSlot("");
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        selectedProfessionalId === prof.id
                          ? "border-fuchsia-500 bg-fuchsia-500/5"
                          : "border-slate-800 bg-[#131b2e]/60 hover:bg-[#131b2e]"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-2xs font-black text-white truncate">{prof.name}</h3>
                        <p className="text-[9px] text-slate-400 uppercase mt-0.5">{prof.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Selecciona Fecha de Reserva
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot("");
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-[#131b2e]/60 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-fuchsia-500 cursor-pointer"
                />
              </div>
            </div>

            {selectedDate && selectedProfessionalId && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                  Horarios Disponibles
                </label>
                {loadingSlots ? (
                  <div className="py-6 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl bg-[#131b2e]/20 text-slate-500 text-xs font-semibold">
                    No hay horarios disponibles para este especialista en la fecha seleccionada.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 text-center text-xs font-black rounded-xl border transition-all ${
                          selectedSlot === slot
                            ? "bg-fuchsia-500 border-fuchsia-500 text-white shadow-md shadow-fuchsia-500/10"
                            : "border-slate-800 bg-[#131b2e]/40 text-slate-350 hover:bg-[#131b2e] hover:border-slate-700"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 border border-slate-800 text-xs font-black text-slate-400 rounded-xl hover:bg-slate-800/40 transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
                className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-xs font-black rounded-xl hover:opacity-95 transition-all shadow-md shadow-fuchsia-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: Contact details form */}
        {step === 3 && (
          <form onSubmit={handleBookingSubmit} className="space-y-6 relative z-10">
            <div className="p-4 bg-[#131b2e]/40 border border-slate-800 rounded-2xl space-y-2.5">
              <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                Resumen de tu Reserva
              </h4>
              <p className="text-xs font-black text-white">{getSelectedService()?.name}</p>
              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 font-semibold pt-1">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{getSelectedProf()?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>{selectedDate} a las {selectedSlot} hs</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Sofía Hernández"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e]/60 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Teléfono celular *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +52 55 1234 5678"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e]/60 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Correo electrónico (Opcional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ej. sofia@mail.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#131b2e]/60 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 border border-slate-800 text-xs font-black text-slate-400 rounded-xl hover:bg-slate-800/40 transition-colors"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={submitting || !fullName || !phone}
                className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-xs font-black rounded-xl hover:opacity-95 transition-all shadow-md shadow-fuchsia-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmar Reserva
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STAGE 4: Success message */}
        {step === 4 && (
          <div className="text-center space-y-6 py-6 relative z-10 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-450 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <UserCheck className="w-8 h-8" />
            </div>
            
            <h2 className="text-lg md:text-xl font-black text-emerald-400">
              ¡Reserva Recibida con Éxito!
            </h2>
            
            <p className="text-slate-350 text-xs md:text-sm leading-relaxed max-w-sm mx-auto">
              Hola <span className="font-bold text-white">{fullName}</span>, hemos agendado tu cita para <span className="font-bold text-white">{getSelectedService()?.name}</span> con el profesional <span className="font-bold text-white">{getSelectedProf()?.name}</span>.
            </p>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-slate-400 text-xs leading-normal max-w-sm mx-auto text-left space-y-2">
              <span className="font-black text-emerald-400 block tracking-wider uppercase text-[10px]">
                Pasos a Seguir:
              </span>
              <p>1. Recibirás un mensaje de WhatsApp en tu número registrado para validar tu cita.</p>
              <p>2. Responde al mensaje enviando un <strong>"1"</strong> para CONFIRMAR, o <strong>"2"</strong> si deseas CANCELAR.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedServiceId("");
                setSelectedProfessionalId("");
                setSelectedDate("");
                setSelectedSlot("");
                setFullName("");
                setPhone("");
                setEmail("");
              }}
              className="mt-6 px-6 py-2.5 bg-slate-800 text-white text-xs font-black rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Hacer Otra Reserva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
