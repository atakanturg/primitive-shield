import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { AmbientMesh } from "../components/AmbientMesh";
import { TiltCard } from "../components/TiltCard";
import { Upload, AlertTriangle, ArrowRight, ArrowLeft, FileText, CheckCircle, XCircle, RefreshCw, LayoutDashboard, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { jsPDF } from "jspdf";
import { useLanguage, Lang } from "../context/LanguageContext";
import { useNavigate } from 'react-router-dom';

const Shield305 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <text 
      x="12" 
      y="14.5" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="6.5" 
      fontWeight="900" 
      textAnchor="middle" 
      fill="currentColor" 
      stroke="none"
    >
      305
    </text>
  </svg>
);

type ViewState = "home" | "upload" | "results" | "instructions" | "dashboard" | "chat";

export default function ShieldApp({ view: propView }: { view?: ViewState }) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [view, setView] = useState<ViewState>(() => propView || (localStorage.getItem("shield_view") as ViewState) || "home");

  useEffect(() => {
    if (propView) setView(propView);
  }, [propView]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null);
  const [scannedImageBase64, setScannedImageBase64] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  // Helper for user-specific storage keys
  const getStorageKey = (key: string) => {
    if (!session?.user?.id) return null;
    return `shield_${session.user.id}_${key}`;
  };

  useEffect(() => {
    localStorage.setItem("shield_view", view);
  }, [view]);

  // Load user data when session is established
  useEffect(() => {
    if (!session?.user?.id) {
      // Clear data if no user
      setResult(null);
      setScannedImageUrl(null);
      setScannedImageBase64(null);
      setChatMessages([]);
      return;
    }

    const userId = session.user.id;
    
    const cachedResult = localStorage.getItem(`shield_${userId}_result`);
    if (cachedResult) setResult(JSON.parse(cachedResult));
    
    const cachedUrl = localStorage.getItem(`shield_${userId}_scanned_image_url`);
    if (cachedUrl) setScannedImageUrl(cachedUrl);
    
    const cachedBase64 = localStorage.getItem(`shield_${userId}_scanned_image_base64`);
    if (cachedBase64) setScannedImageBase64(cachedBase64);
    
    const cachedChat = localStorage.getItem(`shield_${userId}_chat_messages`);
    if (cachedChat) setChatMessages(JSON.parse(cachedChat));
  }, [session]);

  // Save user data
  useEffect(() => {
    const key = getStorageKey("result");
    if (key) {
      if (result) localStorage.setItem(key, JSON.stringify(result));
      else localStorage.removeItem(key);
    }
  }, [result, session]);

  useEffect(() => {
    const key = getStorageKey("scanned_image_url");
    if (key) {
      if (scannedImageUrl) localStorage.setItem(key, scannedImageUrl);
      else localStorage.removeItem(key);
    }
  }, [scannedImageUrl, session]);

  useEffect(() => {
    const key = getStorageKey("scanned_image_base64");
    if (key) {
      if (scannedImageBase64) localStorage.setItem(key, scannedImageBase64);
      else localStorage.removeItem(key);
    }
  }, [scannedImageBase64, session]);

  useEffect(() => {
    const key = getStorageKey("chat_messages");
    if (key) {
      localStorage.setItem(key, JSON.stringify(chatMessages));
    }
  }, [chatMessages, session]);

  useEffect(() => {
    const handleSelectScan = (e: any) => {
      const scan = e.detail;
      setResult({
        status: scan.status,
        summary_of_violations: scan.summary,
        // We'd ideally need to store flagged_clauses and action_plan in the DB too
        // for full reconstruction. For now, we'll show what we have.
        flagged_clauses: [], 
        action_plan: []
      });
      setScannedImageUrl(scan.image_url);
      navigateTo("results");
    };
    window.addEventListener('select-scan', handleSelectScan);
    return () => window.removeEventListener('select-scan', handleSelectScan);
  }, []);

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }
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
    const routeMap: Record<ViewState, string> = {
      home: "/",
      upload: "/scan",
      chat: "/chat",
      dashboard: "/dashboard",
      results: "/results",
      instructions: "/scan" // handled internally by showInstructions usually
    };
    navigate(routeMap[v]);
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
    predatory: { label: t.statusPredatory, icon: <XCircle className="w-8 h-8" />, accent: "border-red-500" },
    legal: { label: t.statusLegal, icon: <CheckCircle className="w-8 h-8" />, accent: "border-emerald-500" },
    illegible: { label: t.statusIllegible, icon: <RefreshCw className="w-8 h-8" />, accent: "border-amber-500" },
  };

  // ─── HOME ───
  const HomePage = () => {
    return (
      <div>
        {/* Hero */}
        <section className="px-6 md:px-12 pt-8 pb-28 max-w-5xl mx-auto" style={{ position: 'relative' }}>
          {/* Shield badge animation */}
          <div aria-hidden="true" style={{ position: 'absolute', top: 40, right: 40, zIndex: 0, pointerEvents: 'none' }}>
            <style>{`
              @keyframes shield-float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
              @keyframes shield-glow { 0%,100%{opacity:.4} 50%{opacity:.8} }
            `}</style>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'oklch(0.52 0.14 28 / .08)',
              border: '2px solid oklch(0.52 0.14 28 / .2)',
              animation: 'shield-float 4s ease-in-out infinite',
            }}>
              <div style={{
                width: '100%', height: '100%',
                borderRadius: '50%',
                border: '1px solid oklch(0.52 0.14 28 / .4)',
                animation: 'shield-glow 3s ease-in-out infinite',
              }} />
            </div>
          </div>
          <AmbientMesh color="oklch(0.52 0.14 28)" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-col items-center text-center space-y-10"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-terra-border rounded-full text-[10px] font-bold tracking-[0.25em] uppercase text-terra-muted bg-white/70 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Miami-Dade Housing Protection
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['en', 'es', 'ht'] as const).map(code => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    style={{
                      padding: '6px 12px', borderRadius: 999,
                      fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 600,
                      letterSpacing: '.18em', textTransform: 'uppercase',
                      background: language === code ? 'var(--accent)' : 'transparent',
                      color: language === code ? '#fafaf7' : 'var(--muted)',
                      border: `1px solid ${language === code ? 'var(--accent)' : 'var(--rule)'}`,
                      cursor: 'pointer', transition: 'all .2s',
                    }}
                  >
                    {code === 'en' ? 'EN' : code === 'es' ? 'ES' : 'HT'}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-[5rem] leading-[1.04] tracking-tight text-terra-ink max-w-3xl">
              {t.hook}
            </h1>

            <p className="text-terra-muted text-base md:text-xl font-light leading-loose max-w-lg">
              {t.hookSub}
            </p>

            <motion.button
              onClick={() => navigateTo("upload")}
              className="inline-flex items-center gap-2 px-9 py-4 bg-terra-ink text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-full"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {t.solutionCTA}
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        </section>

        {/* Stats strip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="border-y border-terra-border bg-white/60 backdrop-blur-sm"
        >
          <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-3 divide-x divide-terra-border">
            {[t.problemStat1, t.problemStat2, t.problemStat3].map((stat, i) => (
              <div key={i} className="px-6 py-10 first:pl-0 last:pr-0 space-y-2">
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-terra-muted/60">
                  {`0${i + 1}`}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-terra-ink leading-tight">
                  {stat}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Problem */}
        <section className="py-32 md:py-40 px-6 md:px-12 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85 }}
              className="space-y-7"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-terra-muted">
                The Problem
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-terra-ink leading-[1.1]">
                {t.problem}
              </h2>
              <p className="text-terra-muted text-base font-light leading-loose">
                {t.problemSub}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: 0.15 }}
              className="space-y-5 pt-4 md:pt-14"
            >
              {[t.problemStat1, t.problemStat2, t.problemStat3].map((stat, i) => (
                <div key={i} className="flex items-start gap-5 border-t border-terra-border pt-5">
                  <span className="text-[9px] font-bold font-mono text-terra-muted/50 mt-0.5 tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-terra-ink leading-relaxed">
                    {stat}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Solution (dark) */}
        <section className="bg-terra-ink text-terra-bg py-32 md:py-44 px-6 md:px-12">
          <div className="max-w-5xl mx-auto space-y-20">
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="space-y-7"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-terra-bg/40">
                Our Solution
              </p>
              <h2 className="text-4xl md:text-6xl font-serif font-light leading-[1.08] tracking-tight">
                {t.solution}
              </h2>
              <p className="text-terra-bg/50 font-light text-base leading-loose max-w-xl">
                {t.solutionSub}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <button
                onClick={() => navigateTo("upload")}
                className="inline-flex items-center gap-2 px-9 py-4 bg-white text-terra-ink text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-terra-bg/90 transition-colors duration-300"
              >
                {t.solutionCTA}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="max-w-5xl mx-auto px-6 md:px-12 py-14">
          <div className="flex items-start gap-4 border border-amber-300 bg-amber-50/60 text-amber-900 p-6 rounded-2xl">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
            <p className="text-[11px] font-mono uppercase tracking-wide leading-relaxed">
              <strong>Legal Disclaimer:</strong> Primitive Shield provides AI-powered analysis for informational purposes only. It is not a substitute for professional legal counsel. Always consult a licensed attorney for legal advice.
            </p>
          </div>
        </section>
      </div>
    );
  };

  // ─── UPLOAD ───
  const UploadPage = () => (
    <motion.div className="animate-fade-up" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      {isLoading ? (
        <motion.div
          className="flex flex-col items-center justify-center min-h-[60vh] px-6"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div className="relative mb-8">
            <div className="w-14 h-14 border border-terra-border rounded-full" />
            <div className="absolute inset-0 w-14 h-14 border border-terra-ink rounded-full border-t-transparent animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-terra-ink mb-3">
            {t.analyzingDoc}
          </h2>
          <p className="text-sm text-terra-muted font-mono tracking-widest uppercase">{t.crossRef}</p>
        </motion.div>
      ) : (
        <div className="max-w-xl mx-auto px-6 py-16">
          <button
            onClick={() => navigateTo("home")}
            className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-terra-muted hover:text-terra-ink transition-colors mb-10 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> {t.back}
          </button>

          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight text-terra-ink mb-3">
            {t.scanTitle}
          </h1>
          <p className="text-sm text-terra-muted mb-8 leading-loose font-light">{t.scanSub}</p>

          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="mb-7 inline-flex items-center gap-3 px-6 py-3 border border-terra-border bg-white/60 text-terra-ink text-[10px] font-bold uppercase tracking-[0.22em] rounded-full hover:bg-terra-ink hover:text-white hover:border-terra-ink transition-all duration-300"
          >
            <span>{showInstructions ? t.hideInstructions : t.showInstructions}</span>
            <span className="text-sm leading-none font-bold">{showInstructions ? "−" : "+"}</span>
          </button>

          {showInstructions && (
            <div className="mb-8 space-y-3 p-7 border border-terra-border bg-white/50 backdrop-blur-sm animate-fade-down rounded-2xl">
              <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-terra-muted mb-4">
                {t.tipsTitle}
              </h2>
              <div className="space-y-4">
                {[t.tipsStep1, t.tipsStep2, t.tipsStep3, t.tipsStep4, t.tipsStep5].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 text-sm text-terra-ink leading-relaxed border-b border-terra-border last:border-0 pb-3 last:pb-0"
                  >
                    <span className="font-mono text-[9px] font-bold text-terra-muted mt-0.5 tabular-nums">
                      0{i + 1}.
                    </span>
                    <p className="font-light">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <TiltCard intensity={3} style={{ display: 'block' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="file" accept="image/*,.pdf,application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {!preview ? (
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                animate={isDragging ? { scale: 1.02, borderColor: 'var(--accent)' } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="border border-dashed rounded-2xl cursor-pointer transition-colors p-16 flex flex-col items-center justify-center text-center group backdrop-blur-sm"
                style={{
                  borderColor: isDragging ? 'var(--accent)' : 'var(--rule)',
                  background: isDragging ? 'var(--accent-soft)' : 'rgba(255,255,255,.4)',
                  boxShadow: isDragging ? '0 0 0 4px var(--accent-soft)' : 'none',
                  transition: 'background .2s, box-shadow .2s',
                }}
              >
                <motion.div
                  animate={isDragging ? { y: -4, color: 'var(--accent)' } : { y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="mb-4"
                >
                  <Upload className="w-6 h-6 stroke-[1.5]" />
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1.5" style={{ color: isDragging ? 'var(--accent)' : 'var(--ink)' }}>
                  {isDragging ? "Drop file here" : t.clickDrag}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
                  {t.fileFormats}
                </span>
              </motion.div>
            ) : (
              <div className="border border-terra-border bg-white/60 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-terra-surface border border-terra-border flex-shrink-0">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-terra-ink truncate">
                      {file?.name}
                    </p>
                    <p className="text-[10px] font-mono text-terra-muted mt-1">
                      {(file ? file.size / 1024 / 1024 : 0).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetUpload}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-terra-muted hover:text-red-500 transition-colors shrink-0"
                  >
                    {t.removeBtn}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs font-mono uppercase tracking-wide text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file}
              className="w-full flex justify-center items-center py-4 px-6 text-[10px] font-bold uppercase tracking-[0.25em] text-white bg-terra-ink hover:bg-terra-ink/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 rounded-full"
            >
              {t.analyzeBtn}
            </button>
          </form>
          </TiltCard>
        </div>
      )}
    </motion.div>
  );

  // ─── INSTRUCTIONS ───
  const InstructionsPage = () => (
    <div className="max-w-xl mx-auto px-6 py-16 animate-fade-up">
      <button onClick={() => navigateTo("upload")} className="flex items-center text-xs text-terra-muted hover:text-terra-ink transition-colors mb-8 group">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> {t.backUpload}
      </button>
      <h1 className="text-3xl font-bold tracking-tight text-terra-ink mb-8">{t.tipsTitle}</h1>
      <div className="space-y-4">
        {[
          t.tipsStep1,
          t.tipsStep2,
          t.tipsStep3,
          t.tipsStep4,
          t.tipsStep5,
        ].map((step, i) => (
          <div key={i} className="flex items-start space-x-4 p-5 rounded-none bg-terra-surface/40 border border-terra-border">
            <span className="font-mono text-xs font-bold text-terra-ink shrink-0 mt-0.5">0{i + 1}.</span>
            <p className="text-sm text-terra-ink leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-start space-x-4 border border-terra-ink bg-terra-surface/20 p-6 rounded-none">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
        <p className="text-xs font-mono uppercase tracking-wide leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );

  // ─── RESULTS ───
  const ResultsPage = () => {
    if (!result) return null;
    const cfg = statusConfig[result.status] || statusConfig.illegible;

    const generatePDF = () => {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(t.pdfTitle, margin, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`${t.pdfDate}: ${new Date().toLocaleDateString()}`, margin, y);
      y += 10;
      
      doc.text(t.pdfTo, margin, y);
      y += 10;
      
      doc.text(t.pdfFrom, margin, y);
      y += 15;

      doc.setFont("helvetica", "bold");
      doc.text(t.pdfRe, margin, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      const intro = doc.splitTextToSize(t.pdfIntro, 170);
      doc.text(intro, margin, y);
      y += intro.length * 7 + 5;

      if (result.flagged_clauses && result.flagged_clauses.length > 0) {
        result.flagged_clauses.forEach((clause: any) => {
          if (y > 270) { doc.addPage(); y = margin; }
          doc.setFont("helvetica", "bold");
          doc.text(t.pdfViolation, margin, y);
          y += 7;
          doc.setFont("helvetica", "normal");
          const exp = doc.splitTextToSize(clause.explanation, 170);
          doc.text(exp, margin, y);
          y += exp.length * 7 + 5;
        });
      } else {
        const summaryText = doc.splitTextToSize(result.summary_of_violations, 170);
        doc.text(summaryText, margin, y);
        y += summaryText.length * 7 + 5;
      }

      if (y > 250) { doc.addPage(); y = margin; }
      const conclusion = doc.splitTextToSize(t.pdfClosing, 170);
      doc.text(conclusion, margin, y);
      y += conclusion.length * 7 + 15;

      doc.text(t.pdfSincerely, margin, y);
      y += 15;
      doc.text("__________________________", margin, y);
      y += 7;
      doc.text(t.pdfSignature, margin, y);

      doc.save("tenant-defense-letter.pdf");
    };

    const hasDetailedData = result.flagged_clauses && result.flagged_clauses.length > 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="animate-fade-up"
      >
        {/* Status Banner */}
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className={`border-b-2 ${cfg.accent} bg-white/60 backdrop-blur-sm`}
        >
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-terra-ink">{cfg.icon}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-terra-muted">
                  {result.status}
                </span>
              </div>
              <button
                onClick={() => navigateTo("dashboard")}
                className="text-[9px] font-bold uppercase tracking-[0.22em] text-terra-muted hover:text-terra-ink flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> {t.backHistory}
              </button>
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-light tracking-tight text-terra-ink mb-4">
              {cfg.label}
            </h1>
            <p className="text-base text-terra-muted leading-loose max-w-2xl font-light">
              {result.summary_of_violations}
            </p>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto px-6 md:px-12 py-14 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left — Flagged Clauses */}
          <div className="lg:col-span-3 space-y-8">
            {hasDetailedData ? (
              <div>
                <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-terra-muted mb-7">
                  {t.flaggedClauses}
                </h2>
                <div className="space-y-7">
                  {result.flagged_clauses.map((clause: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="border-t border-terra-border pt-7"
                    >
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 bg-terra-ink text-white text-[9px] font-bold uppercase tracking-[0.22em] rounded-full">
                          {clause.law_violated}
                        </span>
                      </div>
                      <blockquote className="text-sm italic text-terra-muted bg-terra-surface/50 border border-terra-border p-5 mb-4 rounded-xl font-serif leading-relaxed">
                        "{clause.excerpt}"
                      </blockquote>
                      <p className="text-sm text-terra-muted leading-loose font-light">{clause.explanation}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : result.status !== "legal" && result.status !== "illegible" ? (
              <div className="p-8 border border-terra-border bg-terra-surface/30 rounded-2xl">
                <p className="text-sm text-terra-muted italic font-light">{t.detailedAnalysisOnlyNew}</p>
              </div>
            ) : null}

            {result.status === "legal" && (
              <div className="border border-emerald-200 bg-emerald-50/40 p-7 rounded-2xl">
                <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-800 mb-3">
                  {t.noViolations}
                </h2>
                <p className="text-sm text-emerald-700 leading-loose font-light">{t.noViolationsSub}</p>
              </div>
            )}

            {result.status === "illegible" && (
              <div className="border border-amber-200 bg-amber-50/40 p-7 rounded-2xl">
                <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-800 mb-3">
                  {t.cantRead}
                </h2>
                <p className="text-sm text-amber-700 leading-loose font-light mb-6">{t.cantReadSub}</p>
                <button
                  onClick={() => { resetUpload(); navigateTo("upload"); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-terra-ink text-white text-[10px] font-bold uppercase tracking-[0.22em] rounded-full hover:bg-terra-ink/80 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {t.reuploadBtn}
                </button>
              </div>
            )}

            {scannedImageUrl && result.status !== "illegible" && (
              <div className="mt-10 border border-terra-border bg-white/50 backdrop-blur-sm p-8 text-center rounded-2xl">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-terra-ink mb-3">
                  {t.specificQuestions}
                </h3>
                <p className="text-sm text-terra-muted mb-7 leading-loose font-light">{t.chatSub}</p>
                <button
                  onClick={() => navigateTo("chat")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-terra-ink text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-terra-ink/80 transition-colors"
                >
                  {t.chatWithNotice}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right — Action Plan */}
          <div className="lg:col-span-2">
            <div className="bg-terra-ink text-white p-8 sticky top-20 rounded-2xl shadow-sm">
              <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-terra-bg/40 mb-6 pb-5 border-b border-white/10">
                {t.actionPlan}
              </h2>
              {result.action_plan && result.action_plan.length > 0 ? (
                <ol className="space-y-5">
                  {result.action_plan.map((step: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-mono text-[9px] font-bold text-white/40 shrink-0 mt-0.5 tabular-nums">
                        0{i + 1}.
                      </span>
                      <span className="text-sm leading-loose text-white/75 font-light">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-white/40 italic mb-6 font-light">
                  Action plan available for real-time scans.
                </p>
              )}
              <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                {result.status === "predatory" && (
                  <button
                    onClick={generatePDF}
                    className="w-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.22em] py-4 rounded-full hover:bg-red-700 transition-colors"
                  >
                    {t.defenseLetter}
                  </button>
                )}
                <button
                  onClick={() => { resetUpload(); navigateTo("upload"); }}
                  className="w-full bg-white text-terra-ink text-[10px] font-bold uppercase tracking-[0.22em] py-4 rounded-full hover:bg-terra-border transition-colors"
                >
                  {t.scanAnother}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };





  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center justify-center gap-6 animate-fade-up">
          <div className="relative">
            <div className="w-12 h-12 border border-terra-border rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border border-terra-ink rounded-full border-t-transparent animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-terra-muted">Primitive Shield</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-terra-ink/60">{t.hydratingSession}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session && view !== "home") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-28 text-center animate-fade-up">
        <div className="w-16 h-16 bg-white border border-terra-border rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-sm">
          <Shield305 className="w-8 h-8 text-terra-ink" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-terra-ink mb-4">
          {t.signInRequired}
        </h2>
        <p className="text-terra-muted mb-10 leading-loose font-light">{t.historySub}</p>
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
          className="inline-flex items-center gap-3 px-10 py-5 bg-terra-ink text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-terra-ink/80 transition-colors duration-300"
        >
          {t.signInBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-terra-ink font-sans relative">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <main>
          {view === "home" && HomePage()}
          {view === "upload" && UploadPage()}
          {view === "results" && ResultsPage()}
          {view === "dashboard" && (
            <DashboardPage
              session={session}
              navigateTo={navigateTo}
            />
          )}
          {view === "chat" && (
            <ChatPage
              scannedImageUrl={scannedImageUrl}
              scannedImageBase64={scannedImageBase64}
              chatMessages={chatMessages}
              chatInput={chatInput}
              chatLoading={chatLoading}
              setChatMessages={setChatMessages}
              setChatInput={setChatInput}
              setChatLoading={setChatLoading}
              navigateTo={navigateTo}
            />
          )}
        </main>
      </div>

      {/* Persistent Sign-in Footer */}
      {!session && (
        <footer className="fixed bottom-24 left-6 right-6 border border-terra-border bg-white/90 backdrop-blur-md py-4 px-7 flex flex-col sm:flex-row items-center justify-between z-50 rounded-2xl shadow-2xl">
          <div className="font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-terra-ink mb-4 sm:mb-0">
            {t.footerSignInMsg}
          </div>
          <button
            className="inline-flex items-center gap-3 bg-terra-ink text-white font-sans text-[10px] font-bold uppercase tracking-[0.22em] px-8 py-4 rounded-full hover:bg-terra-ink/80 transition-all duration-300"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.8"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" opacity="0.6"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" opacity="0.4"/>
            </svg>
            <span>Sign In with Google</span>
          </button>
        </footer>
      )}
    </div>
  );
}

interface ChatPageProps {
  scannedImageUrl: string | null;
  scannedImageBase64: string | null;
  chatMessages: any[];
  chatInput: string;
  chatLoading: boolean;
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  setChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigateTo: (view: ViewState) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({
  scannedImageUrl,
  scannedImageBase64,
  chatMessages,
  chatInput,
  chatLoading,
  setChatMessages,
  setChatInput,
  setChatLoading,
  navigateTo
}) => {
  const { language, t } = useLanguage();
  if (!scannedImageUrl) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-28 text-center animate-fade-up">
        <h2 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-terra-ink mb-4">
          {t.noDocFound}
        </h2>
        <p className="text-terra-muted mb-10 leading-loose font-light">{t.chatInitSub}</p>
        <button
          onClick={() => navigateTo("upload")}
          className="inline-flex items-center px-8 py-4 bg-terra-ink text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-terra-ink/80 transition-colors"
        >
          {t.scanDoc}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-4xl mx-auto px-6 py-4 flex flex-col h-[calc(100vh-280px)] min-h-[450px] relative z-10">
      <div className="flex justify-between items-center mb-5">
        <button
          onClick={() => navigateTo("results")}
          className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-terra-muted hover:text-terra-ink transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> {t.backResults}
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-terra-border rounded-3xl flex flex-col flex-1 overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]">
        {/* Chat header */}
        <div className="bg-terra-ink text-white px-6 py-4 flex justify-between items-center shrink-0 rounded-t-3xl border-b border-white/10">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-terra-bg/40">{t.noticeAssistant}</p>
            <h2 className="text-base font-serif font-light mt-0.5">{t.chatAssistant}</h2>
          </div>
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/20 shrink-0">
            <img src={scannedImageUrl} alt="Scanned Document" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-terra-surface/30 flex flex-col">
          {chatMessages.length === 0 && (
            <div className="m-auto text-center animate-fade-up">
              <div className="w-14 h-14 bg-white border border-terra-border rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Shield305 className="w-7 h-7 text-terra-muted" />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-terra-ink mb-2">{t.howCanHelp}</h3>
              <p className="text-sm text-terra-muted max-w-sm font-light">{t.chatPlaceholder}</p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-5 py-4 text-sm leading-loose font-light ${
                msg.role === 'user'
                  ? 'bg-terra-ink text-white rounded-2xl rounded-br-md'
                  : 'bg-white border border-terra-border text-terra-ink rounded-2xl rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-5 py-4 text-sm bg-white border border-terra-border text-terra-ink rounded-2xl rounded-bl-md flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-terra-muted" />
                <span className="text-terra-muted font-mono text-[9px] uppercase tracking-[0.25em]">{t.reviewingLaw}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white/80 border-t border-terra-border shrink-0 rounded-b-3xl">
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
            className="flex gap-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chatInputPlaceholder}
              className="flex-1 border border-terra-border bg-terra-surface/50 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-terra-ink focus:bg-white transition-all font-light"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="bg-terra-ink text-white px-7 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] hover:bg-terra-ink/80 disabled:opacity-40 transition-colors shrink-0"
            >
              {t.sendBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface DashboardPageProps {
  session: any;
  navigateTo: (view: ViewState) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ session, navigateTo }) => {
  const { language, t } = useLanguage();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      supabase
        .from('scans')
        .select('*')
        .eq('user_id', session.user.id)
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
      <div className="max-w-2xl mx-auto px-6 py-28 text-center animate-fade-up">
        <h2 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-terra-ink mb-4">
          {t.signInRequired}
        </h2>
        <p className="text-terra-muted mb-10 leading-loose font-light">{t.historySub}</p>
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
          className="inline-flex items-center px-8 py-4 bg-terra-ink text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-terra-ink/80 transition-colors"
        >
          {t.signInBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-5xl mx-auto px-6 py-20">
      <div className="flex items-center gap-4 mb-14">
        <LayoutDashboard className="w-6 h-6 text-terra-muted stroke-[1.5]" />
        <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight text-terra-ink">
          {t.yourScans}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <RefreshCw className="w-6 h-6 animate-spin text-terra-muted" />
        </div>
      ) : scans.length === 0 ? (
        <div className="text-center py-24 bg-white/50 border border-dashed border-terra-border rounded-3xl animate-fade-up backdrop-blur-sm">
          <p className="text-terra-muted mb-8 font-light">{t.noScansYet}</p>
          <button
            onClick={() => navigateTo("upload")}
            className="inline-flex items-center px-8 py-4 bg-terra-ink text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-terra-ink/80 transition-colors"
          >
            {t.scanDoc}
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 animate-fade-up">
          {scans.map((scan) => (
            <button
              key={scan.id}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('select-scan', { detail: scan }));
              }}
              className="bg-white/70 backdrop-blur-sm border border-terra-border rounded-2xl p-7 hover:border-terra-ink hover:shadow-sm transition-all duration-300 text-left group"
            >
              <div className="flex justify-between items-start mb-5">
                <span className={`inline-flex items-center px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full border ${
                  scan.status === "predatory"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : scan.status === "legal"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-terra-surface border-terra-border text-terra-muted"
                }`}>
                  {scan.status}
                </span>
                <span className="text-[9px] font-mono text-terra-muted tracking-wide">
                  {new Date(scan.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-terra-muted line-clamp-3 mb-5 leading-loose font-light group-hover:text-terra-ink transition-colors">
                {scan.summary}
              </p>
              <div className="flex justify-end">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-terra-muted group-hover:text-terra-ink flex items-center gap-1 transition-colors">
                  {t.viewResults} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
