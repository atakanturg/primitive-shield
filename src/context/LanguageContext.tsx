import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = "en" | "es" | "ht";

export const translations = {
  en: {
    home: "Home", scan: "Scan", dashboard: "Dashboard", results: "Results", chat: "Chat",
    title: "Primitive Shield",
    hook: "85,000+ informal or illegal evictions", hookSub: "Occur in Miami-Dade County every year.",
    problem: "Legally Questionable.",
    problemSub: "Landlords frequently use illegal tactics to force tenants out because most residents don't know their rights. Florida law requires a formal court process that cannot be bypassed.",
    problemStat1: "Unlawful Tactics", problemStat2: "Tenant Unawareness", problemStat3: "Skipped Due Process",
    solution: "Our Solution.",
    solutionSub: "Primitive Shield cross-reference your notice against Florida Chapter 83 and the Fair Housing Act in seconds.",
    solutionCTA: "Upload your notice now",
    scanBtn: "Scan Document Now",
    // UPLOAD PAGE
    scanTitle: "Scan your notice",
    scanSub: "Upload a photo or PDF of the notice you received. We'll analyze it against current Miami-Dade housing law.",
    tipsBtn: "Tips for best results",
    clickDrag: "Click to select or drag & drop",
    fileFormats: "JPG, PNG or PDF, up to 10 MB",
    removeBtn: "Remove",
    analyzeBtn: "Analyze Notice",
    analyzingDoc: "Analyzing document",
    crossRef: "Cross-referencing Miami-Dade Municipal Codes...",
    // INSTRUCTIONS PAGE
    backUpload: "Back to Upload",
    tipsTitle: "Tips for best results",
    tipsStep1: "Find the legal document or notice you received from your landlord.",
    tipsStep2: "Place it on a flat, well-lit surface. Avoid shadows and glare.",
    tipsStep3: "Take the photo straight-on, making sure all text is legible and the entire page is visible.",
    tipsStep4: "If possible, use a scanner app or upload a direct PDF file.",
    tipsStep5: "Accepted formats: JPG, PNG or PDF up to 10 MB.",
    disclaimer: "Disclaimer: Primitive Shield is not a substitute for professional legal counsel.",
    showInstructions: "Show instructions",
    hideInstructions: "Hide instructions",
    // RESULTS PAGE
    noViolations: "No Violations Detected",
    noViolationsSub: "This notice does not display overt predatory markers against the evaluated statutes. However, legal terms can be complex. If you feel uncertain, consult one of the free legal resources listed in your action plan.",
    cantRead: "We Couldn't Read This Document",
    cantReadSub: "The image was too blurry, dark, or didn't appear to be a housing notice. Follow the steps in your action plan to re-upload a clearer version.",
    reuploadBtn: "Re-Upload Document",
    specificQuestions: "Have specific questions?",
    chatSub: "Chat directly with an AI assistant about this notice.",
    chatWithNotice: "Chat with your Notice",
    actionPlan: "Your Action Plan",
    defenseLetter: "Generate Defense Letter (PDF)",
    scanAnother: "Scan Another Notice",
    flaggedClauses: "Flagged Clauses",
    detailedAnalysisOnlyNew: "Detailed clause analysis is only available for new scans. Please see the summary above for the legal assessment.",
    // DASHBOARD PAGE
    signInRequired: "Sign in required",
    historySub: "You must be signed in to view your scan history.",
    signInBtn: "Sign In with Google",
    yourScans: "Your Scans",
    noScansYet: "You haven't scanned any notices yet.",
    scanDoc: "Scan a Document",
    // CHAT PAGE
    noDocFound: "No Document Found",
    chatInitSub: "Please scan a document first to use the chat assistant.",
    noticeAssistant: "Notice Assistant",
    chatAssistant: "Chat Assistant",
    howCanHelp: "How can I help you?",
    chatPlaceholder: "Ask about deadlines, legal terms, or what to do next based on the document you uploaded.",
    reviewingLaw: "Reviewing Florida law...",
    chatInputPlaceholder: "Ask about your notice...",
    sendBtn: "Send",
    // PERSISTENT FOOTER & HYDRATING
    footerSignInMsg: "Sign in to securely save and analyze your notices.",
    hydratingSession: "Hydrating Session...",
    backResults: "Back to Results",
    back: "Back",
    backHistory: "Back to History",
    viewResults: "View Results",
    // SHARED
    logout: "Logout",
    privacy: "Privacy",
    terms: "Terms",
    status: "Status: Optimal",
    initializing: "Initializing Primitive Shield",
    statusPredatory: "Predatory Notice Detected",
    statusLegal: "Notice Appears Valid",
    statusIllegible: "Document Not Readable",
    // PDF GENERATION
    pdfTitle: "TENANT RESPONSE TO INVALID NOTICE",
    pdfDate: "Date",
    pdfTo: "To: Landlord / Property Manager",
    pdfFrom: "From: Tenant",
    pdfRe: "RE: Disputed Notice",
    pdfIntro: "I am writing to formally dispute the notice I recently received. Upon review, the notice appears to be in violation of Florida Chapter 83 and/or Miami-Dade Municipal Code for the following reasons:",
    pdfViolation: "Violation:",
    pdfExplanation: "Explanation:",
    pdfLaw: "Law/Statute:",
    pdfClosing: "I request that you immediately rescind this notice and follow all lawful procedures as required by Florida law. I reserve all legal rights, including the right to defend against any unlawful eviction action in court.",
    pdfSignature: "Tenant Signature",
    pdfSincerely: "Sincerely,"
  },
  es: {
    home: "Inicio", scan: "Escanear", dashboard: "Panel", results: "Resultados", chat: "Chat",
    title: "Escudo Primitivo",
    hook: "Más de 85,000 desalojos informales o ilegales", hookSub: "Ocurren en el condado de Miami-Dade cada año.",
    problem: "Legalmente Cuestionable.",
    problemSub: "Los propietarios suelen utilizar tácticas ilegales para forzar la salida de los inquilinos porque la mayoría no conoce sus derechos. La ley de Florida exige un proceso judicial formal que no se puede saltar.",
    problemStat1: "Tácticas Ilegales", problemStat2: "Desconocimiento", problemStat3: "Proceso Omitido",
    solution: "Nuestra solución.",
    solutionSub: "Primitive Shield contrasta su aviso con el Capítulo 83 de Florida y la Ley de Vivienda Justa en segundos.",
    solutionCTA: "Sube tu aviso ahora",
    scanBtn: "Escanear Documento Ahora",
    // UPLOAD PAGE
    scanTitle: "Escanee su aviso",
    scanSub: "Suba una foto o PDF del aviso que recibió. Lo analizaremos contra la ley de vivienda actual de Miami-Dade.",
    tipsBtn: "Consejos para mejores resultados",
    clickDrag: "Haga clic para seleccionar o arrastrar y soltar",
    fileFormats: "JPG, PNG o PDF, hasta 10 MB",
    removeBtn: "Eliminar",
    analyzeBtn: "Analizar aviso",
    analyzingDoc: "Analizando documento",
    crossRef: "Cruzando con los códigos municipales de Miami-Dade...",
    // INSTRUCTIONS PAGE
    backUpload: "Volver a Escanear",
    tipsTitle: "Consejos para mejores resultados",
    tipsStep1: "Busque el documento legal o aviso que recibió de su arrendador.",
    tipsStep2: "Colóquelo sobre una superficie plana y bien iluminada. Evite las sombras y los reflejos.",
    tipsStep3: "Tome la foto de frente, asegurándose de que todo el texto sea legible y toda la página sea visible.",
    tipsStep4: "Si es posible, use una aplicación de escaneo o suba un archivo PDF directo.",
    tipsStep5: "Formatos aceptados: JPG, PNG o PDF hasta 10 MB.",
    disclaimer: "Descargo de responsabilidad: Primitive Shield es un sustituto de asesoramiento legal profesional.",
    showInstructions: "Mostrar instrucciones",
    hideInstructions: "Ocultar instrucciones",
    // RESULTS PAGE
    noViolations: "No se detectaron violaciones",
    noViolationsSub: "Este aviso no muestra marcadores abusivos evidentes contra los estatutos evaluados. Sin embargo, los términos legales pueden ser complejos. Si no se siente seguro, consulte uno de los recursos legales gratuitos enumerados en su plan de acción.",
    cantRead: "No pudimos leer este documento",
    cantReadSub: "La imagen estaba demasiado borrosa, oscura o no parecía ser un aviso de vivienda. Siga los pasos de su plan de acción para volver a subir una versión más clara.",
    reuploadBtn: "Volver a subir documento",
    specificQuestions: "¿Tiene preguntas específicas?",
    chatSub: "Chatee directamente con un asistente de IA sobre este aviso.",
    chatWithNotice: "Chatee con su aviso",
    actionPlan: "Su plan de acción",
    defenseLetter: "Generar carta de defensa (PDF)",
    scanAnother: "Escanear otro aviso",
    flaggedClauses: "Cláusulas señaladas",
    detailedAnalysisOnlyNew: "El análisis detallado de cláusulas solo está disponible para nuevos escaneos. Consulte el resumen anterior para la evaluación legal.",
    // DASHBOARD PAGE
    signInRequired: "Se requiere inicio de sesión",
    historySub: "Debe iniciar sesión para ver su historial de escaneos.",
    signInBtn: "Iniciar sesión con Google",
    yourScans: "Sus escaneos",
    noScansYet: "Aún no ha escaneado ningún aviso.",
    scanDoc: "Escanear un documento",
    // CHAT PAGE
    noDocFound: "No se encontró ningún documento",
    chatInitSub: "Primero escanee un documento para usar el asistente de chat.",
    noticeAssistant: "Asistente de aviso",
    chatAssistant: "Asistente de chat",
    howCanHelp: "¿Cómo puedo ayudarle?",
    chatPlaceholder: "Pregunte sobre plazos, términos legales o qué hacer a continuación según el documento que subió.",
    reviewingLaw: "Revisando la ley de Florida...",
    chatInputPlaceholder: "Pregunte sobre su aviso...",
    sendBtn: "Enviar",
    // PERSISTENT FOOTER & HYDRATING
    footerSignInMsg: "Inicie sesión para guardar y analizar sus avisos de forma segura.",
    hydratingSession: "Cargando sesión...",
    backResults: "Volver a los resultados",
    back: "Volver",
    backHistory: "Volver al historial",
    viewResults: "Ver resultados",
    // SHARED
    logout: "Cerrar sesión",
    privacy: "Privacidad",
    terms: "Términos",
    status: "Estado: Óptimo",
    initializing: "Inicializando Escudo Primitivo",
    statusPredatory: "Aviso abusivo detectado",
    statusLegal: "El aviso parece ser válido",
    statusIllegible: "Documento no legible",
    // PDF GENERATION
    pdfTitle: "RESPUESTA DEL INQUILINO A AVISO INVÁLIDO",
    pdfDate: "Fecha",
    pdfTo: "Para: Arrendador / Administrador de la propiedad",
    pdfFrom: "De: Inquilino",
    pdfRe: "REF: Aviso disputado",
    pdfIntro: "Le escribo para disputar formalmente el aviso que recibí recientemente. Tras revisarlo, el aviso parece violar el Capítulo 83 de Florida y/o el Código Municipal de Miami-Dade por las siguientes razones:",
    pdfViolation: "Violación:",
    pdfExplanation: "Explicación:",
    pdfLaw: "Ley/Estatuto:",
    pdfClosing: "Solicito que rescinda inmediatamente este aviso y siga todos los procedimientos legales requeridos por la ley de Florida. Me reservo todos los derechos legales, incluido el derecho a defenderme contra cualquier acción de desalojo ilegal en el tribunal.",
    pdfSignature: "Firma del Inquilino",
    pdfSincerely: "Atentamente,"
  },
  ht: {
    home: "Akey", scan: "Eskane", dashboard: "Dachbòd", results: "Rezilta", chat: "Chat",
    title: "Pwotèksyon Primitif",
    hook: "Plis pase 85,000 degèpisman enfòmèl oswa ilegal", hookSub: "Rive nan Miami-Dade County chak ane.",
    problem: "Kestyon Legal.",
    problemSub: "Mèt kay yo souvan itilize taktik ilegal pou fòse lokatè yo pati paske anpil moun pa konnen dwa yo. Lwa Florid mande yon pwosesis tribinal fòmèl ki pa ka neglije.",
    problemStat1: "Taktik Ilegal", problemStat2: "Mank Konesans", problemStat3: "Pwosesis Sote",
    solution: "Solisyon nou an.",
    solutionSub: "Primitive Shield konpare avi ou ak Chapit 83 Florid ak Lwa Lojman Ekitab nan kèk segond.",
    solutionCTA: "Telechaje avi ou kounye a",
    scanBtn: "Eskane Dokiman Kounye a",
    // UPLOAD PAGE
    scanTitle: "Eskane avi ou",
    scanSub: "Telechaje yon foto oswa PDF avi ou te rezewa a. N ap analize l kont lwa lojman aktyèl Miami-Dade.",
    tipsBtn: "KONSÈY POU PI BON REZILTA",
    clickDrag: "Klike pou chwazi oswa trennen ak lage",
    fileFormats: "JPG, PNG oswa PDF, jiska 10 MB",
    removeBtn: "Retire",
    analyzeBtn: "Analize avi",
    analyzingDoc: "Ap analize dokiman",
    crossRef: "Konpare ak Kòd Minisipal Miami-Dade...",
    // INSTRUCTIONS PAGE
    backUpload: "Tounen nan Eskane",
    tipsTitle: "KONSÈY POU PI BON REZILTA",
    tipsStep1: "Jwenn dokiman legal oswa avi ou te resevwa nan men mèt kay la.",
    tipsStep2: "Mete l sou yon sifas ki plat, byen klere. Evite lonbraj ak ekla.",
    tipsStep3: "Pran foto a dwat devan, asire w tout tèks la ka li epi tout paj la vizib.",
    tipsStep4: "Si sa posib, sèvi ak yon aplikasyon eskanè oswa telechaje yon dosye PDF dirèk.",
    tipsStep5: "Fòma yo aksepte: JPG, PNG oswa PDF jiska 10 MB.",
    disclaimer: "Limitasyon Responsablite: Primitive Shield pa ranplase konsèy legal pwofesyonèl.",
    showInstructions: "Montre enstriksyon yo",
    hideInstructions: "Kache enstriksyon yo",
    // RESULTS PAGE
    noViolations: "Pa gen okenn vyolasyon detekte",
    noViolationsSub: "Avi sa a pa montre mak predatè evidan kont lwa yo evalye yo. Sepandan, tèm legal yo ka konplèks. Si ou pa sèten, konsilte youn nan resous legal gratis ki nan lis plan aksyon ou a.",
    cantRead: "Nou pa t ka li dokiman sa a",
    cantReadSub: "Foto a te twò flou, nwa, oswa li pa t parèt kòm yon avi lojman. Swiv etap ki nan plan aksyon ou a pou w ka telechaje yon lòt vèsyon ki pi klè.",
    reuploadBtn: "Telechaje Dokiman an Ankò",
    specificQuestions: "Èske w gen kesyon espesifik?",
    chatSub: "Chat dirèkteman avèk yon asistan AI sou avi sa a.",
    chatWithNotice: "Chat ak Avi ou a",
    actionPlan: "Plan Aksyon Ou",
    defenseLetter: "Jenere Lèt Defans (PDF)",
    scanAnother: "Eskane yon Lòt Avi",
    flaggedClauses: "Kòz ki make yo",
    detailedAnalysisOnlyNew: "Analiz detay disponib sèlman pou nouvo eskanè yo. Tanpri gade rezime anlè a pou evalyasyon legal la.",
    // DASHBOARD PAGE
    signInRequired: "Koneksyon Obligatwa",
    historySub: "Ou dwe konekte pou w ka wè istwa eskane w yo.",
    signInBtn: "Konekte ak Google",
    yourScans: "Eskane W yo",
    noScansYet: "Ou pa poko eskane okenn avi.",
    scanDoc: "Eskane yon Dokiman",
    // CHAT PAGE
    noDocFound: "Pa gen Dokiman Jwenn",
    chatInitSub: "Tanpri eskane yon dokiman anvan pou w ka sèvi ak asistan chat la.",
    noticeAssistant: "Asistan Avi",
    chatAssistant: "Asistan Chat",
    howCanHelp: "Kouman mwen ka ede w?",
    chatPlaceholder: "Mande enfòmasyon sou delè, tèm legal, oswa sa pou w fè apre, baze sou dokiman ou te telechaje a.",
    reviewingLaw: "Ap revize lwa Florid la...",
    chatInputPlaceholder: "Mande sou avi ou...",
    sendBtn: "Voye",
    // PERSISTENT FOOTER & HYDRATING
    footerSignInMsg: "Konekte pou w ka sove epi analize avi w yo an sekirite.",
    hydratingSession: "Ap chaje sesyon...",
    backResults: "Tounen nan Rezilta yo",
    back: "Retounen",
    backHistory: "Tounen nan Istwa",
    viewResults: "Wè rezilta yo",
    // SHARED
    logout: "Dekonekte",
    privacy: "Konfidansyalite",
    terms: "Kondisyon",
    status: "Estati: Optimal",
    initializing: "Ap Inisyalize Pwotèksyon Primitif",
    statusPredatory: "Avi Predatè Detekte",
    statusLegal: "Avi a Parèt Valab",
    statusIllegible: "Dokiman an pa ka li",
    // PDF GENERATION
    pdfTitle: "REPONS LOKATÈ POU AVI KI PA VALAB",
    pdfDate: "Dat",
    pdfTo: "Pou: Mèt Kay / Manadjè Pwopriyete",
    pdfFrom: "Nan men: Lokatè",
    pdfRe: "KONSÈNAN: Avi ki konteste",
    pdfIntro: "Mwen ekri pou m konteste fòmèlman avi mwen fèk resevwa a. Apre revizyon, avi a parèt an vyolasyon Chapit 83 Florid ak/oswa Kòd Minisipal Miami-Dade pou rezon sa yo:",
    pdfViolation: "Vyolasyon:",
    pdfExplanation: "Eksplikasyon:",
    pdfLaw: "Lwa/Stati:",
    pdfClosing: "Mwen mande pou ou anile avi sa a imedyatman epi swiv tout pwosesis legal jan lwa Florid mande sa. Mwen rezève tout dwa legal mwen, tankou dwa pou m defann tèt mwen kont nenpòt aksyon degèpisman ilegal nan tribinal.",
    pdfSignature: "Siyati Lokatè",
    pdfSincerely: "Sensèman,"
  }
};

interface LanguageContextType {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Lang>(() => {
    const saved = localStorage.getItem("shield_lang");
    return (saved as Lang) || "en";
  });

  const setLanguage = (lang: Lang) => {
    setLanguageState(lang);
    localStorage.setItem("shield_lang", lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
