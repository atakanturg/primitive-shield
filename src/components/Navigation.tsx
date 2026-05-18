import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const routes = [
    { path: '/', label: 'Shield Home' },
    { path: '/app', label: 'Launch Shield' },
    { path: '/ontology', label: 'Ontology' },
    { path: '/onboarding', label: 'Onboarding' },
  ];

  return (
    <div className="w-full bg-terra-bg border-t border-terra-border py-4 px-4 flex justify-center items-center h-[88px]">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
