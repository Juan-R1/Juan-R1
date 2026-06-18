import type { Locale } from "@/lib/types";

/**
 * Flat translation dictionary. Keys are dot-namespaced by feature.
 * Every key MUST exist in both `en` and `es`.
 */
export const dictionary = {
  en: {
    "app.name": "CruceEP",
    "app.tagline": "El Paso–Juárez mobility & border navigator",

    // Navigation
    "nav.home": "Home",
    "nav.plan": "Plan Trip",
    "nav.bridges": "Bridges",
    "nav.alerts": "Alerts",
    "nav.coolingCenters": "Cooling Centers",
    "nav.savedRoutes": "Saved Routes",
    "nav.admin": "Admin",
    "nav.signIn": "Sign in",
    "nav.signOut": "Sign out",
    "nav.account": "Account",
    "nav.menu": "Menu",

    // Common
    "common.loading": "Loading…",
    "common.save": "Save",
    "common.saved": "Saved",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.update": "Update",
    "common.close": "Close",
    "common.back": "Back",
    "common.retry": "Try again",
    "common.lastUpdated": "Last updated",
    "common.source": "Source",
    "common.minutes": "min",
    "common.viewSource": "View source",
    "common.required": "Required",
    "common.optional": "Optional",
    "common.beta": "Beta",
    "common.all": "All",

    // Confidence badges
    "confidence.live": "Live",
    "confidence.cached": "Cached",
    "confidence.estimated": "Estimated",
    "confidence.mock": "Sample data",
    "confidence.unavailable": "Unavailable",

    // Language
    "lang.toggle": "Español",
    "lang.label": "Language",
    "lang.en": "English",
    "lang.es": "Español",

    // Landing
    "landing.hero.title": "Plan El Paso and border trips in one place",
    "landing.hero.subtitle":
      "Compare bridge wait times, check transit, see alerts and heat risk, and save your routes — in English or Spanish.",
    "landing.cta.plan": "Plan a Trip",
    "landing.cta.bridges": "Check Bridges",
    "landing.cta.alerts": "View Alerts",
    "landing.feature.bridges.title": "Compare bridge wait times",
    "landing.feature.bridges.body":
      "See vehicle and pedestrian waits across El Paso–Juárez ports of entry side by side.",
    "landing.feature.transit.title": "Check transit options",
    "landing.feature.transit.body":
      "Sun Metro and County ETA options to get you closest to where you're going.",
    "landing.feature.alerts.title": "See alerts and heat risk",
    "landing.feature.alerts.body":
      "Service changes, bridge delays, and heat advisories that affect your trip.",
    "landing.feature.routes.title": "Save frequent routes",
    "landing.feature.routes.body":
      "Save Home→Work, Home→School, or any route and check it again in seconds.",
    "landing.trust.title": "Built on trust",
    "landing.trust.body":
      "CruceEP orchestrates official sources. Every card shows where data came from and when it was updated. We never show sample data as if it were official.",

    // Bridges
    "bridges.title": "Bridge wait times",
    "bridges.subtitle": "Compare current crossing waits and pick the best bridge.",
    "bridges.direction": "Direction",
    "bridges.direction.northbound": "Northbound (to US)",
    "bridges.direction.southbound": "Southbound (to MX)",
    "bridges.vehicle": "Vehicle",
    "bridges.pedestrian": "Pedestrian",
    "bridges.readyLane": "Ready Lane",
    "bridges.lane": "Lane",
    "bridges.status": "Status",
    "bridges.status.open": "Open",
    "bridges.status.closed": "Closed",
    "bridges.status.delay": "Delay",
    "bridges.favorite": "Favorite",
    "bridges.favorited": "Favorited",
    "bridges.bestNow": "Shortest wait now",
    "bridges.noWait": "No wait reported",
    "bridges.empty": "No bridge wait data is available right now.",

    // Trip planner
    "plan.title": "Plan a trip",
    "plan.subtitle": "Get a suggested bridge, transit, heat risk, and alerts together.",
    "plan.origin": "Origin",
    "plan.origin.placeholder": "e.g. Downtown El Paso",
    "plan.destination": "Destination",
    "plan.destination.placeholder": "e.g. UTEP",
    "plan.tripType": "Trip type",
    "plan.tripType.local": "Local El Paso",
    "plan.tripType.cross_border": "Cross-border",
    "plan.tripType.transit": "Transit-focused",
    "plan.tripType.heat_safe": "Heat-safe route",
    "plan.mode": "Preferred mode",
    "plan.mode.driving": "Driving",
    "plan.mode.walking": "Walking",
    "plan.mode.sun_metro": "Sun Metro",
    "plan.mode.eta": "ETA",
    "plan.mode.mixed": "Mixed",
    "plan.when": "Departure",
    "plan.when.now": "Now",
    "plan.when.later": "Later",
    "plan.submit": "Plan trip",
    "plan.result.title": "Your trip plan",
    "plan.result.totalTime": "Estimated total time",
    "plan.result.suggestedBridge": "Suggested bridge",
    "plan.result.bridgeWait": "Estimated bridge wait",
    "plan.result.steps": "Steps",
    "plan.result.saveRoute": "Save this route",
    "plan.result.betaNote":
      "Routing is in beta and shown as an estimate, not an official schedule.",
    "plan.empty": "Fill in origin and destination to see a trip plan.",
    "plan.leg.walk": "Walk",
    "plan.leg.bus": "Bus",
    "plan.leg.brt": "Rapid transit",
    "plan.leg.drive": "Drive",
    "plan.leg.border": "Border crossing",
    "plan.leg.wait": "Wait",

    // Heat card
    "heat.title": "Heat & weather",
    "heat.temp": "Temperature",
    "heat.feelsLike": "Feels like",
    "heat.advisory": "Heat advisory",
    "heat.advisory.active": "Advisory in effect",
    "heat.advisory.none": "No advisory",
    "heat.caution": "Caution level",
    "heat.caution.low": "Low",
    "heat.caution.moderate": "Moderate",
    "heat.caution.high": "High",
    "heat.caution.extreme": "Extreme",
    "heat.reminder":
      "Carry water, take shade breaks, and check on others during your trip.",
    "heat.coolingNearby": "Nearby cooling centers",
    "heat.coolingNearby.view": "View cooling centers",

    // Alerts
    "alerts.title": "Service alerts",
    "alerts.subtitle": "Transit, bridge, weather, and city alerts that affect trips.",
    "alerts.filter.all": "All",
    "alerts.category.sun_metro": "Sun Metro",
    "alerts.category.eta": "ETA",
    "alerts.category.bridge": "Bridge",
    "alerts.category.weather": "Weather",
    "alerts.category.cooling_center": "Cooling centers",
    "alerts.category.city": "City",
    "alerts.severity.info": "Info",
    "alerts.severity.minor": "Minor",
    "alerts.severity.major": "Major",
    "alerts.severity.severe": "Severe",
    "alerts.affectedArea": "Affected area",
    "alerts.empty": "No active alerts right now. Check back later.",

    // Cooling centers
    "cooling.title": "Cooling centers & safe places",
    "cooling.subtitle":
      "Public places to cool down, rest, and find help during heat events.",
    "cooling.type.cooling_center": "Cooling center",
    "cooling.type.library": "Library",
    "cooling.type.public_facility": "Public facility",
    "cooling.type.shelter": "Shelter",
    "cooling.type.recreation_center": "Recreation center",
    "cooling.hours": "Hours",
    "cooling.phone": "Phone",
    "cooling.website": "Website",
    "cooling.directions": "Directions",
    "cooling.lastVerified": "Last verified",
    "cooling.notVerified": "Not yet verified",
    "cooling.empty": "No cooling centers are listed yet.",

    // Saved routes
    "saved.title": "Saved routes",
    "saved.subtitle": "Your frequent trips, ready to check in seconds.",
    "saved.localNote":
      "You're not signed in — routes are saved on this device only.",
    "saved.syncedNote": "Signed in — your routes sync to your account.",
    "saved.name": "Route name",
    "saved.name.placeholder": "e.g. Home to Work",
    "saved.add": "Add route",
    "saved.empty": "You haven't saved any routes yet.",
    "saved.favoriteBridge": "Favorite bridge",
    "saved.openInPlanner": "Open in planner",
    "saved.deleteConfirm": "Delete this saved route?",
    "saved.quickAdd.homeWork": "Home → Work",
    "saved.quickAdd.homeSchool": "Home → School",
    "saved.quickAdd.bridgeClinic": "Bridge → Clinic",

    // Auth
    "auth.signIn.title": "Sign in to CruceEP",
    "auth.signUp.title": "Create your account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.displayName": "Display name",
    "auth.signIn": "Sign in",
    "auth.signUp": "Sign up",
    "auth.magicLink": "Email me a magic link",
    "auth.magicLinkSent": "Check your email for a sign-in link.",
    "auth.toggleToSignUp": "Need an account? Sign up",
    "auth.toggleToSignIn": "Already have an account? Sign in",
    "auth.signOutSuccess": "You've been signed out.",
    "auth.disabled":
      "Sign-in is unavailable because Supabase is not configured. The app still works with locally-saved routes.",
    "auth.success": "Signed in successfully.",

    // Admin
    "admin.title": "Admin dashboard",
    "admin.subtitle": "Manage cooling centers, alerts, and data source health.",
    "admin.tab.coolingCenters": "Cooling centers",
    "admin.tab.alerts": "Alerts",
    "admin.tab.health": "Data sources",
    "admin.health.title": "Data source health",
    "admin.health.status": "Status",
    "admin.health.lastSuccess": "Last success",
    "admin.health.lastFailure": "Last failure",
    "admin.health.lastError": "Last error",
    "admin.health.noLogs": "No ingestion failures recorded.",
    "admin.coolingCenters.new": "New cooling center",
    "admin.alerts.new": "New alert",
    "admin.deleteConfirm": "Delete this record? This cannot be undone.",
    "admin.saveSuccess": "Saved successfully.",

    // Errors / states
    "error.generic": "Something went wrong. Please try again.",
    "error.network": "We couldn't reach the server. Check your connection.",
    "error.unauthorized": "You need to sign in to do that.",
    "error.forbidden": "You don't have permission to do that.",
    "error.notFound": "We couldn't find what you were looking for.",
    "error.saveFailed": "We couldn't save your changes.",
    "error.dataUnavailable": "This data is temporarily unavailable.",
    "error.validation": "Please fix the highlighted fields.",
    "empty.generic": "Nothing to show yet.",
    "footer.disclaimer":
      "CruceEP orchestrates official sources and is not affiliated with CBP, Sun Metro, ETA, NWS, or the City of El Paso. Always confirm with official sources.",
  },
  es: {
    "app.name": "CruceEP",
    "app.tagline": "Navegador de movilidad y frontera El Paso–Juárez",

    // Navigation
    "nav.home": "Inicio",
    "nav.plan": "Planear viaje",
    "nav.bridges": "Puentes",
    "nav.alerts": "Alertas",
    "nav.coolingCenters": "Centros de enfriamiento",
    "nav.savedRoutes": "Rutas guardadas",
    "nav.admin": "Administración",
    "nav.signIn": "Iniciar sesión",
    "nav.signOut": "Cerrar sesión",
    "nav.account": "Cuenta",
    "nav.menu": "Menú",

    // Common
    "common.loading": "Cargando…",
    "common.save": "Guardar",
    "common.saved": "Guardado",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.create": "Crear",
    "common.update": "Actualizar",
    "common.close": "Cerrar",
    "common.back": "Atrás",
    "common.retry": "Reintentar",
    "common.lastUpdated": "Actualizado",
    "common.source": "Fuente",
    "common.minutes": "min",
    "common.viewSource": "Ver fuente",
    "common.required": "Obligatorio",
    "common.optional": "Opcional",
    "common.beta": "Beta",
    "common.all": "Todas",

    // Confidence badges
    "confidence.live": "En vivo",
    "confidence.cached": "En caché",
    "confidence.estimated": "Estimado",
    "confidence.mock": "Datos de muestra",
    "confidence.unavailable": "No disponible",

    // Language
    "lang.toggle": "English",
    "lang.label": "Idioma",
    "lang.en": "English",
    "lang.es": "Español",

    // Landing
    "landing.hero.title": "Planea tus viajes en El Paso y la frontera en un solo lugar",
    "landing.hero.subtitle":
      "Compara tiempos de espera en puentes, revisa el transporte, mira alertas y riesgo de calor, y guarda tus rutas — en inglés o español.",
    "landing.cta.plan": "Planear viaje",
    "landing.cta.bridges": "Ver puentes",
    "landing.cta.alerts": "Ver alertas",
    "landing.feature.bridges.title": "Compara tiempos de espera",
    "landing.feature.bridges.body":
      "Mira las esperas de autos y peatones en los puentes El Paso–Juárez lado a lado.",
    "landing.feature.transit.title": "Revisa opciones de transporte",
    "landing.feature.transit.body":
      "Opciones de Sun Metro y ETA del condado para acercarte a tu destino.",
    "landing.feature.alerts.title": "Mira alertas y riesgo de calor",
    "landing.feature.alerts.body":
      "Cambios de servicio, demoras en puentes y advertencias de calor que afectan tu viaje.",
    "landing.feature.routes.title": "Guarda tus rutas frecuentes",
    "landing.feature.routes.body":
      "Guarda Casa→Trabajo, Casa→Escuela o cualquier ruta y revísala en segundos.",
    "landing.trust.title": "Construido con transparencia",
    "landing.trust.body":
      "CruceEP organiza fuentes oficiales. Cada tarjeta muestra de dónde vienen los datos y cuándo se actualizaron. Nunca mostramos datos de muestra como si fueran oficiales.",

    // Bridges
    "bridges.title": "Tiempos de espera en puentes",
    "bridges.subtitle": "Compara las esperas actuales y elige el mejor puente.",
    "bridges.direction": "Dirección",
    "bridges.direction.northbound": "Hacia el norte (a EE. UU.)",
    "bridges.direction.southbound": "Hacia el sur (a México)",
    "bridges.vehicle": "Vehículo",
    "bridges.pedestrian": "Peatonal",
    "bridges.readyLane": "Ready Lane",
    "bridges.lane": "Carril",
    "bridges.status": "Estado",
    "bridges.status.open": "Abierto",
    "bridges.status.closed": "Cerrado",
    "bridges.status.delay": "Demora",
    "bridges.favorite": "Favorito",
    "bridges.favorited": "En favoritos",
    "bridges.bestNow": "Menor espera ahora",
    "bridges.noWait": "Sin espera reportada",
    "bridges.empty": "No hay datos de espera de puentes disponibles ahora.",

    // Trip planner
    "plan.title": "Planear un viaje",
    "plan.subtitle":
      "Obtén un puente sugerido, transporte, riesgo de calor y alertas juntos.",
    "plan.origin": "Origen",
    "plan.origin.placeholder": "ej. Centro de El Paso",
    "plan.destination": "Destino",
    "plan.destination.placeholder": "ej. UTEP",
    "plan.tripType": "Tipo de viaje",
    "plan.tripType.local": "Local El Paso",
    "plan.tripType.cross_border": "Transfronterizo",
    "plan.tripType.transit": "Enfocado en transporte",
    "plan.tripType.heat_safe": "Ruta segura ante el calor",
    "plan.mode": "Modo preferido",
    "plan.mode.driving": "Auto",
    "plan.mode.walking": "Caminando",
    "plan.mode.sun_metro": "Sun Metro",
    "plan.mode.eta": "ETA",
    "plan.mode.mixed": "Mixto",
    "plan.when": "Salida",
    "plan.when.now": "Ahora",
    "plan.when.later": "Más tarde",
    "plan.submit": "Planear viaje",
    "plan.result.title": "Tu plan de viaje",
    "plan.result.totalTime": "Tiempo total estimado",
    "plan.result.suggestedBridge": "Puente sugerido",
    "plan.result.bridgeWait": "Espera estimada en el puente",
    "plan.result.steps": "Pasos",
    "plan.result.saveRoute": "Guardar esta ruta",
    "plan.result.betaNote":
      "El cálculo de rutas está en beta y se muestra como estimación, no como horario oficial.",
    "plan.empty": "Escribe origen y destino para ver un plan de viaje.",
    "plan.leg.walk": "Caminar",
    "plan.leg.bus": "Autobús",
    "plan.leg.brt": "Transporte rápido",
    "plan.leg.drive": "Manejar",
    "plan.leg.border": "Cruce fronterizo",
    "plan.leg.wait": "Espera",

    // Heat card
    "heat.title": "Calor y clima",
    "heat.temp": "Temperatura",
    "heat.feelsLike": "Sensación",
    "heat.advisory": "Advertencia de calor",
    "heat.advisory.active": "Advertencia vigente",
    "heat.advisory.none": "Sin advertencia",
    "heat.caution": "Nivel de precaución",
    "heat.caution.low": "Bajo",
    "heat.caution.moderate": "Moderado",
    "heat.caution.high": "Alto",
    "heat.caution.extreme": "Extremo",
    "heat.reminder":
      "Lleva agua, toma descansos a la sombra y revisa a los demás durante tu viaje.",
    "heat.coolingNearby": "Centros de enfriamiento cercanos",
    "heat.coolingNearby.view": "Ver centros de enfriamiento",

    // Alerts
    "alerts.title": "Alertas de servicio",
    "alerts.subtitle":
      "Alertas de transporte, puentes, clima y ciudad que afectan tus viajes.",
    "alerts.filter.all": "Todas",
    "alerts.category.sun_metro": "Sun Metro",
    "alerts.category.eta": "ETA",
    "alerts.category.bridge": "Puente",
    "alerts.category.weather": "Clima",
    "alerts.category.cooling_center": "Centros de enfriamiento",
    "alerts.category.city": "Ciudad",
    "alerts.severity.info": "Información",
    "alerts.severity.minor": "Menor",
    "alerts.severity.major": "Importante",
    "alerts.severity.severe": "Severa",
    "alerts.affectedArea": "Área afectada",
    "alerts.empty": "No hay alertas activas ahora. Vuelve más tarde.",

    // Cooling centers
    "cooling.title": "Centros de enfriamiento y lugares seguros",
    "cooling.subtitle":
      "Lugares públicos para refrescarte, descansar y pedir ayuda durante el calor.",
    "cooling.type.cooling_center": "Centro de enfriamiento",
    "cooling.type.library": "Biblioteca",
    "cooling.type.public_facility": "Instalación pública",
    "cooling.type.shelter": "Refugio",
    "cooling.type.recreation_center": "Centro recreativo",
    "cooling.hours": "Horario",
    "cooling.phone": "Teléfono",
    "cooling.website": "Sitio web",
    "cooling.directions": "Cómo llegar",
    "cooling.lastVerified": "Última verificación",
    "cooling.notVerified": "Aún sin verificar",
    "cooling.empty": "Todavía no hay centros de enfriamiento en la lista.",

    // Saved routes
    "saved.title": "Rutas guardadas",
    "saved.subtitle": "Tus viajes frecuentes, listos para revisar en segundos.",
    "saved.localNote":
      "No has iniciado sesión — las rutas se guardan solo en este dispositivo.",
    "saved.syncedNote": "Sesión iniciada — tus rutas se sincronizan con tu cuenta.",
    "saved.name": "Nombre de la ruta",
    "saved.name.placeholder": "ej. Casa a Trabajo",
    "saved.add": "Agregar ruta",
    "saved.empty": "Aún no has guardado ninguna ruta.",
    "saved.favoriteBridge": "Puente favorito",
    "saved.openInPlanner": "Abrir en el planeador",
    "saved.deleteConfirm": "¿Eliminar esta ruta guardada?",
    "saved.quickAdd.homeWork": "Casa → Trabajo",
    "saved.quickAdd.homeSchool": "Casa → Escuela",
    "saved.quickAdd.bridgeClinic": "Puente → Clínica",

    // Auth
    "auth.signIn.title": "Inicia sesión en CruceEP",
    "auth.signUp.title": "Crea tu cuenta",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.displayName": "Nombre para mostrar",
    "auth.signIn": "Iniciar sesión",
    "auth.signUp": "Registrarse",
    "auth.magicLink": "Envíenme un enlace mágico",
    "auth.magicLinkSent": "Revisa tu correo para el enlace de acceso.",
    "auth.toggleToSignUp": "¿Necesitas una cuenta? Regístrate",
    "auth.toggleToSignIn": "¿Ya tienes una cuenta? Inicia sesión",
    "auth.signOutSuccess": "Has cerrado sesión.",
    "auth.disabled":
      "El inicio de sesión no está disponible porque Supabase no está configurado. La app funciona con rutas guardadas localmente.",
    "auth.success": "Sesión iniciada correctamente.",

    // Admin
    "admin.title": "Panel de administración",
    "admin.subtitle":
      "Administra centros de enfriamiento, alertas y estado de fuentes de datos.",
    "admin.tab.coolingCenters": "Centros de enfriamiento",
    "admin.tab.alerts": "Alertas",
    "admin.tab.health": "Fuentes de datos",
    "admin.health.title": "Estado de fuentes de datos",
    "admin.health.status": "Estado",
    "admin.health.lastSuccess": "Último éxito",
    "admin.health.lastFailure": "Última falla",
    "admin.health.lastError": "Último error",
    "admin.health.noLogs": "No hay fallas de ingesta registradas.",
    "admin.coolingCenters.new": "Nuevo centro de enfriamiento",
    "admin.alerts.new": "Nueva alerta",
    "admin.deleteConfirm": "¿Eliminar este registro? No se puede deshacer.",
    "admin.saveSuccess": "Guardado correctamente.",

    // Errors / states
    "error.generic": "Algo salió mal. Inténtalo de nuevo.",
    "error.network": "No pudimos conectar con el servidor. Revisa tu conexión.",
    "error.unauthorized": "Debes iniciar sesión para hacer eso.",
    "error.forbidden": "No tienes permiso para hacer eso.",
    "error.notFound": "No pudimos encontrar lo que buscabas.",
    "error.saveFailed": "No pudimos guardar tus cambios.",
    "error.dataUnavailable": "Estos datos no están disponibles temporalmente.",
    "error.validation": "Corrige los campos resaltados.",
    "empty.generic": "Aún no hay nada que mostrar.",
    "footer.disclaimer":
      "CruceEP organiza fuentes oficiales y no está afiliado con CBP, Sun Metro, ETA, NWS ni la Ciudad de El Paso. Confirma siempre con las fuentes oficiales.",
  },
} satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof (typeof dictionary)["en"];

/** Resolve a key for a locale, falling back to English, then the key itself. */
export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const table = dictionary[locale] ?? dictionary.en;
  let value: string = table[key] ?? dictionary.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}
