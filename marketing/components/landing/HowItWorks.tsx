import { Flame, MessageSquare, ClipboardList } from 'lucide-react';

const steps = [
  {
    icon: Flame,
    number: '01',
    title: 'Add Your Equipment',
    description:
      'Kamado Joe? Weber? Pellet smoker? Offset? Tell us what you\'re cooking with, including accessories like rotisseries and pizza stones.',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'Tell Us What to Cook',
    description:
      'Just say what you want: "Brisket for 8 people, ready by 6pm" or "Quick weeknight ribs." We\'ll ask the right questions.',
  },
  {
    icon: ClipboardList,
    number: '03',
    title: 'Get Your Personalized Plan',
    description:
      'Receive a complete cook timeline with temperatures, times, and techniques—all optimized for your specific setup.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-char-900">
      <div className="max-container section-padding">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-ash-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-char-400 max-w-2xl mx-auto">
            From grill to plate in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-char-600 to-transparent" />
              )}

              <div className="glass-card p-8 h-full hover:border-ember-500/30 transition-colors">
                {/* Icon and number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ember-500 to-copper flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-mono text-3xl font-bold text-char-600">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-ash-white mb-3">
                  {step.title}
                </h3>
                <p className="text-char-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
