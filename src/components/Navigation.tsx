import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Globe, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage, Lang } from '../context/LanguageContext';

const ACCENT = 'var(--accent)';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/';
  };

  const routes = [
    { path: '/',          label: t.home },
    { path: '/scan',      label: t.scan },
    { path: '/chat',      label: t.chat },
    { path: '/dashboard', label: t.dashboard },
  ];

  const languages: { code: Lang; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'ht', label: 'HT' },
  ];

  const pill: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: 8,
    background: 'rgba(250,250,247,.82)',
    backdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(10,10,10,.08)',
    borderRadius: 'var(--r-pill)',
    boxShadow: '0 12px 40px rgba(10,10,10,.04), 0 1px 0 rgba(255,255,255,.5) inset',
    pointerEvents: 'auto',
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
      <div style={pill}>

        {/* Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', color: 'var(--ink)', border: 'none', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(10,10,10,.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Nav items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: 4, paddingRight: 4, alignItems: 'center' }}>
                {routes.map(route => {
                  const isActive = location.pathname === route.path;
                  return (
                    <Link
                      key={route.path}
                      to={route.path}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '11px 18px',
                        background: isActive ? ACCENT : 'transparent',
                        color: isActive ? 'var(--paper)' : 'var(--muted)',
                        border: 'none', textDecoration: 'none', borderRadius: 'var(--r-pill)',
                        fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500,
                        letterSpacing: '.16em', textTransform: 'uppercase',
                        transition: 'background .2s, color .2s', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(10,10,10,.05)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; } }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--paper)' : ACCENT, opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
                      {route.label}
                    </Link>
                  );
                })}

                {/* Language switcher */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 18px', background: 'transparent', color: 'var(--muted)',
                      border: 'none', borderRadius: 'var(--r-pill)',
                      fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500,
                      letterSpacing: '.16em', textTransform: 'uppercase',
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .2s, color .2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,10,10,.05)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
                  >
                    <Globe size={12} />
                    {language.toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {isLangOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        style={{
                          position: 'absolute', bottom: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
                          background: 'rgba(250,250,247,.95)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(10,10,10,.08)',
                          borderRadius: 16,
                          boxShadow: '0 12px 40px rgba(10,10,10,.08)',
                          padding: 6,
                          display: 'flex', flexDirection: 'column', gap: 2, minWidth: 80,
                          zIndex: 10,
                        }}
                      >
                        {languages.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                            style={{
                              padding: '8px 16px',
                              background: language === lang.code ? ACCENT : 'transparent',
                              color: language === lang.code ? 'var(--paper)' : 'var(--muted)',
                              border: 'none', borderRadius: 10,
                              fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500,
                              letterSpacing: '.18em', textTransform: 'uppercase',
                              cursor: 'pointer', transition: 'background .2s, color .2s',
                            }}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Logout */}
                {session && (
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 18px', background: 'transparent',
                      color: 'oklch(0.55 0.18 25)',
                      border: 'none', borderRadius: 'var(--r-pill)',
                      fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500,
                      letterSpacing: '.16em', textTransform: 'uppercase',
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(10,10,10,.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={12} />
                    {t.logout}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
