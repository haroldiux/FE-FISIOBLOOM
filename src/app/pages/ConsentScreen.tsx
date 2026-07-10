import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Signature, 
  X, 
  Check, 
  RefreshCw 
} from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

interface ConsentDocument {
  id: string;
  patientId: string;
  serviceId: string;
  signatureData: string;
  signedAt: string;
  patient?: {
    fullName: string;
    phone: string;
    email: string | null;
  };
  service?: {
    name: string;
    category: string;
  };
}

interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  consentSigned: boolean;
}

export default function ConsentScreen() {
  const [consents, setConsents] = useState<ConsentDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showSignModal, setShowSignModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("general");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [searchPatientQuery, setSearchPatientQuery] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Sign options
  const [signMethod, setSignMethod] = useState<"digital" | "file">("digital");
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [selectedConsentForView, setSelectedConsentForView] = useState<ConsentDocument | null>(null);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const data = await api.get<ConsentDocument[]>("/patients/consents/all");
      setConsents(data || []);
    } catch (err: any) {
      console.error("Error al cargar consentimientos:", err);
      toast.error("Error al cargar el historial de consentimientos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  // Search patients dynamically in the sign modal
  useEffect(() => {
    if (!showSignModal) return;
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const data = await api.get<any[]>(`/patients?search=${searchPatientQuery}`);
        setPatients(data || []);
      } catch (err) {
        console.error("Error al buscar pacientes:", err);
      } finally {
        setLoadingPatients(false);
      }
    };

    const delay = setTimeout(fetchPatients, 300);
    return () => clearTimeout(delay);
  }, [searchPatientQuery, showSignModal]);

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || "#0f172a";

    const pos = getEventPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getEventPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      e.preventDefault();
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getConsentText = (serviceId: string, patientName: string) => {
    if (serviceId === "general") {
      return `CONSENTIMIENTO INFORMADO GENERAL - REGISTRO CLÍNICO Y TRATAMIENTOS
Yo, ${patientName || "el paciente"}, en pleno uso de mis facultades, autorizo el registro de mi historial clínico, evolución física y la realización de tratamientos generales de fisioterapia y estética en BLOOM SKIN.
He sido informado de manera comprensible sobre las normas del centro, el manejo confidencial de mis datos clínicos y la necesidad de declarar con veracidad cualquier condición médica, antecedente o contraindicación.
Doy mi consentimiento para que se registren mediciones antropométricas y fotografías evolutivas únicamente con fines de seguimiento profesional y control de mi tratamiento.`;
    }
    return `CONSENTIMIENTO INFORMADO PARA TRATAMIENTO DE DEPILACIÓN LÁSER
Yo, ${patientName || "el paciente"}, en pleno uso de mis facultades, autorizo la realización del tratamiento de Depilación Láser en BLOOM SKIN.
He sido informado de que el procedimiento utiliza energía lumínica para calentar y destruir el folículo piloso. Comprendo que puede provocar eritema transitorio, leve inflamación o sensibilidad y que existe un riesgo menor de hiper/hipopigmentación temporal.
Declaro no estar embarazada, no tomar medicamentos fotosensibilizantes y no haber tomado sol en la zona a tratar en los últimos 15 días. Me comprometo a seguir las pautas post-tratamiento indicadas.`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo supera el límite de 5MB.");
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveConsent = async () => {
    if (!selectedPatientId) {
      toast.error("Debes seleccionar un paciente.");
      return;
    }
    if (signMethod === "digital" && !acceptTerms) {
      toast.error("Debes aceptar los términos legales.");
      return;
    }

    let signatureBase64 = "";
    if (signMethod === "digital") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureBase64 = canvas.toDataURL("image/png");
    } else {
      if (!uploadedFileBase64) {
        toast.error("Debes seleccionar y cargar un archivo de consentimiento escaneado.");
        return;
      }
      signatureBase64 = "scanned:" + uploadedFileBase64;
    }

    setIsSigning(true);
    try {
      await api.post(`/patients/${selectedPatientId}/consent`, {
        serviceId: selectedServiceId,
        signatureData: signatureBase64,
      });

      toast.success("Consentimiento guardado correctamente.");
      setShowSignModal(false);
      setSelectedPatientId("");
      setSelectedServiceId("general");
      setAcceptTerms(false);
      setSearchPatientQuery("");
      setSignMethod("digital");
      setUploadedFileBase64(null);
      setUploadedFileName("");
      loadConsents();
    } catch (err: any) {
      console.error("Error al guardar consentimiento:", err);
      toast.error(err.message || "Error al procesar la firma del consentimiento.");
    } finally {
      setIsSigning(false);
    }
  };

  const filteredConsents = consents.filter(c => {
    const patName = c.patient?.fullName.toLowerCase() || "";
    const srvName = c.service?.name.toLowerCase() || "consentimiento general";
    const query = searchQuery.toLowerCase();
    return patName.includes(query) || srvName.includes(query);
  });

  const signedTodayCount = consents.filter(c => {
    const todayStr = new Date().toDateString();
    const signedStr = new Date(c.signedAt).toDateString();
    return todayStr === signedStr;
  }).length;

  const totalSignedCount = consents.length;

  return (
    <div className="space-y-6">
      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">
            Total Firmados
          </h4>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-foreground">{totalSignedCount}</span>
            <span className="text-xs text-primary font-bold">documentos</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">Contratos legales firmados en pantalla.</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-success/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">
            Firmados Hoy
          </h4>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-success">{signedTodayCount}</span>
            <span className="text-xs text-success font-bold">hoy</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">Registrados en la fecha actual.</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">
            Estado del Módulo
          </h4>
          <div className="flex items-baseline gap-2.5">
            <span className="text-sm font-black text-primary uppercase tracking-widest">Digital Directo</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2.5 font-medium">Cero papel: Firma manuscrita encriptada.</p>
        </div>
      </div>

      {/* Header and toolbar */}
      <div className="bg-card border border-border rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Signature className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
              Digitalización de Consentimientos
            </h2>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Administre las autorizaciones médicas de tratamientos estéticos de la clínica.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por paciente o tratamiento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-border rounded-2xl bg-background text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </div>

          <button
            id="tour-consent-quick-sign"
            onClick={() => {
              setShowSignModal(true);
              setAcceptTerms(false);
              setSelectedPatientId("");
              setSearchPatientQuery("");
            }}
            className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-black px-5 py-2.5 rounded-2xl hover:bg-primary/95 transition-all shadow-md shadow-primary/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Firma Rápida
          </button>
        </div>
      </div>

      {/* Main Table list */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-lg">
        {loading && consents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-semibold">Cargando base de consentimientos...</span>
          </div>
        ) : filteredConsents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/35" />
            <div>
              <p className="text-sm font-bold text-foreground">Sin documentos archivados</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                {searchQuery ? "No se encontraron consentimientos que coincidan con la búsqueda." : "No hay consentimientos firmados aún en este centro. Utiliza 'Firma Rápida' para registrar el primero."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                  <th className="p-4 pl-6">Paciente</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Tratamiento / Servicio</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4 pr-6 text-right">Firma Digital</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium text-foreground">
                {filteredConsents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 pl-6 font-bold text-foreground">
                      {doc.patient?.fullName || "Paciente no encontrado"}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">
                      {doc.patient?.phone || "N/A"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        doc.service?.name.includes("General") 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "bg-success/10 text-success border border-success/20"
                      }`}>
                        {doc.service?.name || "Consentimiento General"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(doc.signedAt).toLocaleDateString("es-MX", { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {doc.signatureData.startsWith("scanned:") ? (
                        <button
                          onClick={() => setSelectedConsentForView(doc)}
                          className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg hover:bg-primary/20 transition-all border border-primary/20 cursor-pointer"
                        >
                          Ver Documento
                        </button>
                      ) : doc.signatureData.startsWith("data:") ? (
                        <div 
                          onClick={() => setSelectedConsentForView(doc)}
                          className="inline-block bg-white p-1 rounded border border-border h-8 w-24 overflow-hidden select-none cursor-pointer hover:border-primary transition-all"
                        >
                          <img src={doc.signatureData} alt="Firma digital" className="h-full w-full object-contain filter invert-0" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Firmado manuscrito</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE FIRMA RÁPIDA */}
      {showSignModal && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border pb-4">
              <Signature className="w-5 h-5 text-primary animate-pulse" />
              Nueva Firma Rápida de Consentimiento
            </h3>

            <button
              onClick={() => setShowSignModal(false)}
              className="absolute right-5 top-2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="space-y-4">
              {/* Buscador y selector de Paciente */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Seleccionar Paciente *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <input
                    id="tour-consent-patient-search"
                    type="text"
                    placeholder="Escribe para buscar paciente..."
                    value={searchPatientQuery}
                    onChange={(e) => setSearchPatientQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-muted border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  />
                </div>

                {/* Resultados de búsqueda del paciente */}
                {showSignModal && searchPatientQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-popover border border-border rounded-xl shadow-xl max-h-36 overflow-y-auto z-50 divide-y divide-border animate-in fade-in slide-in-from-top-1 duration-150">
                    {loadingPatients ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">Buscando...</div>
                    ) : patients.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">No se encontraron pacientes.</div>
                    ) : (
                      patients.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setSearchPatientQuery(p.fullName);
                          }}
                          className={`w-full text-left p-2.5 text-xs hover:bg-muted font-medium transition-colors flex justify-between items-center ${
                            selectedPatientId === p.id ? 'bg-primary/10 text-primary' : 'text-foreground'
                          }`}
                        >
                          <span>{p.fullName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{p.phone}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selector de tipo de consentimiento */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Tratamiento / Documento Legal *
                </label>
                <select
                  id="tour-consent-service-select"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full text-xs font-bold bg-muted border border-border rounded-xl p-2.5 focus:outline-none text-foreground"
                >
                  <option value="general">Consentimiento Informado General (Clínica)</option>
                  <option value="fallback-laser">Consentimiento de Depilación Láser</option>
                </select>
              </div>
              {/* Método de Registro (Firma Digital o Subir Archivo) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Método de Firma *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setSignMethod("digital")}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      signMethod === "digital" 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Firma en Pantalla
                  </button>
                  <button
                    type="button"
                    id="tour-consent-method-file"
                    onClick={() => setSignMethod("file")}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      signMethod === "file" 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Subir Escaneado
                  </button>
                </div>
              </div>

              {/* Canvas de Firma o Carga de Archivo */}
              {signMethod === "digital" ? (
                <>
                  {/* Texto legal de consentimiento */}
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Declaración Legal de Consentimiento
                    </label>
                    <div className="bg-muted border border-border rounded-2xl p-4 text-[10px] text-muted-foreground max-h-32 overflow-y-auto leading-relaxed whitespace-pre-line font-medium border-l-4 border-l-primary shadow-inner">
                      {getConsentText(
                        selectedServiceId,
                        patients.find(p => p.id === selectedPatientId)?.fullName || ""
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Firma Manuscrita Digitalizada
                      </label>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[10px] text-primary font-black hover:underline"
                      >
                        Limpiar Lienzo
                      </button>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-2xl bg-muted p-1 relative overflow-hidden flex justify-center items-center">
                      <canvas
                        id="tour-consent-canvas"
                        ref={canvasRef}
                        width={450}
                        height={140}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="bg-card rounded-xl cursor-crosshair max-w-full h-[140px]"
                      />
                    </div>
                  </div>

                  {/* Checkbox Aceptación */}
                  <label className="flex items-start gap-3 cursor-pointer select-none py-1">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                    />
                    <span className="text-[11px] text-muted-foreground leading-snug font-medium">
                      Declaro que he leído el consentimiento informado en su totalidad y que el paciente ha firmado de conformidad y con pleno entendimiento de los riesgos.
                    </span>
                  </label>
                </>
              ) : (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Cargar Documento Escaneado (PDF o Imagen) *
                  </label>
                  <div className="border-2 border-dashed border-border rounded-2xl bg-muted p-6 text-center relative hover:border-primary transition-all">
                    <input
                      type="file"
                      id="tour-consent-file-input"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {uploadedFileName || "Haz clic para seleccionar o arrastra el archivo aquí"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Soporta PDF, PNG, JPG hasta 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3 justify-end border-t border-border">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="px-5 py-2.5 border border-border text-xs font-bold text-muted-foreground rounded-xl hover:bg-muted"
                disabled={isSigning}
              >
                Cancelar
              </button>
              <button
                id="tour-consent-submit"
                type="button"
                onClick={handleSaveConsent}
                disabled={isSigning}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-primary/95 shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Archivando...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Archivar Firma
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISOR DE DOCUMENTO / FIRMA */}
      {selectedConsentForView && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border pb-4">
              <FileText className="w-5 h-5 text-primary" />
              Documento de Consentimiento Firmado
            </h3>

            <button
              onClick={() => setSelectedConsentForView(null)}
              className="absolute right-5 top-2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-muted p-4 rounded-2xl border border-border">
                <div>
                  <span className="text-muted-foreground font-semibold block text-[10px] uppercase tracking-wider">Paciente</span>
                  <span className="font-bold text-foreground">{selectedConsentForView.patient?.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block text-[10px] uppercase tracking-wider">Tratamiento / Servicio</span>
                  <span className="font-bold text-foreground">{selectedConsentForView.service?.name || "Consentimiento General"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block text-[10px] uppercase tracking-wider">Contacto</span>
                  <span className="font-bold text-foreground font-mono">{selectedConsentForView.patient?.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block text-[10px] uppercase tracking-wider">Fecha y Hora de Firma</span>
                  <span className="font-bold text-foreground">
                    {new Date(selectedConsentForView.signedAt).toLocaleString("es-MX")}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {selectedConsentForView.signatureData.startsWith("scanned:") ? "Documento Escaneado" : "Firma Manuscrita Registrada"}
                </span>

                <div className="border border-border rounded-2xl bg-muted p-4 flex justify-center items-center max-h-[50vh] overflow-y-auto">
                  {selectedConsentForView.signatureData.startsWith("scanned:") ? (
                    selectedConsentForView.signatureData.includes("application/pdf") ? (
                      <embed
                        src={selectedConsentForView.signatureData.replace("scanned:", "")}
                        type="application/pdf"
                        className="w-full h-[400px] rounded-xl border border-border"
                      />
                    ) : (
                      <img
                        src={selectedConsentForView.signatureData.replace("scanned:", "")}
                        alt="Documento escaneado"
                        className="max-w-full max-h-[400px] object-contain rounded-xl shadow-lg border border-border"
                      />
                    )
                  ) : (
                    <div className="bg-white p-6 rounded-xl border border-border shadow-inner">
                      <img
                        src={selectedConsentForView.signatureData}
                        alt="Firma"
                        className="h-28 w-auto object-contain filter invert-0"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setSelectedConsentForView(null)}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
