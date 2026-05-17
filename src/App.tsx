import React, { useState, useRef } from "react";
import { Upload, AlertTriangle, Menu, MapPin, X, ArrowRight } from "lucide-react";

type ViewState = 'home' | 'upload' | 'results' | 'instructions';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const navigateTo = (newView: ViewState) => {
    setView(newView);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch("/api/analyze-notice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Failed to analyze document";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResult(data);
      navigateTo('results');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const NavBar = () => (
    <nav className="border-b border-black flex items-stretch h-16 sm:h-20 bg-[#FDFCF8] text-black shrink-0 relative z-50 w-full transition-colors duration-300">
      <div 
        className="flex-shrink-0 flex items-center px-4 sm:px-8 border-r border-black font-semibold text-xl sm:text-3xl tracking-tighter cursor-pointer hover:bg-[#F2F1EC] transition-colors"
        onClick={() => navigateTo('home')}
      >
        Primitive Shield
      </div>
      <div className="hidden md:flex flex-grow items-center px-4 sm:px-8 text-sm sm:text-lg font-medium">
        Technology for Housing Justice
      </div>
      <div className="ml-auto flex border-l border-black">
         <button 
            className="flex items-center px-4 sm:px-8 border-l border-black hover:bg-[#FF107A] hover:text-white transition-colors group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
         >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 mr-0 sm:mr-3 group-hover:scale-95 transition-transform" />
            <span className="hidden sm:inline font-mono text-xs tracking-widest uppercase mt-0.5">Menu</span>
         </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1D1D1D] font-sans selection:bg-[#FF107A] selection:text-white flex flex-col relative w-full">
      <NavBar />
      
      {isMenuOpen && (
        <div className="absolute top-16 sm:top-20 right-0 z-50 bg-[#1E1B4B] text-white flex flex-col items-start p-6 shadow-[4px_4px_0_0_#00DFE6] border border-black border-r-0 border-t-0 animate-in fade-in duration-200">
          <div className="flex flex-col space-y-4 text-xl font-medium tracking-tight">
            <button onClick={() => navigateTo('home')} className={`hover:text-[#00DFE6] transition-colors text-left ${view === 'home' ? 'text-[#FF107A]' : 'text-white'}`}>Home</button>
            <button onClick={() => navigateTo('upload')} className={`hover:text-[#00DFE6] transition-colors text-left ${view === 'upload' ? 'text-[#FF107A]' : 'text-white'}`}>Scan Notice</button>
            {result && <button onClick={() => navigateTo('results')} className={`hover:text-[#00DFE6] transition-colors text-left ${view === 'results' ? 'text-[#FF107A]' : 'text-white'}`}>Results</button>}
          </div>
        </div>
      )}

      <main className="flex-grow flex flex-col pb-24 sm:pb-28">
        {view === 'home' && (
          <div className="flex flex-col flex-grow animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="relative min-h-[calc(100vh-5rem)] w-full flex flex-col items-center border-b border-black overflow-hidden justify-center px-6 sm:px-12 text-center pt-24 sm:pt-32">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1503891450247-ee5f8ec46dc3?q=80&w=2000&auto=format&fit=crop" 
                  alt="Miami Context" 
                  className="w-full h-full object-cover mix-blend-luminosity brightness-50" 
                />
              </div>
              
              {/* Content Overlay */}
              <div className="relative z-10 w-full max-w-6xl flex flex-col items-center mt-[-10vh]">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-[1.1]">
                  <span className="text-[#FDFCF8] block mb-2 sm:mb-4">Predatory notices unjustly force people out.</span>
                  <span className="text-[#00DFE6] block">Make sure you're not one of them.</span>
                </h1>
                
                <div className="mt-16 sm:mt-32 pb-8 flex flex-col items-center justify-center">
                  <div className="font-mono text-xs tracking-widest uppercase text-white mb-4 opacity-70">Scroll Down</div>
                  <div className="animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#1E1B4B] text-[#FDFCF8] px-6 sm:px-12 py-16 sm:py-28 flex flex-col items-center">
              <h2 className="text-5xl sm:text-7xl font-medium tracking-tight mb-12 sm:mb-20 text-[#00DFE6]">We can help</h2>
              <div className="max-w-md w-full border border-black bg-black">
                 <div className="bg-[#FFF59D] text-[#1D1D1D] border border-black p-8 sm:p-10 flex flex-col items-center text-center min-h-[400px] hover:scale-105 transition-transform duration-300">
                    <div className="font-mono text-xs tracking-widest uppercase mb-6 opacity-60">Notice Scanner</div>
                    <h3 className="text-3xl sm:text-4xl font-medium leading-[1.1] mb-6 tracking-tight">Evaluate a notice from your landlord</h3>
                    <p className="text-lg leading-relaxed mb-10 flex-grow opacity-90">
                      Upload a photo of your notice or buyout offer. We'll cross-reference it with Miami-Dade rental laws to check for illegal demands.
                    </p>
                    <div className="justify-center text-xs font-mono uppercase tracking-widest text-[#1D1D1D] opacity-60 mb-8 flex items-center space-x-3">
                      <MapPin className="w-4 h-4" />
                      <span>Miami-Dade</span>
                    </div>
                    <button 
                      onClick={() => navigateTo('upload')} 
                      className="bg-[#FF107A] text-white rounded-full px-8 py-5 text-sm font-mono uppercase tracking-widest hover:bg-[#1E1B4B] transition-colors w-full sm:w-auto flex items-center justify-center group cursor-pointer border border-black"
                    >
                      <span>Start My Scan</span>
                      <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
            </section>
          </div>
        )}

        {view === 'upload' && (
        <div className="flex flex-col flex-grow bg-[#FDFCF8] items-center animate-in fade-in duration-300">
           {isLoading ? (
             <div className="flex-grow flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
               <div className="relative mb-8">
                 <div className="w-24 h-24 border-4 border-dashed border-[#1D1D1D] rounded-full animate-[spin_4s_linear_infinite]"></div>
                 <div className="absolute inset-0 border-4 border-solid border-[#FF107A] rounded-full border-t-transparent animate-spin"></div>
               </div>
               <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4 text-[#1D1D1D]">Analyzing Document</h2>
               <p className="font-mono text-sm tracking-widest uppercase text-neutral-500">Cross-referencing Miami-Dade Municipal Codes...</p>
             </div>
           ) : (
             <>
               <div className="border-b border-black py-12 px-6 sm:px-12 bg-[#00DFE6] text-[#1E1B4B] w-full flex flex-col items-center text-center">
                  <div className="max-w-3xl">
                     <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4 text-[#1E1B4B]">Scan your notice</h1>
                     <p className="text-xl opacity-90 leading-snug">
                       Take a clear photo of the letter or notice you received. We'll extract the text and check it against current laws.
                       <button onClick={() => navigateTo('instructions')} className="ml-2 underline text-[#FF107A] hover:text-[#1D1D1D]">See instructions</button>
                     </p>
                  </div>
               </div>
               <div className="p-6 sm:p-12 max-w-2xl w-full flex flex-col items-center">
                   <form onSubmit={handleSubmit} className="space-y-8 w-full">
                     <div>
                       <div className="flex justify-between items-end mb-4">
                         <label className="block text-2xl font-medium text-[#1E1B4B]">Upload Document</label>
                         {file && (
                           <button type="button" onClick={resetUpload} className="text-sm font-mono tracking-widest uppercase text-neutral-500 hover:text-[#FF107A]">
                             Clear Selection
                           </button>
                         )}
                       </div>

                       <input
                         type="file"
                         accept="image/*,.pdf"
                         ref={fileInputRef}
                         onChange={handleFileChange}
                         className="hidden"
                       />

                       {!preview ? (
                         <div
                           onClick={handleUploadClick}
                           className="border-[3px] border-dashed border-[#1E1B4B] bg-[#FFF59D] hover:bg-[#FFF59D]/80 cursor-pointer transition-colors p-12 sm:p-20 flex flex-col items-center justify-center text-center group"
                         >
                           <div className="bg-[#1E1B4B] text-white p-4 rounded-full mb-6 group-hover:scale-110 group-hover:bg-[#FF107A] transition-all">
                             <Upload className="w-8 h-8" />
                           </div>
                           <span className="text-2xl font-medium mb-3 text-[#1E1B4B] group-hover:text-[#FF107A] transition-colors">Select file or take photo</span>
                           <span className="text-[#1E1B4B]/60 font-mono text-sm uppercase tracking-widest">JPG, PNG, or PDF</span>
                         </div>
                       ) : (
                         <div className="border border-black overflow-hidden flex flex-col sm:flex-row bg-[#FFF59D]">
                           <div className="bg-white flex items-center justify-center sm:w-1/3 aspect-square sm:aspect-auto sm:min-h-[250px] relative border-b sm:border-b-0 sm:border-r border-black p-4">
                             <img
                               src={preview}
                               alt="Document preview"
                               className="max-h-full max-w-full object-contain shadow-sm border border-neutral-200"
                             />
                           </div>
                           <div className="p-8 sm:w-2/3 flex flex-col justify-center">
                             <p className="text-2xl font-medium text-[#1E1B4B] mb-2 truncate" title={file?.name}>
                               {file?.name}
                             </p>
                             <p className="text-lg text-[#1E1B4B]/60 font-mono uppercase">
                               {file ? (file.size / 1024 / 1024).toFixed(2) : "0"} MB
                             </p>
                             <div className="mt-8 flex">
                               <button
                                 type="button"
                                 onClick={handleUploadClick}
                                 className="border border-[#1E1B4B] rounded-full px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-[#FF107A] hover:text-white hover:border-[#FF107A] transition-colors mr-3 text-[#1E1B4B]"
                               >
                                 Replace File
                               </button>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>

                     {error && (
                       <div className="bg-[#1E1B4B] text-white p-5 border-l-4 border-[#FF107A] text-lg shadow-[4px_4px_0_0_#FF107A]">
                         {error}
                       </div>
                     )}

                     <div className="pt-6">
                       <button
                         type="submit"
                         disabled={!file}
                         className="w-full flex justify-center items-center py-6 px-4 text-lg font-mono uppercase tracking-widest text-white bg-[#1E1B4B] hover:bg-[#FF107A] disabled:opacity-50 disabled:hover:bg-[#1E1B4B] disabled:cursor-not-allowed transition-colors border border-black shadow-[4px_4px_0_0_#FFF59D]"
                       >
                         Scan Notice Now
                       </button>
                     </div>
                   </form>
               </div>
             </>
           )}
        </div>
      )}

      {view === 'instructions' && (
        <div className="flex flex-col flex-grow bg-[#FDFCF8] items-center p-6 sm:p-12 animate-in fade-in duration-300">
           <div className="max-w-2xl w-full">
             <button onClick={() => navigateTo('upload')} className="mb-8 font-mono text-xs tracking-widest uppercase hover:text-[#FF107A] transition-colors flex items-center">
               <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Upload
             </button>
             <h1 className="text-4xl font-medium mb-8 text-[#1E1B4B]">How to scan your notice</h1>
             <div className="space-y-6 text-lg text-[#1D1D1D] opacity-90">
               <p><strong className="text-[#FF107A]">Step 1:</strong> Find the legal document or notice you received.</p>
               <p><strong className="text-[#FF107A]">Step 2:</strong> Ensure you are in a well-lit area.</p>
               <p><strong className="text-[#FF107A]">Step 3:</strong> Flatten the document to avoid shadows or glare.</p>
               <p><strong className="text-[#FF107A]">Step 4:</strong> Take a clear photo, making sure all text is legible.</p>
               <p><strong className="text-[#FF107A]">Step 5:</strong> Upload the photo (JPG, PNG) or a PDF version directly here.</p>
             </div>
             <div className="mt-12 bg-[#FF107A]/10 border border-[#FF107A]/30 p-5 rounded-none flex items-start shadow-[4px_4px_0_0_#FF107A]">
               <AlertTriangle className="min-w-6 mr-4 text-[#FF107A] mt-0.5"/>
               <span className="text-[#1E1B4B] leading-relaxed text-base">
                 <strong className="font-medium mr-2 text-[#FF107A]">Important Legal Disclaimer:</strong> Primitive Shield is not a substitute for professional legal counsel.
               </span>
             </div>
           </div>
        </div>
      )}

      {view === 'results' && result && (
        <div className="flex flex-col flex-grow bg-[#FDFCF8] animate-in slide-in-from-bottom-8 duration-500">
           {/* Dynamic Banner based on result */}
           <div className={`border-b border-black py-16 px-6 sm:px-12 ${
               result.status === 'predatory' ? 'bg-[#FF107A] text-white' : 
               result.status === 'legal' ? 'bg-[#00DFE6] text-[#1E1B4B]' : 
               'bg-[#FFF59D] text-[#1E1B4B]'
           }`}>
              <div className="max-w-6xl">
                 <div className="font-mono text-sm tracking-widest uppercase mb-6 flex justify-between items-center w-full opacity-80">
                    <span>Scan Results: {result.status}</span>
                    <button onClick={() => navigateTo('home')} className="border border-current px-4 py-2 rounded-full hover:bg-black hover:text-white transition-colors bg-transparent border-opacity-30">
                      Back to Home
                    </button>
                 </div>
                 <h1 className="text-5xl sm:text-8xl font-medium tracking-tight leading-[0.95] mb-6">
                   {result.status === 'predatory' ? "Predatory Activity Detected" : 
                    result.status === 'legal' ? "No Immediate Violations Found" :
                    "Document Unclear"}
                 </h1>
                 <p className="text-2xl sm:text-3xl max-w-3xl font-medium mt-8 leading-snug border-l-4 border-current pl-6 opacity-90">
                    {result.summary_of_violations}
                 </p>
              </div>
           </div>

           <div className="p-6 sm:p-12 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
              <div className="lg:col-span-2 space-y-12">
                {result.flagged_clauses && result.flagged_clauses.length > 0 && (
                   <div>
                      <h2 className="text-4xl font-medium border-b-2 border-black pb-4 mb-8">Flagged Clauses</h2>
                      <div className="space-y-8">
                        {result.flagged_clauses.map((clause: any, index: number) => (
                           <div key={index} className="border border-black p-6 sm:p-8 bg-white relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-2 h-full bg-[#1D1D1D]"></div>
                              <div className="bg-neutral-100 p-6 font-serif text-xl sm:text-2xl italic leading-relaxed mb-6 border border-neutral-300">
                                "{clause.excerpt}"
                              </div>
                              <div className="items-center mb-4">
                                <span className="inline-block bg-[#1D1D1D] text-white font-mono text-xs uppercase tracking-widest px-3 py-1.5 mb-2">
                                  Violates: {clause.law_violated}
                                </span>
                              </div>
                              <p className="text-xl leading-relaxed">{clause.explanation}</p>
                           </div>
                        ))}
                      </div>
                   </div>
                )}

                {/* If legal, give positive text */}
                {result.status === 'legal' && (
                  <div>
                    <h2 className="text-4xl font-medium border-b-2 border-black pb-4 mb-8">Legal Standing</h2>
                    <p className="text-xl leading-relaxed bg-white border border-black p-8 shadow-[8px_8px_0_0_#00DFE6]">
                      Based on our analysis of the uploaded document against Miami-Dade ordinances, this notice does not immediately display overt predatory markers or explicit violations of the evaluated statutes. However, terms can be legally complex. If you feel threatened or unsure, always consult a professional. 
                    </p>
                  </div>
                )}
                
                {/* If illegible */}
                {result.status === 'illegible' && (
                  <div>
                    <h2 className="text-4xl font-medium border-b-2 border-black pb-4 mb-8">Next Steps</h2>
                    <p className="text-xl leading-relaxed bg-white border border-black p-8 shadow-[8px_8px_0_0_#FFF59D]">
                      We couldn't clearly read the document or it didn't seem to relate to housing notices. Please try uploading a clearer image or a digital PDF version of the document for accurate evaluation.
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                 <div className="bg-[#1E1B4B] text-[#FDFCF8] border border-black p-8 sm:p-10 sticky top-8">
                   <h2 className="text-3xl font-medium mb-10 pb-4 border-b border-white/20 text-[#00DFE6]">Action Plan</h2>
                   <ul className="space-y-8">
                     {(result.action_plan || []).map((step: string, i: number) => (
                        <li key={i} className="flex items-start">
                           <span className="font-mono text-sm bg-[#FF107A] text-white px-2.5 py-1 rounded-sm mr-4 mt-1 font-bold">{i+1}</span>
                           <span className="text-lg leading-snug text-white/90">{step}</span>
                        </li>
                     ))}
                   </ul>
                   {result.status === 'predatory' && (
                     <div className="mt-12 pt-8 border-t border-white/20">
                        <button className="w-full bg-[#00DFE6] text-[#1E1B4B] border border-transparent rounded-full px-6 py-4 uppercase text-xs font-mono tracking-widest hover:bg-[#FF107A] hover:text-white transition-colors focus:ring-4 focus:ring-[#00DFE6]/20 shadow-lg font-bold">
                          Draft PDF Defense
                        </button>
                        <p className="font-mono py-4 text-xs tracking-widest text-[#00DFE6]/50 uppercase text-center w-full">Coming Soon</p>
                     </div>
                   )}
                   {result.status === 'illegible' && (
                     <div className="mt-12 pt-8 border-t border-white/20">
                        <button onClick={() => navigateTo('upload')} className="w-full bg-white text-[#1E1B4B] border border-transparent rounded-full px-6 py-4 uppercase text-xs font-mono tracking-widest hover:bg-neutral-200 transition-colors shadow-lg font-bold">
                          Re-Upload
                        </button>
                     </div>
                   )}
                 </div>
              </div>
           </div>
        </div>
      )}
      </main>

      {/* Persistent Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-black bg-[#1E1B4B] text-[#FDFCF8] py-2 sm:py-3 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between z-50">
        <div className="font-medium text-sm sm:text-base mb-2 sm:mb-0 text-[#00DFE6]">
          Do you want to save your progress?
        </div>
        <button 
          className="bg-white text-[#1E1B4B] font-medium px-4 py-2 hover:bg-[#FFF59D] transition-colors flex items-center space-x-2 cursor-pointer shadow-[2px_2px_0_0_#FF107A] border border-black text-sm"
          onClick={() => {
            // Mock sign in - this would integrate with Firebase Auth
            alert("Redirecting to Google Sign-In...");
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          <span className="uppercase font-mono text-xs tracking-widest font-bold">Sign In with Google</span>
        </button>
      </footer>
    </div>
  );
}
