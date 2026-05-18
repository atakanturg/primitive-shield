import { motion } from 'motion/react';

const PAIN_POINTS = [
  {
    title: "Fragile Pipelines",
    description: "Standard web scrapers constantly break. We handle the backend behind the scenes. Our scrapers are fully private. Security and stability are our top priorities."
  },
  {
    title: "Unstructured Output",
    description: "Raw HTML is useless for models. We convert messy web pages into perfectly structured, predictable JSON format."
  },
  {
    title: "Scaling Limits",
    description: "Scraping at scale requires managing proxies, retries, and captchas. We manage the infrastructure so you can focus on research."
  }
];

export function Problem() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {PAIN_POINTS.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-12 bg-transparent border-t border-terra-border space-y-6 hover:bg-terra-surface/50 transition-all duration-700"
            >
              <h3 className="text-xl font-serif font-semibold text-terra-ink tracking-wide">{point.title}</h3>
              <p className="text-terra-muted font-light text-sm leading-loose">{point.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
