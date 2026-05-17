import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, AlertTriangle, ArrowRight, ArrowLeft, Shield, FileText, CheckCircle, XCircle, RefreshCw, LayoutDashboard, Loader2 } from "lucide-react";
import { supabase } from "./lib/supabase";
import { jsPDF } from "jspdf";

type ViewState = "home" | "upload" | "results" | "instructions" | "dashboard" | "chat";
type Lang = "en" | "es" | "ht";

const t = {
  en: {
    home: "Home", scan: "Scan", dashboard: "Dashboard", results: "Results", chat: "Chat",
    title: "Primitive Shield",
    hook: "85,000+ informal or illegal evictions", hookSub: "Occur in Miami-Dade County every year.",
    problem: "Illegal by design.",
    problemSub: "Informal evictions violate Florida Statute 83.56, which requires a formal 3-day notice and full court process. Landlords skip this to bypass tenant rights.",
    problemStat1: "No valid notice given", problemStat2: "No court filing", problemStat3: "Illegal self-help methods",
    solution: "Our Solution.",
    solutionSub: "Primitive Shield cross-reference your notice against Florida Chapter 83 and the Fair Housing Act in seconds.",
    solutionCTA: "Upload your notice now",
    scanBtn: "Scan Document Now",
    // UPLOAD PAGE
    scanTitle: "Scan your notice",
    scanSub: "Upload a photo or PDF of the notice you received. We'll analyze it against current Miami-Dade housing law.",
    tipsBtn: "Tips for best results",
    clickDrag: "Click to select or drag & drop",
    fileFormats: "JPG, PNG or PDF — up to 10 MB",
    removeBtn: "Remove",
    analyzeBtn: "Analyze Notice",
    analyzingDoc: "Analyzing document",
    crossRef: "Cross-referencing Miami-Dade Municipal Codes...",
    // INSTRUCTIONS PAGE
    backUpload: "Back to Upload",
    tipsTitle: "Tips for best results",
    tipsStep1: "Find the legal document or notice you received from your landlord.",
    tipsStep2: "Place it on a flat, well-lit surface — avoid shadows and glare.",
    tipsStep3: "Take the photo straight-on, making sure all text is legible and the entire page is visible.",
    tipsStep4: "If possible, use a scanner app or upload a direct PDF file.",
    tipsStep5: "Accepted formats: JPG, PNG or PDF up to 10 MB.",
    disclaimer: "Disclaimer: Primitive Shield is not a substitute for professional legal counsel.",
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
    back: "Back"
  },
  es: {
    home: "Inicio", scan: "Escanear", dashboard: "Panel", results: "Resultados", chat: "Chat",
    title: "Escudo Primitivo",
    hook: "Más de 85,000 desalojos informales o ilegales", hookSub: "Ocurren en el condado de Miami-Dade cada año.",
    problem: "Ilegal por diseño.",
    problemSub: "Los desalojos informales violan el Estatuto 83.56 de Florida, que exige un aviso formal de 3 días y proceso judicial. Los propietarios se lo saltan para eludir la ley.",
    problemStat1: "Sin aviso válido", problemStat2: "Sin presentación judicial", problemStat3: "Métodos ilegales",
    solution: "Nuestra solución.",
    solutionSub: "Primitive Shield contrasta su aviso con el Capítulo 83 de Florida y la Ley de Vivienda Justa en segundos.",
    solutionCTA: "Sube tu aviso ahora",
    scanBtn: "Escanear Documento Ahora",
    // UPLOAD PAGE
    scanTitle: "Escanee su aviso",
    scanSub: "Suba una foto o PDF del aviso que recibió. Lo analizaremos contra la ley de vivienda actual de Miami-Dade.",
    tipsBtn: "Consejos para mejores resultados",
    clickDrag: "Haga clic para seleccionar o arrastrar y soltar",
    fileFormats: "JPG, PNG o PDF — hasta 10 MB",
    removeBtn: "Eliminar",
    analyzeBtn: "Analizar aviso",
    analyzingDoc: "Analizando documento",
    crossRef: "Cruzando con los códigos municipales de Miami-Dade...",
    // INSTRUCTIONS PAGE
    backUpload: "Volver a Escanear",
    tipsTitle: "Consejos para mejores resultados",
    tipsStep1: "Busque el documento legal o aviso que recibió de su arrendador.",
    tipsStep2: "Colóquelo sobre una superficie plana y bien iluminada — evite las sombras y los reflejos.",
    tipsStep3: "Tome la foto de frente, asegurándose de que todo el texto sea legible y toda la página sea visible.",
    tipsStep4: "Si es posible, use una aplicación de escaneo o suba un archivo PDF directo.",
    tipsStep5: "Formatos aceptados: JPG, PNG o PDF hasta 10 MB.",
    disclaimer: "Descargo de responsabilidad: Primitive Shield no es un sustituto de asesoramiento legal profesional.",
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
    back: "Volver"
  },
  ht: {
    home: "Akey", scan: "Eskane", dashboard: "Dachbòd", results: "Rezilta", chat: "Chat",
    title: "Pwotèksyon Primitif",
    hook: "Plis pase 85,000 degèpisman enfòmèl oswa ilegal", hookSub: "Rive nan Miami-Dade County chak ane.",
    problem: "Ilegal pa konsepsyon.",
    problemSub: "Degèpisman enfòmèl vyole Estatì 83.56 nan Florid, ki egzije yon avi ekri 3 jou ak pwosesis tribinal. Propriyetè yo pa swiv sa pou kontourne lwa a.",
    problemStat1: "Pa gen avi valid", problemStat2: "Pa gen depo tribinal", problemStat3: "Metòd ilegal",
    solution: "Solisyon nou an.",
    solutionSub: "Primitive Shield konpare avi ou ak Chapit 83 Florid ak Lwa Lojman Ekitab nan kèk segond.",
    solutionCTA: "Telechaje avi ou kounye a",
    scanBtn: "Eskane Dokiman Kounye a",
    // UPLOAD PAGE
    scanTitle: "Eskane avi ou",
    scanSub: "Telechaje yon foto oswa PDF avi ou te rezewa a. N ap analize l kont lwa lojman aktyèl Miami-Dade.",
    tipsBtn: "KONSÈY POU PI BON REZILTA",
    clickDrag: "Klike pou chwazi oswa trennen ak lage",
    fileFormats: "JPG, PNG oswa PDF — jiska 10 MB",
    removeBtn: "Retire",
    analyzeBtn: "Analize avi",
    analyzingDoc: "Ap analize dokiman",
    crossRef: "Konpare ak Kòd Minisipal Miami-Dade...",
    // INSTRUCTIONS PAGE
    backUpload: "Tounen nan Eskane",
    tipsTitle: "KONSÈY POU PI BON REZILTA",
    tipsStep1: "Jwenn dokiman legal oswa avi ou te resevwa nan men mèt kay la.",
    tipsStep2: "Mete l sou yon sifas ki plat, byen klere — evite lonbraj ak ekla.",
    tipsStep3: "Pran foto a dwat devan, asire w tout tèks la ka li epi tout paj la vizib.",
    tipsStep4: "Si sa posib, sèvi ak yon aplikasyon eskanè oswa telechaje yon dosye PDF dirèk.",
    tipsStep5: "Fòma yo aksepte: JPG, PNG oswa PDF jiska 10 MB.",
    disclaimer: "Limitasyon Responsablite: Primitive Shield pa ranplase konsèy legal pwofesyonèl.",
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
    // DASHBOARD PAGE
    signInRequired: "Koneksyon Obligatwa",
    historySub: "Ou dwe konekte pou w ka wè istwa eskane w yo.",
    signInBtn: "Konekte ak Google",
    yourScans: "Eskane W yo",
    noScansYet: "Ou pa poko eskane okenn avi.",
    scanDoc: "Escanear un documento",
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
    back: "Retounen"
  }
};

export default function App() {
  const [view, setView] = useState<ViewState>(() => (localStorage.getItem("shield_view") as ViewState) || "home");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(() => {
    const cached = localStorage.getItem("shield_result");
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [language, setLanguage] = useState<Lang>(() => (localStorage.getItem("shield_lang") as Lang) || "en");
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(() => localStorage.getItem("shield_scanned_image_url"));
  const [scannedImageBase64, setScannedImageBase64] = useState<string | null>(() => localStorage.getItem("shield_scanned_image_base64"));
  const [chatMessages, setChatMessages] = useState<any[]>(() => {
    const cached = localStorage.getItem("shield_chat_messages");
    return cached ? JSON.parse(cached) : [];
  });
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("shield_view", view);
  }, [view]);

  useEffect(() => {
    if (result) {
      localStorage.setItem("shield_result", JSON.stringify(result));
    } else {
      localStorage.removeItem("shield_result");
    }
  }, [result]);

  useEffect(() => {
    localStorage.setItem("shield_lang", language);
  }, [language]);

  useEffect(() => {
    if (scannedImageUrl) {
      localStorage.setItem("shield_scanned_image_url", scannedImageUrl);
    } else {
      localStorage.removeItem("shield_scanned_image_url");
    }
  }, [scannedImageUrl]);

  useEffect(() => {
    if (scannedImageBase64) {
      localStorage.setItem("shield_scanned_image_base64", scannedImageBase64);
    } else {
      localStorage.removeItem("shield_scanned_image_base64");
    }
  }, [scannedImageBase64]);

  useEffect(() => {
    localStorage.setItem("shield_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, []);

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setScannedImageUrl(null);
    setScannedImageBase64(null);
    setChatMessages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const navigateTo = (v: ViewState) => {
    setView(v);
    window.scrollTo(0, 0);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              "image/jpeg",
              0.85
            );
          } else {
            resolve(file);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      if (!session) {
        throw new Error("Please sign in to save and analyze your notice.");
      }

      // 1. Compress image & upload to Supabase Storage
      const compressedFile = await compressImage(file);
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notices')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL to pass to our database scans record
      const { data: { publicUrl } } = supabase.storage
        .from('notices')
        .getPublicUrl(filePath);

      setScannedImageUrl(publicUrl);

      // Convert compressed image to base64 for fast and secure vision parsing
      const base64String = await fileToBase64(compressedFile);
      setScannedImageBase64(base64String);

      // 2. Call our secure serverless backend on Cloudflare Pages
      const langMap = { en: "English", es: "Spanish", ht: "Haitian Creole" };
      const response = await fetch("/api/analyze-notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageUrl: base64String, language: langMap[language] }),
      });

      if (!response.ok) {
        let msg = "Analysis failed";
        try { const d = await response.json(); msg = d.error || msg; } catch {}
        throw new Error(msg);
      }
      const data = await response.json();
      setResult(data);

      // 3. Save the result to the scans table
      await supabase.from('scans').insert({
        user_id: session.user.id,
        image_url: publicUrl,
        status: data.status,
        summary: data.summary_of_violations
      });

      setView("results");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; accent: string }> = {
    predatory: { label: "Predatory Notice Detected", icon: <XCircle className="w-8 h-8" />, accent: "border-red-500" },
    legal: { label: "Notice Appears Valid", icon: <CheckCircle className="w-8 h-8" />, accent: "border-emerald-500" },
    illegible: { label: "Document Not Readable", icon: <RefreshCw className="w-8 h-8" />, accent: "border-amber-500" },
  };

  // ─── NAV ───
  // ─── NAV ───
  const NavBar = () => {
    const [atBottom, setAtBottom] = React.useState(false);

    React.useEffect(() => {
      const handleScroll = () => {
        const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
        setAtBottom(scrolledToBottom);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-neutral-200/60 shadow-sm relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6 relative">
          <button onClick={() => navigateTo("home")} className="flex items-center space-x-2 group shrink-0">
            <Shield className="w-5 h-5 text-neutral-900 group-hover:text-neutral-600 transition-colors" />
            <span className="font-semibold text-sm tracking-tight text-neutral-900 hidden sm:block">{t[language].title}</span>
          </button>

          {!atBottom && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center animate-bounce cursor-pointer text-neutral-400 hover:text-neutral-900 transition-colors"
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
            >
              <ArrowRight className="w-5 h-5 rotate-90" />
            </div>
          )}

          <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
            <button onClick={() => navigateTo("home")} className={`text-sm transition-all ${view === "home" ? "font-bold text-neutral-900" : "font-medium text-neutral-500 hover:text-neutral-900"}`}>{t[language].home}</button>
            <button onClick={() => navigateTo("upload")} className={`text-sm transition-all ${view === "upload" ? "font-bold text-neutral-900" : "font-medium text-neutral-500 hover:text-neutral-900"}`}>{t[language].scan}</button>
            <button onClick={() => navigateTo("chat")} className={`text-sm transition-all ${view === "chat" ? "font-bold text-neutral-900" : "font-medium text-neutral-500 hover:text-neutral-900"}`}>{t[language].chat}</button>
            {session && <button onClick={() => navigateTo("dashboard")} className={`text-sm transition-all ${view === "dashboard" ? "font-bold text-neutral-900" : "font-medium text-neutral-500 hover:text-neutral-900"}`}>{t[language].dashboard}</button>}
            {result && <button onClick={() => navigateTo("results")} className={`text-sm transition-all ${view === "results" ? "font-bold text-neutral-900" : "font-medium text-neutral-500 hover:text-neutral-900"}`}>{t[language].results}</button>}
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Lang)}
              className="bg-transparent border-none text-neutral-500 font-semibold text-sm focus:outline-none cursor-pointer hover:text-neutral-900"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="ht">HT</option>
            </select>
          </div>
        </div>
      </nav>
    );
  };

  // ─── HOME ───
  const HomePage = () => {
    return (
      <div className="animate-fade-up">
        {/* Chapter 1: The Hook */}
        <section className="relative min-h-[75vh] flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?q=80&w=2000&auto=format&fit=crop"
              alt="Urban housing"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/80" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 w-full mt-[-5vh] flex flex-col items-center text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tighter leading-[1] mb-6">
              {t[language].hook}
            </h1>
            <p className="text-lg sm:text-2xl text-neutral-300 font-light leading-relaxed max-w-xl mb-10">
              {t[language].hookSub}
            </p>
            <button
              onClick={() => document.getElementById('chapter-3')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center text-white border border-white/20 px-8 py-4 rounded-none bg-transparent hover:bg-white hover:text-neutral-950 transition-colors backdrop-blur-md text-xs font-mono uppercase tracking-widest"
            >
              <span>Go to solution</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </section>

        {/* Chapter 2: The Problem */}
        <section id="chapter-2" className="relative bg-transparent text-neutral-900 py-28">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">The Problem</span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
                {t[language].problem}
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-10">
                {t[language].problemSub}
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[t[language].problemStat1, t[language].problemStat2, t[language].problemStat3].map((stat, i) => (
                  <div key={i} className="border-l border-neutral-950 pl-4 py-2">
                    <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest leading-snug mb-1">0{i+1}</p>
                    <p className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider leading-snug">{stat}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-none overflow-hidden border border-neutral-950 aspect-[4/5] shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000&auto=format&fit=crop"
                alt="Tenant reviewing legal documents"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Chapter 3: Our Solution — includes CTA */}
        <section id="chapter-3" className="relative bg-neutral-950 text-white py-28 border-t border-b border-white/15">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="rounded-none overflow-hidden border border-white/10 aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000&auto=format&fit=crop"
                alt="Attorney reviewing tenant case"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
            <div>
              <span className="inline-block font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">Our Solution</span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
                {t[language].solution}
              </h2>
              <p className="text-lg text-neutral-300 leading-relaxed mb-10">
                {t[language].solutionSub}
              </p>
              <button
                onClick={() => navigateTo("upload")}
                className="inline-flex items-center group bg-white text-neutral-900 px-8 py-4 rounded-none hover:bg-neutral-100 transition-all text-xs font-mono uppercase tracking-widest"
              >
                <span>{t[language].solutionCTA}</span>
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-start space-x-4 border border-yellow-500 bg-yellow-400/10 text-yellow-900 p-6 rounded-none">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-xs font-mono uppercase tracking-wide leading-relaxed">
              <strong>Legal Disclaimer:</strong> Primitive Shield provides AI-powered analysis for informational purposes only. It is not a substitute for professional legal counsel. Always consult a licensed attorney for legal advice.
            </p>
          </div>
        </section>
      </div>
    );
  };

  // ─── UPLOAD ───
  const UploadPage = () => (
    <div className="animate-fade-up">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-2 border-neutral-200 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-neutral-900 rounded-full border-t-transparent animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">{t[language].analyzingDoc}</h2>
          <p className="text-sm text-neutral-400 font-mono">{t[language].crossRef}</p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto px-6 py-16">
          <button onClick={() => navigateTo("home")} className="flex items-center text-xs text-neutral-400 hover:text-neutral-900 transition-colors mb-8 group">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> {t[language].back}
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{t[language].scanTitle}</h1>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            {t[language].scanSub}
          </p>
          <button 
            onClick={() => navigateTo("instructions")} 
            className="mb-8 inline-flex items-center space-x-2 px-6 py-3 border border-neutral-950 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest rounded-none hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <span>{t[language].tipsBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border border-dashed border-neutral-300 rounded-none cursor-pointer transition-all p-16 flex flex-col items-center justify-center text-center group bg-neutral-50/20 hover:bg-neutral-50/40 hover:border-neutral-950`}
              >
                <div className="mb-4 text-neutral-400 group-hover:text-neutral-950 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-700 mb-1">
                  {isDragging ? "Drop file here" : t[language].clickDrag}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{t[language].fileFormats}</span>
              </div>
            ) : (
              <div className="border border-neutral-950 p-6 rounded-none bg-neutral-50/20">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-none overflow-hidden bg-neutral-100 border border-neutral-300 flex-shrink-0 mr-4">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-900 truncate">{file?.name}</p>
                    <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{(file ? file.size / 1024 / 1024 : 0).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={resetUpload} className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors ml-4 shrink-0">{t[language].removeBtn}</button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50/20 border border-red-500 rounded-none p-4 flex items-start space-x-3">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs font-mono uppercase tracking-wide text-red-755 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file}
              className="w-full flex justify-center items-center py-4 px-4 text-xs font-mono uppercase tracking-widest text-white bg-neutral-950 hover:bg-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-none border border-neutral-950"
            >
              {t[language].analyzeBtn}
            </button>
          </form>
        </div>
      )}
    </div>
  );

  // ─── INSTRUCTIONS ───
  const InstructionsPage = () => (
    <div className="max-w-xl mx-auto px-6 py-16 animate-fade-up">
      <button onClick={() => navigateTo("upload")} className="flex items-center text-xs text-neutral-400 hover:text-neutral-900 transition-colors mb-8 group">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> {t[language].backUpload}
      </button>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-8">{t[language].tipsTitle}</h1>
      <div className="space-y-4">
        {[
          t[language].tipsStep1,
          t[language].tipsStep2,
          t[language].tipsStep3,
          t[language].tipsStep4,
          t[language].tipsStep5,
        ].map((step, i) => (
          <div key={i} className="flex items-start space-x-4 p-5 rounded-none bg-neutral-50/40 border border-neutral-200">
            <span className="font-mono text-xs font-bold text-neutral-950 shrink-0 mt-0.5">0{i + 1}.</span>
            <p className="text-sm text-neutral-700 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-start space-x-4 border border-neutral-950 bg-neutral-50/20 p-6 rounded-none">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
        <p className="text-xs font-mono uppercase tracking-wide leading-relaxed">
          {t[language].disclaimer}
        </p>
      </div>
    </div>
  );

  // ─── RESULTS ───
  const ResultsPage = () => {
    if (!result) return null;
    const localizedStatusConfig: Record<string, { label: string; icon: React.ReactNode; accent: string }> = {
      predatory: { label: language === "es" ? "Aviso abusivo detectado" : language === "ht" ? "Avi Predatè Detekte" : "Predatory Notice Detected", icon: <XCircle className="w-8 h-8" />, accent: "border-red-500" },
      legal: { label: language === "es" ? "El aviso parece ser válido" : language === "ht" ? "Avi a Parèt Valab" : "Notice Appears Valid", icon: <CheckCircle className="w-8 h-8" />, accent: "border-emerald-500" },
      illegible: { label: language === "es" ? "Documento no legible" : language === "ht" ? "Dokiman an pa ka li" : "Document Not Readable", icon: <RefreshCw className="w-8 h-8" />, accent: "border-amber-500" },
    };
    const cfg = localizedStatusConfig[result.status] || localizedStatusConfig.illegible;

    const generatePDF = () => {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("TENANT RESPONSE TO INVALID NOTICE", margin, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
      y += 10;
      
      doc.text("To: Landlord / Property Manager", margin, y);
      y += 10;
      
      doc.text("From: Tenant", margin, y);
      y += 15;

      doc.setFont("helvetica", "bold");
      doc.text("RE: Disputed Notice", margin, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      const intro = doc.splitTextToSize("I am writing to formally dispute the notice I recently received. Upon review, the notice appears to be in violation of Florida Chapter 83 and/or Miami-Dade Municipal Code for the following reasons:", 170);
      doc.text(intro, margin, y);
      y += intro.length * 7 + 5;

      if (result.flagged_clauses) {
        result.flagged_clauses.forEach((clause: any) => {
          if (y > 270) { doc.addPage(); y = margin; }
          doc.setFont("helvetica", "bold");
          doc.text("Violation:", margin, y);
          y += 7;
          doc.setFont("helvetica", "normal");
          const exp = doc.splitTextToSize(clause.explanation, 170);
          doc.text(exp, margin, y);
          y += exp.length * 7 + 5;
        });
      }

      if (y > 250) { doc.addPage(); y = margin; }
      const conclusion = doc.splitTextToSize("Because the notice is legally deficient, I demand that it be rescinded immediately. If you attempt a self-help eviction (e.g., changing locks, removing doors, or shutting off utilities), which is strictly prohibited under Florida Statute 83.67, I will pursue legal action for damages.", 170);
      doc.text(conclusion, margin, y);
      y += conclusion.length * 7 + 15;

      doc.text("Sincerely,", margin, y);
      y += 15;
      doc.text("__________________________", margin, y);
      y += 7;
      doc.text("Tenant Signature", margin, y);

      doc.save("tenant-defense-letter.pdf");
    };

    return (
      <div className="animate-fade-up">
        {/* Status Banner */}
        <div className={`border-b-4 ${cfg.accent}`}>
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-neutral-900">{cfg.icon}</span>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">{result.status}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">{cfg.label}</h1>
            <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">{result.summary_of_violations}</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left — Flagged Clauses */}
          <div className="lg:col-span-3 space-y-8">
            {result.flagged_clauses && result.flagged_clauses.length > 0 && (
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6">{t[language].flaggedClauses}</h2>
                <div className="space-y-6">
                  {result.flagged_clauses.map((clause: any, i: number) => (
                    <div key={i} className="border-t border-neutral-300 pt-6 pb-2 rounded-none">
                      <div className="mb-3">
                        <span className="inline-block bg-neutral-950 text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-none">
                          {clause.law_violated}
                        </span>
                      </div>
                      <blockquote className="text-sm italic text-neutral-600 bg-neutral-50 p-4 mb-4 border-l border-neutral-400 font-serif">
                        "{clause.excerpt}"
                      </blockquote>
                      <p className="text-sm text-neutral-600 leading-relaxed font-sans">{clause.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.status === "legal" && (
              <div className="border border-emerald-500 bg-emerald-50/20 p-6 rounded-none">
                <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-800 mb-2">{t[language].noViolations}</h2>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  {t[language].noViolationsSub}
                </p>
              </div>
            )}

            {result.status === "illegible" && (
              <div className="border border-amber-500 bg-amber-50/20 p-6 rounded-none">
                <h2 className="text-xs font-mono uppercase tracking-widest text-amber-800 mb-2">{t[language].cantRead}</h2>
                <p className="text-sm text-amber-700 leading-relaxed mb-4">
                  {t[language].cantReadSub}
                </p>
                <button onClick={() => { resetUpload(); navigateTo("upload"); }} className="inline-flex items-center border border-neutral-950 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest px-6 py-3 rounded-none hover:bg-neutral-800 transition-colors shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> {t[language].reuploadBtn}
                </button>
              </div>
            )}

            {/* Chat with Your Notice Button */}
            {scannedImageUrl && result.status !== "illegible" && (
              <div className="mt-12 border border-neutral-300 p-8 text-center rounded-none bg-neutral-50/20">
                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-900 mb-2">{t[language].specificQuestions}</h3>
                <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{t[language].chatSub}</p>
                <button onClick={() => navigateTo("chat")} className="inline-flex items-center space-x-2 px-8 py-4 border border-neutral-950 bg-neutral-950 text-white font-mono uppercase tracking-widest text-xs rounded-none hover:bg-neutral-800 transition-colors shadow-sm">
                  <span>{t[language].chatWithNotice}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right — Action Plan */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-950 text-white p-8 sticky top-20 border border-white/10 rounded-none shadow-sm">
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6 pb-4 border-b border-white/10">{t[language].actionPlan}</h2>
              <ol className="space-y-5">
                {(result.action_plan || []).map((step: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="font-mono text-xs font-bold text-white/55 mr-3 shrink-0 mt-0.5">0{i + 1}.</span>
                    <span className="text-sm leading-relaxed text-white/80">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                {result.status === "predatory" && (
                  <button onClick={generatePDF} className="w-full border border-red-600 bg-red-600 text-white text-xs font-mono uppercase tracking-widest py-3.5 rounded-none hover:bg-red-700 transition-colors">
                    {t[language].defenseLetter}
                  </button>
                )}
                <button onClick={() => { resetUpload(); navigateTo("upload"); }} className="w-full border border-white bg-white text-neutral-900 text-xs font-mono uppercase tracking-widest py-3.5 rounded-none hover:bg-neutral-100 transition-colors">
                  {t[language].scanAnother}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── DASHBOARD ───
  const DashboardPage = () => {
    const [scans, setScans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (session) {
        supabase
          .from('scans')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (data) setScans(data);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }, [session]);

    if (!session) {
      return (
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="text-xl font-bold font-mono uppercase tracking-widest mb-4">{t[language].signInRequired}</h2>
          <p className="text-neutral-500 mb-8 leading-relaxed">{t[language].historySub}</p>
          <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="px-6 py-3 border border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-900 font-mono text-xs uppercase tracking-widest rounded-none transition-colors">{t[language].signInBtn}</button>
        </div>
      );
    }

    return (
      <div className="animate-fade-up max-w-5xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-4" />
            {t[language].yourScans}
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-neutral-300" /></div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50/20 border border-neutral-300 rounded-none">
            <p className="text-neutral-500 mb-4">{t[language].noScansYet}</p>
            <button onClick={() => navigateTo("upload")} className="px-6 py-3 border border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-900 font-mono text-xs uppercase tracking-widest rounded-none transition-colors">{t[language].scanDoc}</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {scans.map((scan) => (
              <div key={scan.id} className="bg-white border border-neutral-300 rounded-none p-6 hover:border-neutral-900 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-0.5 text-[9px] font-mono border uppercase tracking-widest rounded-none ${scan.status === "predatory" ? "bg-red-50 border-red-500 text-red-700" : scan.status === "legal" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-neutral-50 border-neutral-500 text-neutral-700"}`}>
                    {scan.status}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">{new Date(scan.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-3">{scan.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── CHAT PAGE ───
  const ChatPage = () => {
    if (!scannedImageUrl) {
      return (
        <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-fade-up">
          <h2 className="text-xl font-bold font-mono uppercase tracking-widest mb-4">{t[language].noDocFound}</h2>
          <p className="text-neutral-500 mb-8 leading-relaxed">{t[language].chatInitSub}</p>
          <button onClick={() => navigateTo("upload")} className="px-6 py-3 border border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-900 font-mono text-xs uppercase tracking-widest rounded-none transition-colors">{t[language].scanDoc}</button>
        </div>
      );
    }

    return (
      <div className="animate-fade-up max-w-4xl mx-auto px-6 py-12 flex flex-col h-[85vh]">
        <button onClick={() => navigateTo("results")} className="flex items-center text-xs text-neutral-400 hover:text-neutral-900 transition-colors mb-6 group w-fit">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> {t[language].backResults}
        </button>

        <div className="bg-white border border-neutral-950 rounded-none flex flex-col flex-1">
          <div className="bg-neutral-950 text-white p-6 flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-xs font-mono uppercase tracking-widest text-neutral-400">{t[language].noticeAssistant}</h1>
              <h2 className="text-xl font-bold mt-1">{t[language].chatAssistant}</h2>
            </div>
            <div className="w-16 h-16 rounded-none overflow-hidden border border-white/20 shrink-0">
              <img src={scannedImageUrl} alt="Scanned Document" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-neutral-50 flex flex-col">
            {chatMessages.length === 0 && (
              <div className="m-auto text-center animate-fade-up">
                <div className="w-16 h-16 bg-white border border-neutral-950 rounded-none flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-neutral-350" />
                </div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">{t[language].howCanHelp}</h3>
                <p className="text-sm text-neutral-500 max-w-sm">{t[language].chatPlaceholder}</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-none px-5 py-4 border text-[14px] leading-relaxed ${msg.role === 'user' ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-white border-neutral-300 text-neutral-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-none px-5 py-4 text-[14px] bg-white border border-neutral-350 text-neutral-800 flex items-center space-x-3 shadow-none">
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  <span className="text-neutral-500 font-mono text-xs uppercase tracking-widest">{t[language].reviewingLaw}</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t border-neutral-200 shrink-0">
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!chatInput.trim() || chatLoading) return;
                const userMsg = { role: "user", content: chatInput };
                setChatMessages(prev => [...prev, userMsg]);
                setChatInput("");
                setChatLoading(true);

                try {
                  const langMap = { en: "English", es: "Spanish", ht: "Haitian Creole" };
                  const res = await fetch("/api/chat-notice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      imageUrl: scannedImageBase64 || scannedImageUrl,
                      messages: [...chatMessages, userMsg],
                      language: langMap[language]
                    })
                  });
                  if (!res.ok) throw new Error("Chat failed.");
                  const data = await res.json();
                  setChatMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
                } catch (err) {
                  setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, an error occurred while processing your question." }]);
                } finally {
                  setChatLoading(false);
                }
              }} 
              className="flex space-x-3"
            >
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t[language].chatInputPlaceholder}
                className="flex-1 border border-neutral-950 rounded-none px-5 py-4 text-sm focus:outline-none focus:bg-neutral-50/30 transition-all font-mono"
              />
              <button type="submit" disabled={chatLoading} className="border border-neutral-950 bg-neutral-950 text-white px-8 py-4 rounded-none text-xs font-mono uppercase tracking-widest hover:bg-neutral-900 disabled:opacity-50 transition-colors shrink-0">
                {t[language].sendBtn}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center justify-center animate-fade-up">
          <div className="relative mb-6">
            <div className="w-12 h-12 border-2 border-neutral-200 rounded-none" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-neutral-950 rounded-none border-t-transparent animate-spin" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">Primitive Shield</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-900 mt-1">{t[language].hydratingSession}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white bg-grid-pattern text-neutral-900 font-sans relative">
      <NavBar />
      <main>
        {view === "home" && HomePage()}
        {view === "upload" && UploadPage()}
        {view === "instructions" && InstructionsPage()}
        {view === "results" && ResultsPage()}
        {view === "dashboard" && DashboardPage()}
        {view === "chat" && ChatPage()}
      </main>
      <footer className="border-t border-neutral-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 pb-16">
          <span>© 2026 Primitive Shield — Miami-Dade Housing Justice</span>
          <span className="mt-2 sm:mt-0">Not legal advice. Consult a licensed attorney.</span>
        </div>
      </footer>

      {/* Persistent Footer */}
      {!session && (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/90 backdrop-blur-md py-3 px-6 flex flex-col sm:flex-row items-center justify-between z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-900 mb-2 sm:mb-0">
            {t[language].footerSignInMsg}
          </div>
          <button 
            className="bg-white text-neutral-900 font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-neutral-100 transition-colors flex items-center space-x-2 border border-neutral-950 rounded-none"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span>Sign In with Google</span>
          </button>
        </footer>
      )}
    </div>
  );
}
