import { motion } from 'motion/react';
import { Slack } from 'lucide-react';

const FEATURES = [
  {
    title: "Automated Bot",
    description: "Our bot integrates directly into your workspace to handle the complete onboarding lifecycle."
  },
  {
    title: "Slack Integration",
    description: "Seamless deployment within Slack. Communicates natively with new hires."
  },
  {
    title: "Fast Setup",
    description: "Cuts onboarding time by 80%. Automates access provisioning and orientation."
  }
];

export function Onboarding() {
  return (
    <div className="pt-8 pb-32 px-4">
      <section className="text-center pb-8">
        <div className="max-w-4xl mx-auto mb-8 py-2 px-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-full inline-block">
          Currently offline due to program expansion and backend overhaul.
        </div>
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-10">
          <motion.div
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="max-w-2xl mx-auto text-terra-muted text-lg font-medium leading-relaxed">
              Automating the integration of new hires into pre-existing Slack ecosystems through an intelligent autonomous bot.
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
        <Slack strokeWidth={1} className="w-12 h-12 mx-auto text-white" />
        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide">Deploy the Bot.</h2>
        <p className="max-w-md mx-auto text-terra-bg/80 font-light text-sm leading-loose">
          Ready to eliminate onboarding friction? Integrate Primitive Onboarding into your workspace.
        </p>
        <button disabled className="px-10 py-5 bg-zinc-600 text-terra-bg/50 font-medium uppercase tracking-[0.2em] text-[10px] cursor-not-allowed transition-all duration-500">
          Currently Unavailable
        </button>
      </section>
    </div>
  );
}
