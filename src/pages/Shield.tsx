import { motion } from 'motion/react';
import { Shield as ShieldIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: "Rapid Response",
    description: "Engineered to combat predatory evictions and mitigate displacement of vulnerable residents in real-time."
  },
  {
    title: "AI-Driven Mitigation",
    description: "Leverages deterministic prompt engineering to digest complex legal jargon and generate clear mitigation strategies."
  },
  {
    title: "Community Impact",
    description: "Awarded 1st Place at the YCI Hackathon 2026 for its innovative approach to tenant-rights education."
  }
];

export function Shield() {
  return (
    <div className="pt-8 pb-32 px-4">
      <section className="text-center pb-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-10">
          <motion.div
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-terra-ink mb-6">Primitive Shield</h1>
            <p className="max-w-2xl mx-auto text-terra-muted text-lg font-medium leading-relaxed">
              A civic-tech platform designed to protect tenants from predatory gentrification and legal exploitation through context-aware AI guidance.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.15 }}
            className="p-12 bg-white border border-terra-border space-y-8 hover:shadow-2xl transition-all duration-500"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-semibold text-terra-ink tracking-wide">{feature.title}</h3>
              <p className="text-terra-muted font-light text-sm leading-loose">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </section>
      
      <section className="max-w-4xl mx-auto mt-32 p-16 bg-terra-ink text-terra-bg text-center space-y-10">
        <ShieldIcon strokeWidth={1} className="w-12 h-12 mx-auto text-white" />
        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide">Protect Your Rights.</h2>
        <p className="max-w-md mx-auto text-terra-bg/80 font-light text-sm leading-loose">
          Facing a complex legal threat? Access Primitive Shield to generate your structured mitigation strategy.
        </p>
        <Link to="/app" className="px-10 py-5 bg-white text-terra-ink font-medium uppercase tracking-[0.2em] text-[10px] hover:bg-terra-border hover:bg-zinc-200 transition-all duration-500">
          Go to Shield solution
        </Link>
      </section>
    </div>
  );
}
