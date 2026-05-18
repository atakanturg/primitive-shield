import { Problem } from '../components/Problem';
import { Architecture } from '../components/Architecture';
import { motion } from 'motion/react';

export function Ontology() {
  return (
    <div className="pt-8">
      <section className="px-4 text-center pb-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="max-w-2xl mx-auto text-terra-muted text-lg font-medium leading-relaxed">
              Levying Artificial Intelligence and predictive modeling to do equity research. We track trades made by politicians. We have data scrapers extracting intelligence from FDA filings, port logs, research papers, and earnings calls. All organized and structured, processed, and published in our product.
            </p>
          </motion.div>
        </div>
      </section>
      <Problem />
      <Architecture />
      <section className="max-w-4xl mx-auto my-32 p-16 bg-terra-ink text-terra-bg text-center space-y-10">
        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide">Secure the Data.</h2>
        <p className="max-w-md mx-auto text-terra-bg/80 font-light text-sm leading-loose">
          The newest data structured into English. Access Primitive Ontology.
        </p>
        <a href="https://ontology.primitive-os.cc" target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-white text-terra-ink font-medium uppercase tracking-[0.2em] text-[10px] hover:bg-terra-border hover:bg-zinc-200 transition-all duration-500">
          Go to Ontology solution
        </a>
      </section>
    </div>
  );
}
