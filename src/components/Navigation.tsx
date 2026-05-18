import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogOut, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage, Lang } from '../context/LanguageContext';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/';
  };

  const routes = [
    { path: '/', label: t.home },
    { path: '/scan', label: t.scan },
    { path: '/chat', label: t.chat },
    { path: '/dashboard', label: t.dashboard },
  ];

  const languages: { code: Lang; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'ht', label: 'HT' },
  ];

  return (
    <div className="w-full bg-terra-bg border-t border-terra-border py-4 px-4 flex justify-center items-center h-[88px] relative">
      <motion.nav 
        layout
        className="flex items-center p-2 bg-terra-ink backdrop-blur-md rounded-[3rem] shadow-2xl overflow-hidden min-h-[64px]"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-12 h-12 rounded-full text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {isOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
        </button>
        
        <AnimatePresence mode="popLayout">
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center whitespace-nowrap overflow-hidden"
            >
              <div className="flex pr-2 pl-2 gap-2">
                {routes.map((route) => {
                  const isActive = location.pathname === route.path;
                  return (
                    <Link
                      key={route.path}
                      to={route.path}
                      className={`px-5 md:px-6 py-3 rounded-[2.5rem] transition-all duration-500 text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] ${
                        isActive 
                          ? 'bg-white text-terra-ink shadow-sm' 
                          : 'text-terra-bg/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {route.label}
                    </Link>
                  );
                })}

                {/* Language Switcher */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-2 px-5 md:px-6 py-3 rounded-[2.5rem] text-terra-bg/60 hover:text-white hover:bg-white/10 transition-all duration-500 text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em]"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {language.toUpperCase()}
                  </button>
                  
                  <AnimatePresence>
                    {isLangOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-terra-ink border border-white/10 rounded-2xl shadow-2xl p-1 flex flex-col min-w-[100px]"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsLangOpen(false);
                            }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-colors ${
                              language === lang.code 
                                ? 'bg-white text-terra-ink' 
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {session && (
                  <button
                    onClick={handleLogout}
                    className="px-5 md:px-6 py-3 rounded-[2.5rem] transition-all duration-500 text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] text-red-400 hover:text-red-300 hover:bg-white/10 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.logout}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
