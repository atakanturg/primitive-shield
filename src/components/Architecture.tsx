import { motion } from 'motion/react';

const STEPS = [
  {
    title: "Proxy Network",
    description: "Undetectable residential proxy chains to avoid datacenter IP blacklisting. Absolute stealth ingestion.",
    tag: "NETWORK"
  },
  {
    title: "Data Extraction",
    description: "Dual-model consensus architecture. Every field is verified by two independent neural clusters before encoding.",
    tag: "EXTRACTION"
  },
  {
    title: "Validation",
    description: "Cryptographic provenance hashes on every signal. Pristine inputs for downstream models.",
    tag: "VALIDATION"
  }
];

export function Architecture() {
  return (
    <section className="py-32 px-4 bg-terra-ink text-terra-bg border border-terra-ink/10 mb-24 overflow-hidden relative">
      <div className="max-w-6xl mx-auto space-y-24">
        <div className="flex flex-col items-center text-center gap-12">
          <div className="space-y-6">
            <h2 className="text-6xl md:text-8xl font-serif font-light leading-none tracking-tight">
              Data <br />
              <span className="text-terra-bg/40 not-italic font-sans font-light uppercase tracking-[0.2em] text-3xl md:text-5xl block mt-4">Ingestion.</span>
            </h2>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="group p-12 border-t border-terra-bg/10 space-y-8 hover:bg-white/[0.02] transition-all duration-500"
            >
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-medium tracking-[0.2em] text-terra-bg/60 uppercase">
                  {step.tag}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-semibold tracking-wide">{step.title}</h3>
                <p className="text-terra-bg/50 text-sm font-light leading-loose">{step.description}</p>
              </div>
              
              <div className="pt-4 flex items-center gap-2">
                <span className="text-4xl font-serif font-light text-white/20">0{index + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
