import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Activity,
  Image as ImageIcon,
  Receipt,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  Search,
  User,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  PenTool,
  Trash2,
  FileSignature,
  Sparkles,
  Upload,
  Camera,
  Calendar,
  Edit3,
  Check,
  AlertCircle
} from "lucide-react";
import { api, API_URL } from "../services/api";
import { toast } from "sonner";
const SERVER_URL = API_URL.replace(/\/api$/, "");
import { animate } from "animejs";

type PatientTab = "historial" | "evolucion" | "consentimiento" | "galeria" | "facturacion";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PatientPhoto {
  id: string;
  patientId: string;
  type: "before" | "after";
  photoData?: string; // base64 string for offline queue
  url?: string;       // server relative url
  notes: string;
  uploadedAt: string;
  isPendingSync?: boolean;
}

interface PatientListItem {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  consentSigned: boolean;
}

interface RetouchScheduleItem {
  id: string;
  patientId: string;
  serviceId: string;
  service: { name: string };
  originalAppointmentId: string;
  retouchAppointmentId: string | null;
  scheduledDate: string;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "EXPIRED" | "WAIVED";
  notes: string | null;
  createdAt: string;
}

interface SessionDetail {
  id: string;
  sessionNumber: number;
  evolutionNotes: string;
  measurements: {
    weight?: number;
    waist?: number;
    hip?: number;
    laser?: string;
    nozzles?: string;
    shots?: number;
  } | null;
  createdAt: string;
  appointment: {
    dateTime: string;
    professional: { name: string };
  };
  packageLine?: { serviceName: string } | null;
}

interface PatientPackageLine {
  id: string;
  serviceId?: string | null;
  serviceName: string;
  totalSessions: number;
  usedSessions: number;
  sessionDetails?: any[];
}

interface PatientPackage {
  id: string;
  packageName: string;
  status: string;
  purchasedAt: string;
  lines: PatientPackageLine[];
}

interface ConsentDocumentItem {
  id: string;
  patientId: string;
  serviceId: string;
  service: {
    id: string;
    name: string;
  };
  signatureData: string;
  signedAt: string;
}

interface PatientData {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  consentSigned: boolean;
  medicalHistory: string | null;
  treatmentPackages: PatientPackage[];
  retouchSchedules: RetouchScheduleItem[];
  appointments: {
    id: string;
    dateTime: string;
    duration: number;
    status: string;
    professional: { name: string };
  }[];
  consentDocuments?: ConsentDocumentItem[];
}

type TimelineItem =
  | ({ type: "SESSION" } & SessionDetail)
  | ({ type: "RETOUCH" } & RetouchScheduleItem);

// ── Component ─────────────────────────────────────────────────────────────────

export default function PatientScreen({
  searchSelectedPatientId,
  clearSearchSelectedPatientId
}: {
  searchSelectedPatientId?: string | null;
  clearSearchSelectedPatientId?: () => void;
}) {
  // List panel
  const [patientList, setPatientList] = useState<PatientListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listSearch, setListSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (searchSelectedPatientId) {
      handleSelectPatient(searchSelectedPatientId);
      if (clearSearchSelectedPatientId) {
        clearSearchSelectedPatientId();
      }
    }
  }, [searchSelectedPatientId]);

  // Photo Gallery States
  const [photos, setPhotos] = useState<PatientPhoto[]>([]);
  const [selectedPhotoType, setSelectedPhotoType] = useState<"before" | "after">("before");
  const [photoNotes, setPhotoNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Detail panel
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PatientTab>("evolucion");

  // Register session modal
  const [showModal, setShowModal] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [selectedLineId, setSelectedLineId] = useState("");
  const [evolutionNotes, setEvolutionNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [laser, setLaser] = useState("");
  const [nozzles, setNozzles] = useState("");
  const [shots, setShots] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Consent
  const [selectedConsentServiceId, setSelectedConsentServiceId] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Create Patient States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newMedicalHistory, setNewMedicalHistory] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Clinical History States
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [editedHistory, setEditedHistory] = useState("");
  const [historySubmitting, setHistorySubmitting] = useState(false);

  // Edit Patient, Delete Photo & Waive Retouch Confirmation States
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [retouchToDismiss, setRetouchToDismiss] = useState<any | null>(null);

  // Lightbox & Slider Comparison States
  const [lightboxPhoto, setLightboxPhoto] = useState<PatientPhoto | null>(null);
  const [sliderPhotoBefore, setSliderPhotoBefore] = useState<PatientPhoto | null>(null);
  const [sliderPhotoAfter, setSliderPhotoAfter] = useState<PatientPhoto | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPos, setComparisonPos] = useState(50);

  const modalRef = useRef<HTMLDivElement>(null);

  // ── Load patient list ──────────────────────────────────────────────────────

  const loadList = async () => {
    try {
      setListLoading(true);
      const data = await api.get<PatientListItem[]>("/patients");
      setPatientList(data);
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => { loadList(); }, []);

  // ── Load patient detail ────────────────────────────────────────────────────

  const loadPatient = async (id: string) => {
    try {
      setDetailLoading(true);
      setPatient(null);
      
      loadPhotos(id); // Cargar fotos locales para el paciente seleccionado
      
      const data = await api.get<PatientData>(`/patients/${id}`);

      // CARGAR CONSENTIMIENTOS DESDE LOCAL STORAGE COMO FALLBACK OFFLINE Y FUSIONARLOS
      const localConsentsKey = `offline_consents_${id}`;
      const localConsentsRaw = localStorage.getItem(localConsentsKey);
      let localConsents: ConsentDocumentItem[] = [];
      if (localConsentsRaw) {
        try {
          localConsents = JSON.parse(localConsentsRaw);
        } catch (e) {
          console.error("Error al parsear consentimientos offline:", e);
        }
      }

      const apiConsents = data.consentDocuments || [];
      const combinedConsents = [...apiConsents];
      localConsents.forEach((lc) => {
        if (!combinedConsents.some((ac) => ac.id === lc.id)) {
          combinedConsents.push(lc);
        }
      });

      combinedConsents.sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime());
      data.consentDocuments = combinedConsents;

      // Si hay consentimientos o el backend indica firmado o el localstorage global, marcamos consentSigned a true
      if (combinedConsents.length > 0 || localStorage.getItem(`consent_signed_${id}`) === "true") {
        data.consentSigned = true;
      }

      setPatient(data);

      // Build session timeline from packages and retouch schedules
      const items: TimelineItem[] = [];

      // 1. Sesiones de tratamiento
      data.treatmentPackages?.forEach((pkg) => {
        pkg.lines.forEach((line: any) => {
          if (line.sessionDetails) {
            line.sessionDetails.forEach((sess: any) => {
              items.push({
                type: "SESSION",
                ...sess,
                packageLine: { serviceName: line.serviceName }
              });
            });
          }
        });
      });

      // 2. Retoques programados (Fase 2)
      data.retouchSchedules?.forEach((retouch) => {
        items.push({
          type: "RETOUCH",
          ...retouch
        });
      });

      // Ordenar por fecha decreciente (createdAt para sesiones, scheduledDate o createdAt para retoques)
      items.sort((a, b) => {
        const dateA = a.type === "SESSION" ? new Date(a.createdAt).getTime() : new Date(a.scheduledDate).getTime();
        const dateB = b.type === "SESSION" ? new Date(b.createdAt).getTime() : new Date(b.scheduledDate).getTime();
        return dateB - dateA;
      });

      setTimeline(items);

      const pending = data.appointments?.filter((a) => a.status === "PENDIENTE" || a.status === "CONFIRMADA") || [];
      setPendingAppointments(pending);
    } catch (err) {
      console.error("Error al cargar expediente:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Helper para cargar fotos del paciente desde la API y el LocalStorage offline
  const loadPhotos = async (patientId: string) => {
    try {
      // 1. Cargar cola offline
      const queueKey = `patient_photos_queue_${patientId}`;
      const queuedRaw = localStorage.getItem(queueKey);
      const queued: PatientPhoto[] = queuedRaw ? JSON.parse(queuedRaw) : [];

      // 2. Cargar fotos del servidor
      const serverPhotos = await api.get<any[]>(`/patients/${patientId}/photos`);
      const mappedServerPhotos: PatientPhoto[] = serverPhotos.map((p) => ({
        id: p.id,
        patientId: p.patientId,
        type: p.type.toLowerCase() === 'before' ? 'before' : 'after',
        url: p.url,
        notes: p.notes || "",
        uploadedAt: p.createdAt,
      }));

      // Fusionar
      setPhotos([...queued, ...mappedServerPhotos]);
    } catch (err) {
      console.error("Error al cargar fotos de la API:", err);
      // Fallback a solo local si falla red
      const queueKey = `patient_photos_queue_${patientId}`;
      const queuedRaw = localStorage.getItem(queueKey);
      const queued: PatientPhoto[] = queuedRaw ? JSON.parse(queuedRaw) : [];
      setPhotos(queued);
    }
  };

  const handleSyncPhotos = async (patientId: string) => {
    const queueKey = `patient_photos_queue_${patientId}`;
    const queuedRaw = localStorage.getItem(queueKey);
    if (!queuedRaw) return;
    const queued: PatientPhoto[] = JSON.parse(queuedRaw);
    if (queued.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    const remainingQueue: PatientPhoto[] = [];

    for (const item of queued) {
      try {
        await api.post(`/patients/${patientId}/photos`, {
          id: item.id.replace('offline-', ''),
          photoData: item.photoData,
          type: item.type.toUpperCase(),
          notes: item.notes,
        });
        successCount++;
      } catch (e) {
        console.error("Error syncing photo:", e);
        remainingQueue.push(item);
      }
    }

    if (remainingQueue.length > 0) {
      localStorage.setItem(queueKey, JSON.stringify(remainingQueue));
    } else {
      localStorage.removeItem(queueKey);
    }

    await loadPhotos(patientId);
    setIsUploading(false);
    if (successCount > 0) {
      toast.success(`Sincronizadas ${successCount} fotos con el servidor.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoUploadError(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!photoFile) {
      setPhotoUploadError("Por favor, selecciona una imagen.");
      return;
    }
    setIsUploading(true);
    setPhotoUploadError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const tempId = `offline-${Date.now()}`;
      
      const newPhoto: PatientPhoto = {
        id: tempId,
        patientId: patient.id,
        type: selectedPhotoType,
        photoData: base64String,
        notes: photoNotes,
        uploadedAt: new Date().toISOString(),
        isPendingSync: true,
      };

      try {
        // Intentar subir de inmediato al servidor
        await api.post(`/patients/${patient.id}/photos`, {
          photoData: base64String,
          type: selectedPhotoType.toUpperCase(),
          notes: photoNotes,
        });

        // Cargar del servidor
        await loadPhotos(patient.id);
        setPhotoNotes("");
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        console.warn("Fallo de red al subir foto. Guardando en cola local para sincronización.", err);
        // Guardar en cola local
        const queueKey = `patient_photos_queue_${patient.id}`;
        const queuedRaw = localStorage.getItem(queueKey);
        const queued: PatientPhoto[] = queuedRaw ? JSON.parse(queuedRaw) : [];
        const updatedQueue = [newPhoto, ...queued];
        localStorage.setItem(queueKey, JSON.stringify(updatedQueue));

        setPhotos((prev) => [newPhoto, ...prev]);
        setPhotoNotes("");
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setPhotoUploadError("Error al leer el archivo de imagen.");
      setIsUploading(false);
    };

    reader.readAsDataURL(photoFile);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!patient) return;
    setPhotoToDelete(photoId);
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab("evolucion");
    loadPatient(id);

    setPhotoNotes("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    setIsEditingHistory(false);
    setEditedHistory("");
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone) {
      setCreateError("El nombre completo y el teléfono son campos obligatorios.");
      return;
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      if (isEditingPatient) {
        const result = await api.put<any>(`/patients/${patient!.id}`, {
          fullName: newFullName,
          phone: newPhone,
          email: newEmail || null,
        });
        const updatedPatient = result.patient || result;

        setPatientList((prev) => prev.map(p => p.id === patient!.id ? {
          ...p,
          fullName: updatedPatient.fullName,
          phone: updatedPatient.phone,
          email: updatedPatient.email,
        } : p).sort((a, b) => a.fullName.localeCompare(b.fullName)));

        setPatient(prev => prev ? {
          ...prev,
          fullName: updatedPatient.fullName,
          phone: updatedPatient.phone,
          email: updatedPatient.email,
        } : null);

        toast.success("Paciente actualizado correctamente.");
      } else {
        const result = await api.post<any>("/patients", {
          fullName: newFullName,
          phone: newPhone,
          email: newEmail || null,
          medicalHistory: newMedicalHistory || null,
        });

        const createdPatient = result.patient || result;

        setPatientList((prev) => [
          {
            id: createdPatient.id,
            fullName: createdPatient.fullName,
            phone: createdPatient.phone,
            email: createdPatient.email,
            consentSigned: createdPatient.consentSigned || false,
          },
          ...prev,
        ].sort((a, b) => a.fullName.localeCompare(b.fullName)));

        toast.success("Paciente registrado correctamente.");
        handleSelectPatient(createdPatient.id);
      }

      setShowCreateModal(false);
      setIsEditingPatient(false);
      setNewFullName("");
      setNewPhone("");
      setNewEmail("");
      setNewMedicalHistory("");
    } catch (err: any) {
      setCreateError(err.message || "Error al procesar el paciente.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleSaveMedicalHistory = async () => {
    if (!patient) return;
    setHistorySubmitting(true);
    try {
      await api.put(`/patients/${patient.id}`, {
        medicalHistory: editedHistory,
      });
      setPatient((prev) => prev ? { ...prev, medicalHistory: editedHistory } : null);
      setIsEditingHistory(false);
      toast.success("Ficha clínica guardada correctamente.");
    } catch (err: any) {
      toast.error("Error al guardar la ficha clínica: " + (err.message || "Error desconocido"));
    } finally {
      setHistorySubmitting(false);
    }
  };

  // ── Modal animation ────────────────────────────────────────────────────────

  useEffect(() => {
    if (showModal && modalRef.current) {
      animate(modalRef.current, {
        scale: [0.95, 1],
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutElastic(1, .8)",
      });
    }
  }, [showModal]);

  // ── Register session ────────────────────────────────────────────────────────

  const handleCompleteSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!selectedAppointmentId) { setError("Debes seleccionar una cita."); setSubmitting(false); return; }
    if (!selectedLineId) { setError("Selecciona el servicio a descontar del bono."); setSubmitting(false); return; }

    try {
      await api.post(`/appointments/${selectedAppointmentId}/complete`, {
        packageLineId: selectedLineId,
        evolutionNotes,
        measurements: {
          weight: weight ? Number(weight) : undefined,
          waist: waist ? Number(waist) : undefined,
          hip: hip ? Number(hip) : undefined,
          laser: laser || undefined,
          nozzles: nozzles || undefined,
          shots: shots ? Number(shots) : undefined,
        },
      });
      if (selectedPatientId) await loadPatient(selectedPatientId);
      await loadList();
      setShowModal(false);
      setEvolutionNotes(""); setWeight(""); setWaist(""); setHip("");
      setLaser(""); setNozzles(""); setShots("");
      setSelectedAppointmentId(""); setSelectedLineId("");
    } catch (err: any) {
      setError(err.message || "Error al registrar la sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Canvas Drawing Helpers ──────────────────────────────────────────────────

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";

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

  // ── Submit Consent ──────────────────────────────────────────────────────────

  const handleSaveConsent = async () => {
    if (!patient) return;
    setConsentError(null);
    setIsSigning(true);

    if (!selectedConsentServiceId) {
      setConsentError("Debes seleccionar un servicio para el consentimiento.");
      setIsSigning(false);
      return;
    }

    if (!acceptTerms) {
      setConsentError("Debes aceptar los términos y condiciones para continuar.");
      setIsSigning(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureBase64 = canvas.toDataURL("image/png");

    try {
      await api.post(`/patients/${patient.id}/consent`, {
        serviceId: selectedConsentServiceId,
        signatureData: signatureBase64,
      });

      await loadPatient(patient.id);
      await loadList();
      setIsSigning(false);
      setAcceptTerms(false);
      setSelectedConsentServiceId("");
    } catch (err: any) {
      console.warn("Fallo al guardar consentimiento en API, usando fallback offline en LocalStorage:", err);
      
      const localConsentsKey = `offline_consents_${patient.id}`;
      const localConsentsRaw = localStorage.getItem(localConsentsKey);
      const localConsents: ConsentDocumentItem[] = localConsentsRaw ? JSON.parse(localConsentsRaw) : [];

      const selectedServiceName = patient.treatmentPackages
        .flatMap((pkg) => pkg.lines)
        .find((l) => l.serviceId === selectedConsentServiceId || l.id === selectedConsentServiceId)
        ?.serviceName || 
        (selectedConsentServiceId === "fallback-laser" ? "Depilación Láser" :
         selectedConsentServiceId === "fallback-cavitacion" ? "Cavitación Corporal" :
         selectedConsentServiceId === "fallback-facial" ? "Tratamiento Facial" :
         selectedConsentServiceId === "fallback-rehab" ? "Fisioterapia" : "Servicio General");

      const newConsent: ConsentDocumentItem = {
        id: `offline-${Date.now()}`,
        patientId: patient.id,
        serviceId: selectedConsentServiceId,
        service: {
          id: selectedConsentServiceId,
          name: selectedServiceName,
        },
        signatureData: signatureBase64,
        signedAt: new Date().toISOString(),
      };

      localConsents.push(newConsent);
      localStorage.setItem(localConsentsKey, JSON.stringify(localConsents));
      localStorage.setItem(`consent_signed_${patient.id}`, "true");

      await loadPatient(patient.id);
      await loadList();
      setIsSigning(false);
      setAcceptTerms(false);
      setSelectedConsentServiceId("");
    }
  };

  const getConsentText = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes("laser") || name.includes("láser") || name.includes("depila") || name.includes("soprano")) {
      return `CONSENTIMIENTO INFORMADO PARA TRATAMIENTO DE DEPILACIÓN LÁSER
Yo, ${patient?.fullName}, en pleno uso de mis facultades, autorizo la realización del tratamiento de Depilación Láser en BLOOM SKIN.
He sido informado de que el procedimiento utiliza energía lumínica para calentar y destruir el folículo piloso. Comprendo que puede provocar eritema transitorio, leve inflamación o sensibilidad y que existe un riesgo menor de hiper/hipopigmentación temporal.
Declaro no estar embarazada, no tomar medicamentos fotosensibilizantes y no haber tomado sol en la zona a tratar en los últimos 15 días. Me comprometo a seguir las pautas post-tratamiento indicadas.`;
    }
    
    if (name.includes("cavitacion") || name.includes("cavitación") || name.includes("corporal") || name.includes("reductor") || name.includes("criolipolisis")) {
      return `CONSENTIMIENTO INFORMADO PARA TRATAMIENTOS CORPORALES REDUCTORES
Yo, ${patient?.fullName}, autorizo los tratamientos corporales indicados orientados a la reducción de grasa localizada y modelado corporal.
Entiendo que técnicas como cavitación, criolipólisis o radiofrecuencia actúan sobre el tejido subcutáneo. Se me ha explicado detalladamente la necesidad de mantener una hidratación abundante y hábitos alimenticios saludables para optimizar el drenaje linfático.
Declaro no portar marcapasos ni prótesis metálicas en la zona, ni padecer insuficiencia hepática o renal grave.`;
    }
    
    if (name.includes("facial") || name.includes("peeling") || name.includes("anti-edad")) {
      return `CONSENTIMIENTO INFORMADO PARA TRATAMIENTOS FACIALES Y ESTÉTICOS
Yo, ${patient?.fullName}, autorizo la realización del tratamiento facial y rejuvenecimiento en BLOOM SKIN.
Comprendo que la aplicación de principios activos, peelings químicos o aparatología facial busca la renovación del tejido dérmico. Entiendo los riesgos de descamación leve, eritema y la obligatoriedad del uso diario de fotoprotección FPS 50+.
Declaro no padecer herpes labial activo ni sensibilidad extrema a los ácidos estéticos indicados.`;
    }

    return `CONSENTIMIENTO INFORMADO GENERAL DE TRATAMIENTO ESTÉTICO
Yo, ${patient?.fullName}, autorizo la realización del tratamiento de ${serviceName} en BLOOM SKIN.
He recibido explicaciones claras del procedimiento, sus beneficios esperados y sus efectos secundarios comunes. Confirmo que he resuelto todas mis dudas y que los datos declarados en mi ficha clínica son verídicos.
Me comprometo a seguir rigurosamente las pautas post-tratamiento indicadas por el profesional.`;
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredList = patientList.filter((p) =>
    p.fullName.toLowerCase().includes(listSearch.toLowerCase()) ||
    p.phone.includes(listSearch)
  );

  const tabs: { id: PatientTab; label: string; Icon: React.ComponentType<any> }[] = [
    { id: "historial",   label: "Historial Clínico",   Icon: FileText },
    { id: "evolucion",   label: "Evolución",            Icon: Activity },
    { id: "consentimiento", label: "Consentimiento",     Icon: FileSignature },
    { id: "galeria",     label: "Galería",              Icon: ImageIcon },
    { id: "facturacion", label: "Facturación",          Icon: Receipt },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full overflow-hidden">
      {/* ══ LEFT — Patient List ══════════════════════════════════════════════ */}
      <aside id="tour-patients-list" className="w-[280px] flex-shrink-0 border-r border-border flex flex-col" style={{ background: 'rgba(18, 17, 24, 0.55)', backdropFilter: 'blur(20px)' }}>

        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background"
            />
          </div>
          <button
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="flex-shrink-0 p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/15"
            title="Nuevo Paciente"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {listLoading ? (
            <div className="flex items-center justify-center h-32 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Cargando...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 px-4 text-center">
              <User className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground font-medium">
                {listSearch ? "Sin resultados para la búsqueda." : "No hay pacientes registrados."}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredList.map((p) => {
                const isSelected = selectedPatientId === p.id;
                const initials = p.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-4 ${
                      isSelected
                        ? "bg-primary/8 border-l-primary"
                        : "border-l-transparent hover:bg-muted/60"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {p.fullName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{p.phone}</p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {p.consentSigned || localStorage.getItem(`consent_signed_${p.id}`) === "true"
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      }
                      {isSelected && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border bg-black/10">
          <p className="text-[11px] text-muted-foreground font-semibold">
            {filteredList.length} paciente{filteredList.length !== 1 ? "s" : ""} {listSearch ? "encontrado" : "registrado"}{filteredList.length !== 1 ? "s" : ""}
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-primary/60" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Selecciona un Paciente</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Elige un paciente del listado para ver su expediente clínico, historial de sesiones y evolución.
              </p>
            </div>
          </div>
        ) : detailLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Cargando expediente...</p>
          </div>
        ) : patient ? (
          <>
            <div className="bg-card border-b border-slate-400 px-6 py-5 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-lg">
                    {patient.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-foreground">{patient.fullName}</h2>
                      <button
                        onClick={() => {
                          setNewFullName(patient.fullName);
                          setNewPhone(patient.phone);
                          setNewEmail(patient.email || "");
                          setNewMedicalHistory(patient.medicalHistory || "");
                          setIsEditingPatient(true);
                          setCreateError(null);
                          setShowCreateModal(true);
                        }}
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors cursor-pointer"
                        title="Editar datos de contacto"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        patient.consentSigned || localStorage.getItem(`consent_signed_${patient.id}`) === "true"
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                          : "text-amber-700 bg-amber-50 border border-amber-200"
                      }`}>
                        {patient.consentSigned || localStorage.getItem(`consent_signed_${patient.id}`) === "true" ? "Consentimiento Firmado" : "Pendiente de Firma"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        <Phone className="w-3 h-3" /> {patient.phone}
                      </span>
                      {patient.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Mail className="w-3 h-3" /> {patient.email}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-medium">
                        ID: <span className="font-mono">{patient.id.slice(0, 8).toUpperCase()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {patient.treatmentPackages.map((pkg) => {
                    const totalUsed = pkg.lines.reduce((s, l) => s + l.usedSessions, 0);
                    const totalSess = pkg.lines.reduce((s, l) => s + l.totalSessions, 0);
                    return (
                      <div key={pkg.id} className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider truncate max-w-[160px]">{pkg.packageName}</p>
                        <p className="text-xs font-bold text-emerald-800 mt-0.5">{totalUsed}/{totalSess} sesiones</p>
                      </div>
                    );
                  })}
                  {patient.treatmentPackages.length === 0 && (
                    <span className="text-xs text-muted-foreground italic px-2 py-1">Sin bonos activos</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex border-b border-slate-400 bg-card px-6 gap-1 flex-shrink-0">
              {tabs.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  id={`tour-tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 py-3.5 px-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
                    activeTab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden">

              {activeTab === "historial" && (
                <div className="bg-card rounded-2xl border border-slate-300 p-6 max-w-3xl flex flex-col space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Antecedentes Médicos y Ficha Clínica</h3>
                    {!isEditingHistory ? (
                      <button
                        onClick={() => {
                          setEditedHistory(patient.medicalHistory || "");
                          setIsEditingHistory(true);
                        }}
                        className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar Ficha
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveMedicalHistory}
                          disabled={historySubmitting}
                          className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {historySubmitting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Guardar
                        </button>
                        <button
                          onClick={() => setIsEditingHistory(false)}
                          disabled={historySubmitting}
                          className="flex items-center gap-1 bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-300 transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isEditingHistory ? (
                    <textarea
                      value={editedHistory}
                      onChange={(e) => setEditedHistory(e.target.value)}
                      placeholder="Registra antecedentes patológicos, cirugías previas, alergias, tipo de piel, contraindicaciones..."
                      className="w-full min-h-[300px] p-4 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background font-sans leading-relaxed"
                      disabled={historySubmitting}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed min-h-[150px]">
                      {patient.medicalHistory ? (
                        patient.medicalHistory
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                          <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
                          <p className="text-xs text-muted-foreground font-semibold">Sin antecedentes médicos registrados.</p>
                          <button
                            onClick={() => {
                              setEditedHistory("");
                              setIsEditingHistory(true);
                            }}
                            className="text-xs text-primary font-bold hover:underline"
                          >
                            Registrar ficha clínica →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "evolucion" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div id="tour-patients-history" className="lg:col-span-2 bg-card rounded-2xl border border-slate-300 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Evolución de Sesiones</h3>
                      <button
                        id="tour-patients-register-btn"
                        onClick={() => { setError(null); setShowModal(true); }}
                        className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/15"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Registrar Sesión
                      </button>
                    </div>
                    {timeline.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <Activity className="w-10 h-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">Aún no hay sesiones registradas.</p>
                        <button
                          onClick={() => { setError(null); setShowModal(true); }}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Registrar primera sesión →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {timeline.map((item) => {
                          if (item.type === "SESSION") {
                            const isLaser = item.measurements?.laser || item.measurements?.nozzles || item.measurements?.shots;
                            return (
                              <div key={item.id} className="bg-card border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isLaser ? 'bg-violet-500' : 'bg-primary'}`} />
                                <div className="pl-2 flex justify-between items-start flex-wrap gap-2">
                                  <div>
                                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                      {isLaser ? '⚡' : '💆'} {item.packageLine?.serviceName || "Tratamiento"}
                                      <span className="px-2.5 py-0.5 text-[10px] font-black bg-slate-100 text-slate-600 rounded-full">
                                        Sesión #{item.sessionNumber}
                                      </span>
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      Realizado el {new Date(item.appointment.dateTime).toLocaleDateString("es-MX")} por {item.appointment.professional.name}
                                    </p>
                                  </div>
                                </div>
                                {item.measurements && (
                                  <div className="pl-2 flex flex-wrap gap-2 pt-1">
                                    {item.measurements.laser && (
                                      <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-100 rounded-xl">
                                        <span>⚡</span> Láser: {item.measurements.laser}
                                      </span>
                                    )}
                                    {item.measurements.nozzles && (
                                      <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl">
                                        <span>🔍</span> Cabezal: {item.measurements.nozzles}
                                      </span>
                                    )}
                                    {item.measurements.shots !== undefined && (
                                      <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-pink-700 bg-pink-50 border border-pink-100 rounded-xl">
                                        <span>🎯</span> Disparos: {Number(item.measurements.shots).toLocaleString()}
                                      </span>
                                    )}
                                    {item.measurements.weight && (
                                      <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <span>⚖️</span> Peso: {item.measurements.weight} kg
                                      </span>
                                    )}
                                    {item.measurements.waist && (
                                      <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-100 rounded-xl">
                                        <span>📏</span> Cintura: {item.measurements.waist} cm
                                      </span>
                                    )}
                                    {item.measurements.hip && (
                                      <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl">
                                        <span>🍑</span> Cadera: {item.measurements.hip} cm
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div className="pl-2 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Nota Evolutiva</p>
                                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                    {item.evolutionNotes || "Sin observaciones."}
                                  </p>
                                </div>
                              </div>
                            );
                          } else {
                            const targetDate = new Date(item.scheduledDate);
                            const daysDiff = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            let retouchBadge = "bg-violet-100 text-violet-800 border-violet-200";
                            let retouchLabel = `Programado para el ${targetDate.toLocaleDateString("es-MX")} (en ${daysDiff} días)`;

                            if (item.status === "COMPLETED") {
                              retouchBadge = "bg-emerald-100 text-emerald-800 border-emerald-200";
                              retouchLabel = "Retoque Completado";
                            } else if (item.status === "WAIVED") {
                              retouchBadge = "bg-slate-100 text-slate-600 border-slate-200";
                              retouchLabel = "Retoque Desestimado por el Paciente";
                            } else if (daysDiff < 0) {
                              retouchBadge = "bg-red-100 text-red-800 border-red-200 animate-pulse";
                              retouchLabel = `Retoque Vencido hace ${Math.abs(daysDiff)} días`;
                            }

                            return (
                              <div key={item.id} className="border-l-4 border-violet-500 bg-violet-50/20 rounded-r-xl p-4 space-y-2 shadow-sm">
                                <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                                  <span className="font-bold text-violet-950 flex items-center gap-1.5">
                                    🔄 Retoque Clínico: {item.service?.name || "Tratamiento Especial"}
                                  </span>
                                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${retouchBadge}`}>
                                    {retouchLabel}
                                  </span>
                                </div>
                                {item.status === "PENDING" && (
                                  <div className="flex items-center gap-2 pt-2">
                                    <button
                                      onClick={() => {
                                        setRetouchToDismiss(item);
                                      }}
                                      className="text-[10px] font-bold px-2.5 py-1 border border-border text-slate-500 rounded-lg hover:bg-slate-100"
                                    >
                                      Desestimar
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-card rounded-2xl border border-slate-300 p-6 space-y-4 shadow-sm">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-slate-200 pb-3">Resumen de Medidas</h3>
                    {timeline.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Registra sesiones para ver la evolución de medidas corporales.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider pb-1 border-b border-slate-100">
                          <span>Ses.</span><span>Peso</span><span>Cintura</span><span>Cadera</span>
                        </div>
                        {timeline.map((s, idx) => (
                          <div key={s.id} className="grid grid-cols-4 text-xs font-bold text-foreground border-b border-slate-100 py-1.5 animate-fade-in">
                            <span className="text-muted-foreground">#{timeline.length - idx}</span>
                            <span>{s.measurements?.weight ?? "—"}</span>
                            <span>{s.measurements?.waist ?? "—"}</span>
                            <span>{s.measurements?.hip ?? "—"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "consentimiento" && (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start animate-fade-in">
                  <div className="xl:col-span-2 bg-card rounded-2xl border border-slate-300 p-6 flex flex-col space-y-4 shadow-sm">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-slate-200 pb-3">
                      Consentimientos Firmados
                    </h3>
                    
                    {patient.consentDocuments && patient.consentDocuments.length > 0 ? (
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                        {patient.consentDocuments.map((doc) => (
                          <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col space-y-3 shadow-sm hover:border-slate-300 transition-colors">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{doc.service.name}</h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Firmado: {new Date(doc.signedAt).toLocaleDateString("es-MX")} · {new Date(doc.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                                doc.id.startsWith("offline")
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}>
                                {doc.id.startsWith("offline") ? "Local Offline" : "Sincronizado"}
                              </span>
                            </div>
                            
                            <div className="bg-white border border-slate-100 rounded-xl p-2 flex justify-center items-center h-24 shadow-inner">
                              <img
                                src={doc.signatureData}
                                alt="Firma del paciente"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <FileSignature className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground font-semibold">
                          Aún no hay consentimientos firmados.
                        </p>
                      </div>
                    )}
                  </div>

                  <div id="tour-patients-consent" className="xl:col-span-3 bg-card rounded-2xl border border-slate-300 p-6 flex flex-col space-y-4 shadow-sm">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-slate-200 pb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Firmar Nuevo Consentimiento
                    </h3>

                    {consentError && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{consentError}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                        Servicio o Tratamiento a Consentir
                      </label>
                      <select
                        value={selectedConsentServiceId}
                        onChange={(e) => {
                          setSelectedConsentServiceId(e.target.value);
                          setConsentError(null);
                        }}
                        className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                      >
                        <option value="" disabled>Selecciona el servicio</option>
                        {patient.treatmentPackages.flatMap((pkg) =>
                          pkg.lines.map((line) => (
                            <option key={line.id} value={line.serviceId || line.id}>
                              {pkg.packageName} — {line.serviceName}
                            </option>
                          ))
                        )}
                        {patient.treatmentPackages.length === 0 && (
                          <>
                            <option value="fallback-laser">Depilación Láser Soprano Titanium</option>
                            <option value="fallback-cavitacion">Cavitación Corporal Reductora</option>
                            <option value="fallback-facial">Tratamiento Facial Anti-Edad</option>
                            <option value="fallback-rehab">Fisioterapia y Rehabilitación</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                        Documento de Consentimiento Clínico
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line font-medium border-l-4 border-l-primary shadow-inner">
                        {selectedConsentServiceId ? (
                          getConsentText(
                            patient.treatmentPackages.flatMap((pkg) => pkg.lines)
                              .find((l) => l.serviceId === selectedConsentServiceId || l.id === selectedConsentServiceId)
                              ?.serviceName || 
                            (selectedConsentServiceId === "fallback-laser" ? "Depilación Láser" :
                             selectedConsentServiceId === "fallback-cavitacion" ? "Cavitación Corporal" :
                             selectedConsentServiceId === "fallback-facial" ? "Tratamiento Facial" :
                             selectedConsentServiceId === "fallback-rehab" ? "Fisioterapia" : "Servicio")
                          )
                        ) : (
                          <span className="italic text-muted-foreground">
                            Selecciona un servicio para visualizar el texto legal de consentimiento informado correspondiente.
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                          Firma del Paciente
                        </label>
                        <span className="text-[10px] text-muted-foreground font-semibold italic">
                          Estampe la firma con el mouse o lápiz táctil
                        </span>
                      </div>

                      <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-2 relative overflow-hidden flex justify-center items-center">
                        <canvas
                          ref={canvasRef}
                          id="tour-patients-consent-canvas"
                          width={600}
                          height={200}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="bg-white rounded-xl shadow-inner cursor-crosshair max-w-full"
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs text-slate-600 font-medium">
                        Declaro que he leído y comprendido la información del tratamiento seleccionado y acepto firmar digitalmente este consentimiento.
                      </span>
                    </label>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpiar Lienzo
                      </button>
                      <button
                        type="button"
                        id="tour-patients-consent-submit"
                        onClick={handleSaveConsent}
                        disabled={isSigning || !selectedConsentServiceId || !acceptTerms}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSigning ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Guardando Firma...
                          </>
                        ) : (
                          <>
                            <PenTool className="w-3.5 h-3.5" />
                            Confirmar y Guardar Firma
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "galeria" && (
                <div className="space-y-8 animate-fade-in">
                  {photos.some((p) => p.isPendingSync) && (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold">Tienes fotografías pendientes de sincronizar</p>
                          <p className="text-[10px] text-amber-700 mt-0.5">Se guardaron localmente debido a problemas de conexión.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSyncPhotos(patient!.id)}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
                      >
                        {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Sincronizar ahora
                      </button>
                    </div>
                  )}

                  <div className="bg-card rounded-2xl border border-slate-300 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      Añadir Nueva Fotografía al Expediente
                    </h3>

                    {photoUploadError && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold mb-4">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{photoUploadError}</span>
                      </div>
                    )}

                    <form onSubmit={handlePhotoUpload} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                          Seleccionar Imagen
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[180px] bg-slate-50/50 hover:bg-slate-50 hover:border-primary ${
                            photoPreview ? "border-primary/50" : "border-slate-300"
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          {photoPreview ? (
                            <div className="relative w-full h-[140px] rounded-xl overflow-hidden group">
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white text-xs font-bold">Cambiar Imagen</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-2">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                                <Upload className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-700">Haz clic para subir o arrastra</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Formatos aceptados: PNG, JPG, JPEG</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 lg:col-span-2 flex flex-col justify-between h-full min-h-[180px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                              Tipo de Registro
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedPhotoType("before")}
                                className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border-2 transition-all ${
                                  selectedPhotoType === "before"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-slate-200 text-muted-foreground hover:bg-slate-50"
                                }`}
                              >
                                Antes (Control Inicial)
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedPhotoType("after")}
                                className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border-2 transition-all ${
                                  selectedPhotoType === "after"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-slate-200 text-muted-foreground hover:bg-slate-50"
                                }`}
                              >
                                Después (Evolutivo)
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                              Descripción / Notas de la Foto
                            </label>
                            <input
                              type="text"
                              value={photoNotes}
                              onChange={(e) => setPhotoNotes(e.target.value)}
                              placeholder="Ej. Vista lateral abdomen, sesión 4..."
                              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                          {photoPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setPhotoFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="px-4 py-2.5 border border-slate-300 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              Limpiar
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={isUploading || !photoFile}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Guardando Foto...
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                Guardar Foto
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-card rounded-2xl border border-slate-300 p-6 flex flex-col space-y-4 shadow-sm">
                      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                        <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Control Inicial (Antes)
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {photos.filter((p) => p.type === "before").length} foto(s)
                        </span>
                      </div>

                      {photos.filter((p) => p.type === "before").length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground font-semibold">
                            Sin fotografías de control inicial.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {photos
                            .filter((p) => p.type === "before")
                            .map((photo) => (
                              <div key={photo.id} className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all flex flex-col relative">
                                <div 
                                  onClick={() => {
                                    setLightboxPhoto(photo);
                                    setComparisonMode(false);
                                  }}
                                  className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                                >
                                  <img
                                    src={photo.url ? `${SERVER_URL}${photo.url}` : photo.photoData}
                                    alt="Antes"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  {photo.isPendingSync && (
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 text-white text-[9px] font-black rounded-lg shadow-sm">
                                      PENDIENTE SYNC
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePhoto(photo.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl shadow-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Eliminar Foto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="p-3 flex-1 flex flex-col justify-between">
                                  <p className="text-xs font-bold text-slate-700 line-clamp-2">
                                    {photo.notes || "Sin descripción"}
                                  </p>
                                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-semibold">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(photo.uploadedAt).toLocaleDateString("es-MX")}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-card rounded-2xl border border-slate-300 p-6 flex flex-col space-y-4 shadow-sm">
                      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                        <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Control Evolutivo (Después)
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {photos.filter((p) => p.type === "after").length} foto(s)
                        </span>
                      </div>

                      {photos.filter((p) => p.type === "after").length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground font-semibold">
                            Sin fotografías de control evolutivo.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {photos
                            .filter((p) => p.type === "after")
                            .map((photo) => (
                              <div key={photo.id} className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all flex flex-col relative">
                                <div 
                                  onClick={() => {
                                    setLightboxPhoto(photo);
                                    setComparisonMode(false);
                                  }}
                                  className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                                >
                                  <img
                                    src={photo.url ? `${SERVER_URL}${photo.url}` : photo.photoData}
                                    alt="Después"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  {photo.isPendingSync && (
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 text-white text-[9px] font-black rounded-lg shadow-sm">
                                      PENDIENTE SYNC
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePhoto(photo.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl shadow-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Eliminar Foto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="p-3 flex-1 flex flex-col justify-between">
                                  <p className="text-xs font-bold text-slate-700 line-clamp-2">
                                    {photo.notes || "Sin descripción"}
                                  </p>
                                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-semibold">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(photo.uploadedAt).toLocaleDateString("es-MX")}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "facturacion" && (
                <div className="bg-card rounded-2xl border border-slate-300 p-10 text-center">
                  <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Historial de facturas del paciente en desarrollo.</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            id="tour-session-modal"
            className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden"
            style={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-foreground">Registrar Sesión</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {patient?.fullName} · Consume sesión del bono
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSession} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [&::-webkit-scrollbar]:hidden">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                    Cita a Completar
                  </label>
                  {pendingAppointments.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 font-semibold">
                      No hay citas pendientes/confirmadas para este paciente.
                    </p>
                  ) : (
                    <select
                      value={selectedAppointmentId}
                      required
                      onChange={(e) => setSelectedAppointmentId(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                    >
                      <option value="" disabled>Selecciona la cita</option>
                      {pendingAppointments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {new Date(a.dateTime).toLocaleDateString("es-MX")} · {new Date(a.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {a.professional.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                    Servicio a Descontar del Bono
                  </label>
                  <select
                    value={selectedLineId}
                    required
                    onChange={(e) => setSelectedLineId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                  >
                    <option value="" disabled>Selecciona el servicio</option>
                    {patient?.treatmentPackages.flatMap((pkg) =>
                      pkg.lines.map((line) => (
                        <option key={line.id} value={line.id}>
                          {pkg.packageName} — {line.serviceName} ({line.usedSessions}/{line.totalSessions} usadas)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-4">
                  {selectedLineId && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-inner">
                      <span className="text-xs font-bold text-slate-700">
                        Tipo de Servicio:
                      </span>
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                        patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                          .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("laser") ||
                        patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                          .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("láser") ||
                        patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                          .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("depila")
                          ? "bg-violet-100 text-violet-700 border border-violet-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}>
                        {patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                          .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("laser") ||
                        patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                          .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("láser") ||
                        patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                          .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("depila")
                          ? "Tecnología Láser"
                          : "Corporal / Reductor"}
                      </span>
                    </div>
                  )}

                  {(!selectedLineId ||
                    patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                      .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("laser") ||
                    patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                      .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("láser") ||
                    patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                      .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("depila")) ? (
                    <div id="tour-session-modal-laser" className="space-y-3 bg-violet-50/20 border border-violet-100/50 rounded-2xl p-4">
                      <h4 className="text-[10px] font-black text-violet-700 uppercase tracking-wider">
                        ⚡ Parámetros Técnicos Láser
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground mb-1 block">Láser (Energía/Hz)</label>
                          <input
                            type="text"
                            value={laser}
                            onChange={(e) => setLaser(e.target.value)}
                            placeholder="Ej. 12 J, 10Hz"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground mb-1 block">Cabezal / Spot</label>
                          <input
                            type="text"
                            value={nozzles}
                            onChange={(e) => setNozzles(e.target.value)}
                            placeholder="Ej. Spot 2cm"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground mb-1 block">Nº Disparos</label>
                          <input
                            type="number"
                            value={shots}
                            onChange={(e) => setShots(e.target.value)}
                            placeholder="Ej. 3200"
                            className="w-full px-3 py-2 text-xs border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {(!selectedLineId ||
                    !(patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                      .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("laser") ||
                    patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                      .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("láser") ||
                    patient?.treatmentPackages.flatMap((pkg) => pkg.lines)
                      .find((line) => line.id === selectedLineId)?.serviceName.toLowerCase().includes("depila"))) ? (
                    <div id="tour-session-modal-measurements" className="space-y-3 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl p-4">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                        📏 Mediciones Corporales
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground mb-1 block">Peso (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Ej. 65.5"
                            className="w-full px-3 py-2 text-xs border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground mb-1 block">Cintura (cm)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={waist}
                            onChange={(e) => setWaist(e.target.value)}
                            placeholder="Ej. 78"
                            className="w-full px-3 py-2 text-xs border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground mb-1 block">Cadera (cm)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={hip}
                            onChange={(e) => setHip(e.target.value)}
                            placeholder="Ej. 95"
                            className="w-full px-3 py-2 text-xs border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                    Notas de Evolución
                  </label>
                  <textarea
                    rows={4}
                    required
                    id="tour-session-modal-notes"
                    value={evolutionNotes}
                    onChange={(e) => setEvolutionNotes(e.target.value)}
                    placeholder="Describe lo observado en la sesión, tolerancia del paciente, parámetros de aparatología..."
                    className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm font-bold border-2 border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="tour-session-modal-submit"
                  className="flex-1 py-3 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar Sesión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-slate-300 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
              <h3 className="text-base font-black text-foreground uppercase tracking-widest">
                {isEditingPatient ? "Editar Datos del Paciente" : "Registrar Nuevo Paciente"}
              </h3>
              <button
                onClick={() => { setShowCreateModal(false); setIsEditingPatient(false); }}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePatient} className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden">
              {createError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ej. Ana María Rodríguez"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Ej. 5551234567"
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Ej. ana@correo.com"
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  Ficha / Antecedentes Médicos Iniciales
                </label>
                <textarea
                  rows={5}
                  value={newMedicalHistory}
                  onChange={(e) => setNewMedicalHistory(e.target.value)}
                  placeholder="Ej. Sin cirugías previas, padece de alergia cutánea leve, piel mixta..."
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-border flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-sm font-bold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                  disabled={createSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="flex-1 py-3 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {createSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : (
                    "Crear Expediente"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Lightbox & Before-After Slider Modal ══ */}
      {lightboxPhoto && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[95vh] text-white">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">
                  {comparisonMode ? "Comparación Evolutiva" : "Galería Clínica"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {patient?.fullName} · {comparisonMode ? "Desliza para ver la evolución" : (lightboxPhoto.type === "before" ? "Control Inicial (Antes)" : "Control Evolutivo (Después)")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Comparison Mode toggle button */}
                {photos.some((p) => p.type === "before") && photos.some((p) => p.type === "after") && (
                  <button
                    onClick={() => {
                      if (!comparisonMode) {
                        const before = photos.find((p) => p.type === "before") || null;
                        const after = photos.find((p) => p.type === "after") || null;
                        setSliderPhotoBefore(before);
                        setSliderPhotoAfter(after);
                      }
                      setComparisonMode(!comparisonMode);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      comparisonMode
                        ? "bg-primary border-primary text-white"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ⚖️ Comparar Antes/Después
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setLightboxPhoto(null);
                    setComparisonMode(false);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center overflow-hidden min-h-[400px]">
              {comparisonMode && sliderPhotoBefore && sliderPhotoAfter ? (
                /* Comparison Slider overlay view */
                <div className="relative w-full max-w-2xl aspect-square sm:aspect-video rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center">
                  
                  {/* Before Image (underneath) */}
                  <img
                    src={sliderPhotoBefore.url ? `${SERVER_URL}${sliderPhotoBefore.url}` : sliderPhotoBefore.photoData}
                    alt="Antes"
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-[10px] font-black text-rose-400 border border-rose-500/30 rounded-lg select-none">
                    ANTES
                  </div>

                  {/* After Image (clipped width) */}
                  <div
                    className="absolute inset-y-0 left-0 right-0 overflow-hidden"
                    style={{ width: `${comparisonPos}%` }}
                  >
                    <img
                      src={sliderPhotoAfter.url ? `${SERVER_URL}${sliderPhotoAfter.url}` : sliderPhotoAfter.photoData}
                      alt="Después"
                      className="absolute inset-y-0 left-0 w-[800px] h-full object-cover max-w-none select-none pointer-events-none"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-[10px] font-black text-emerald-400 border border-emerald-500/30 rounded-lg select-none whitespace-nowrap" style={{ left: "calc(100% - 100px)" }}>
                      DESPUÉS
                    </div>
                  </div>

                  {/* Split handler line */}
                  <div
                    className="absolute inset-y-0 w-[2px] bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
                    style={{ left: `${comparisonPos}%` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white shadow-xl border border-slate-300 flex items-center justify-center text-slate-800 text-xs font-bold select-none pointer-events-auto">
                      ↔
                    </div>
                  </div>

                  {/* Invisible Input Range covering image for drag behavior */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparisonPos}
                    onChange={(e) => setComparisonPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                  />
                </div>
              ) : (
                /* Standard Large image view */
                <div className="relative w-full max-w-2xl h-[450px] flex items-center justify-center">
                  
                  {/* Previous Button */}
                  <button
                    onClick={() => {
                      const list = photos.filter((p) => p.type === lightboxPhoto.type);
                      const idx = list.findIndex((p) => p.id === lightboxPhoto.id);
                      if (idx > 0) {
                        setLightboxPhoto(list[idx - 1]);
                      } else {
                        setLightboxPhoto(list[list.length - 1]); // loop to end
                      }
                    }}
                    className="absolute left-2 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-all z-10"
                  >
                    ←
                  </button>

                  <img
                    src={lightboxPhoto.url ? `${SERVER_URL}${lightboxPhoto.url}` : lightboxPhoto.photoData}
                    alt={lightboxPhoto.notes || "Foto"}
                    className="max-w-full max-h-full object-contain rounded-2xl border border-slate-800 bg-slate-950"
                  />

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      const list = photos.filter((p) => p.type === lightboxPhoto.type);
                      const idx = list.findIndex((p) => p.id === lightboxPhoto.id);
                      if (idx < list.length - 1) {
                        setLightboxPhoto(list[idx + 1]);
                      } else {
                        setLightboxPhoto(list[0]); // loop to start
                      }
                    }}
                    className="absolute right-2 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-all z-10"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {/* Footer with Notes */}
            {!comparisonMode && (
              <div className="p-6 border-t border-slate-800 bg-slate-950/50 rounded-b-3xl">
                <p className="text-xs font-semibold text-slate-400">Descripción / Notas evolutivas:</p>
                <p className="text-sm font-medium text-slate-200 mt-1 leading-relaxed">
                  {lightboxPhoto.notes || "Sin descripción registrada."}
                </p>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold">
                  <span>Fecha: {new Date(lightboxPhoto.uploadedAt).toLocaleDateString("es-MX")}</span>
                  <span>Tipo: {lightboxPhoto.type === "before" ? "Control Inicial (Antes)" : "Control Evolutivo (Después)"}</span>
                </div>
              </div>
            )}
            
            {comparisonMode && (
              <div className="p-6 border-t border-slate-800 bg-slate-950/50 rounded-b-3xl flex justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <span className="text-[10px] font-bold text-rose-400">ANTES:</span>
                  <p className="text-xs font-medium text-slate-300 truncate mt-0.5">{sliderPhotoBefore?.notes || "Sin descripción"}</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <span className="text-[10px] font-bold text-emerald-400">DESPUÉS:</span>
                  <p className="text-xs font-medium text-slate-300 truncate mt-0.5">{sliderPhotoAfter?.notes || "Sin descripción"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete Photo Confirmation Modal */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-2">¿Eliminar Fotografía?</h3>
            <p className="text-xs text-muted-foreground mb-4">Esta acción no se puede deshacer y la imagen será eliminada de forma permanente del expediente clínico.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPhotoToDelete(null)}
                className="px-4 py-2 text-xs font-bold border-2 border-border rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    if (photoToDelete.startsWith('offline-')) {
                      const queueKey = `patient_photos_queue_${patient!.id}`;
                      const queuedRaw = localStorage.getItem(queueKey);
                      if (queuedRaw) {
                        const queued: PatientPhoto[] = JSON.parse(queuedRaw);
                        const updated = queued.filter((p) => p.id !== photoToDelete);
                        localStorage.setItem(queueKey, JSON.stringify(updated));
                      }
                      setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete));
                    } else {
                      await api.delete(`/patients/photos/${photoToDelete}`).catch(() => {});
                      setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete));
                    }
                    toast.success("Fotografía eliminada correctamente.");
                  } catch (err: any) {
                    toast.error("Error al eliminar la foto: " + err.message);
                  } finally {
                    setPhotoToDelete(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waive Retouch Confirmation Modal */}
      {retouchToDismiss && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-2">¿Desestimar Retoque?</h3>
            <p className="text-xs text-muted-foreground mb-4">¿Estás seguro de que deseas desestimar este retoque para el paciente? Esta acción cancelará la programación propuesta.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRetouchToDismiss(null)}
                className="px-4 py-2 text-xs font-bold border-2 border-border rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.put(`/appointments/retouches/${retouchToDismiss.id}`, { status: "WAIVED" });
                    toast.success("Retoque desestimado correctamente.");
                    if (selectedPatientId) loadPatient(selectedPatientId);
                  } catch (err: any) {
                    toast.error("Error al desestimar el retoque: " + err.message);
                  } finally {
                    setRetouchToDismiss(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
