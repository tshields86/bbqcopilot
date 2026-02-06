import { Flame, Clock, BarChart3, History, Thermometer, Users } from 'lucide-react';

const features = [
  {
    icon: Flame,
    title: 'Equipment-Specific Recipes',
    description:
      "Recipes tailored to your exact grill—whether it's a Kamado Joe, Weber Genesis, pellet smoker, or offset. No more adapting generic instructions.",
  },
  {
    icon: Clock,
    title: 'AI-Powered Cook Timelines',
    description:
      'Get a step-by-step timeline that tells you exactly what to do and when. Know your wake-up time for that brisket.',
  },
  {
    icon: BarChart3,
    title: 'Skill Level Adaptation',
    description:
      'Beginner or seasoned pitmaster? Recipes adapt to your experience with appropriate techniques and guidance.',
  },
  {
    icon: History,
    title: 'Cook History Tracking',
    description:
      'Log your cooks, add notes, and track what worked. Build your personal BBQ knowledge base over time.',
  },
  {
    icon: Thermometer,
    title: 'Temperature Guidance',
    description:
      'Precise temp targets for your specific grill type. Kamado holds heat differently than an offset—we know the difference.',
  },
  {
    icon: Users,
    title: 'Party-Size Scaling',
    description:
      "Cooking for 4 or 40? Tell us how many mouths to feed and we'll scale everything—meat, time, and portions.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-char-800 via-char-900 to-char-800" />

      <div className="relative max-container section-padding">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-ash-white mb-4">
            Built for Real Pitmasters
          </h2>
          <p className="text-xl text-char-400 max-w-2xl mx-auto">
            Everything you need to plan, execute, and perfect your cooks
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group glass-card p-6 hover:border-ember-500/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-char-700 group-hover:bg-gradient-to-br group-hover:from-ember-500 group-hover:to-copper flex items-center justify-center mb-4 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-ember-500 group-hover:text-white transition-colors" />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-semibold text-ash-white mb-2">
                {feature.title}
              </h3>
              <p className="text-char-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
