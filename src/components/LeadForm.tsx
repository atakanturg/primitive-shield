import { motion } from 'motion/react';
import { Mail, Building2, UserCircle2, Send } from 'lucide-react';
import { useState } from 'react';

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="lead-form" className="py-32 px-4">
        <div className="max-w-3xl mx-auto p-16 bg-white border border-terra-border text-center space-y-8">
          <div className="w-16 h-16 bg-terra-ink text-white mx-auto flex items-center justify-center">
            <Send className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h2 className="text-4xl font-serif font-light text-terra-ink tracking-wide">Transmission Received.</h2>
          <p className="text-terra-muted font-light text-sm leading-loose">An authentication specialist will review your request and contact you within 12 hours.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="py-32 px-4">
      <div className="max-w-4xl mx-auto bg-white border border-terra-border flex flex-col md:flex-row shadow-2xl">
        <div className="md:w-1/3 bg-terra-ink p-12 text-white space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-light uppercase tracking-wide leading-tight">Access <br />The Core.</h2>
            <p className="text-white/60 text-sm font-light leading-loose">Join the elite cohort of quant researchers using sanitized alternatives.</p>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-40">
            PRIMITIVE OS // V1.0
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="md:w-2/3 p-12 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-terra-muted ml-1">Full Name</label>
            <div className="relative">
              <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-terra-muted stroke-[1.5]" />
              <input 
                required
                type="text" 
                placeholder="Researcher Name"
                className="w-full pl-12 pr-4 py-4 bg-terra-surface border border-transparent focus:bg-white focus:border-terra-border focus:outline-none transition-all text-sm font-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-terra-muted ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-terra-muted stroke-[1.5]" />
              <input 
                required
                type="email" 
                placeholder="name@fund.com"
                className="w-full pl-12 pr-4 py-4 bg-terra-surface border border-transparent focus:bg-white focus:border-terra-border focus:outline-none transition-all text-sm font-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-terra-muted ml-1">Firm / Research Lab</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-terra-muted stroke-[1.5]" />
              <input 
                required
                type="text" 
                placeholder="Institutional Entity"
                className="w-full pl-12 pr-4 py-4 bg-terra-surface border border-transparent focus:bg-white focus:border-terra-border focus:outline-none transition-all text-sm font-light"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-terra-ink text-terra-bg font-medium uppercase tracking-[0.2em] text-[10px] hover:bg-terra-border hover:text-terra-ink transition-all duration-500"
          >
            Submit Access Request
          </button>
        </form>
      </div>
    </section>
  );
}
