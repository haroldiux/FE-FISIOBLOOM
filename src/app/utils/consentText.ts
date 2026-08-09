/**
 * Texto legal mostrado al paciente antes de firmar un consentimiento
 * informado. Elige el bloque según palabras clave en el nombre del
 * servicio, con un cierre genérico para cualquier servicio que no
 * matchee ninguna — así un servicio nuevo (ej. "Peeling de Diamante")
 * nunca hereda por error el texto de otro tratamiento (como pasaba antes
 * cuando todo lo que no era "general" mostraba el texto de láser).
 */
export function getConsentText(serviceName: string, patientName: string): string {
  const name = (serviceName || "").toLowerCase();
  const who = patientName || "el paciente";

  if (name === "general" || name.includes("general")) {
    return `CONSENTIMIENTO INFORMADO GENERAL - REGISTRO CLÍNICO Y TRATAMIENTOS
Yo, ${who}, en pleno uso de mis facultades, autorizo el registro de mi historial clínico, evolución física y la realización de tratamientos generales de fisioterapia y estética en BLOOM SKIN.
He sido informado de manera comprensible sobre las normas del centro, el manejo confidencial de mis datos clínicos y la necesidad de declarar con veracidad cualquier condición médica, antecedente o contraindicación.
Doy mi consentimiento para que se registren mediciones antropométricas y fotografías evolutivas únicamente con fines de seguimiento profesional y control de mi tratamiento.`;
  }

  if (name.includes("laser") || name.includes("láser") || name.includes("depila") || name.includes("soprano")) {
    return `CONSENTIMIENTO INFORMADO PARA TRATAMIENTO DE DEPILACIÓN LÁSER
Yo, ${who}, en pleno uso de mis facultades, autorizo la realización del tratamiento de Depilación Láser en BLOOM SKIN.
He sido informado de que el procedimiento utiliza energía lumínica para calentar y destruir el folículo piloso. Comprendo que puede provocar eritema transitorio, leve inflamación o sensibilidad y que existe un riesgo menor de hiper/hipopigmentación temporal.
Declaro no estar embarazada, no tomar medicamentos fotosensibilizantes y no haber tomado sol en la zona a tratar en los últimos 15 días. Me comprometo a seguir las pautas post-tratamiento indicadas.`;
  }

  if (name.includes("cavitacion") || name.includes("cavitación") || name.includes("corporal") || name.includes("reductor") || name.includes("criolipolisis")) {
    return `CONSENTIMIENTO INFORMADO PARA TRATAMIENTOS CORPORALES REDUCTORES
Yo, ${who}, autorizo los tratamientos corporales indicados orientados a la reducción de grasa localizada y modelado corporal.
Entiendo que técnicas como cavitación, criolipólisis o radiofrecuencia actúan sobre el tejido subcutáneo. Se me ha explicado detalladamente la necesidad de mantener una hidratación abundante y hábitos alimenticios saludables para optimizar el drenaje linfático.
Declaro no portar marcapasos ni prótesis metálicas en la zona, ni padecer insuficiencia hepática o renal grave.`;
  }

  if (name.includes("facial") || name.includes("peeling") || name.includes("anti-edad")) {
    return `CONSENTIMIENTO INFORMADO PARA TRATAMIENTOS FACIALES Y ESTÉTICOS
Yo, ${who}, autorizo la realización del tratamiento facial y rejuvenecimiento en BLOOM SKIN.
Comprendo que la aplicación de principios activos, peelings químicos o aparatología facial busca la renovación del tejido dérmico. Entiendo los riesgos de descamación leve, eritema y la obligatoriedad del uso diario de fotoprotección FPS 50+.
Declaro no padecer herpes labial activo ni sensibilidad extrema a los ácidos estéticos indicados.`;
  }

  return `CONSENTIMIENTO INFORMADO GENERAL DE TRATAMIENTO ESTÉTICO
Yo, ${who}, autorizo la realización del tratamiento de ${serviceName || "el servicio seleccionado"} en BLOOM SKIN.
He recibido explicaciones claras del procedimiento, sus beneficios esperados y sus efectos secundarios comunes. Confirmo que he resuelto todas mis dudas y que los datos declarados en mi ficha clínica son verídicos.
Me comprometo a seguir rigurosamente las pautas post-tratamiento indicadas por el profesional.`;
}
