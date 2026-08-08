import React from 'react';
import { 
  Monitor, 
  Zap, 
  Smartphone, 
  Server, 
  Check, 
  ArrowRight,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { ServiceItem } from '../types';

interface ServicesProps {
  services: ServiceItem[];
  darkMode: boolean;
  onSelectService: (serviceTitle: string) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Monitor,
  Zap,
  Smartphone,
  Server,
};

export const Services: React.FC<ServicesProps> = ({
  services,
  darkMode,
  onSelectService,
}) => {
  return (
    <section 
      id="services" 
      className={`py-24 relative transition-colors ${
        darkMode ? 'bg-slate-950/70' : 'bg-slate-50/90'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border ${
            darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>
            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
            Services Offered
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}>
            High-Impact Digital Solutions
          </h2>
          <p className={`text-base leading-relaxed ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            From custom responsive web platforms to native Android apps, built with speed, security, and scalable architecture.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Monitor;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-2xl border p-8 flex flex-col justify-between shadow-sm transition-all ${
                  darkMode
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 shadow-slate-100 hover:border-slate-300'
                }`}
              >
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute -top-3 right-6 bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Popular
                  </div>
                )}

                <div className="space-y-6">
                  {/* Service Icon & Title */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700/60 shadow-inner">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {service.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-400">
                        Web & Mobile Architecture
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {service.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2.5 pt-2">
                    <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                      darkMode ? 'text-slate-400' : 'text-slate-700'
                    }`}>
                      Included Deliverables:
                    </h4>
                    <ul className="space-y-2 text-xs">
                      {service.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2.5">
                          <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Service Request CTA */}
                <div className="pt-8 mt-6 border-t border-slate-800/20">
                  <button
                    id={`service-btn-${service.id}`}
                    onClick={() => onSelectService(service.title)}
                    className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      darkMode
                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>Request This Service</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
