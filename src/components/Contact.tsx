import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  MapPin, 
  Github, 
  Linkedin, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare,
  Clock,
  PhoneCall
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { PersonalInfo } from '../types';
import { storageService } from '../services/storageService';

interface ContactProps {
  personalInfo: PersonalInfo;
  darkMode: boolean;
  prefilledSubject?: string;
  onMessageSent?: () => void;
}

export const Contact: React.FC<ContactProps> = ({
  personalInfo,
  darkMode,
  prefilledSubject = '',
  onMessageSent,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(prefilledSubject);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (prefilledSubject) {
      setSubject(`Inquiry: ${prefilledSubject}`);
    }
  }, [prefilledSubject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Save message to storage inbox for Admin Dashboard
      storageService.saveMessage(name, email, subject || 'General Portfolio Inquiry', message);
      
      setIsSubmitting(false);
      setSubmitted(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      if (onMessageSent) onMessageSent();

      // Reset form fields
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <section id="contact" className={`py-24 relative transition-colors ${
      darkMode ? 'bg-slate-950/70' : 'bg-slate-50/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border ${
            darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            Get In Touch
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}>
            Let's Build Something Extraordinary
          </h2>
          <p className={`text-base leading-relaxed ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Have a project in mind, need a full-stack website, or an Android mobile app? Drop a message below or email directly.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Email Card */}
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${
              darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center font-bold">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`text-sm font-bold font-mono uppercase tracking-wider ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Direct Email
                  </h4>
                  <a 
                    href={`mailto:${personalInfo.email}`}
                    className="text-base font-bold text-blue-500 hover:underline block truncate"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Guaranteed reply within 24 hours. Feel free to request project estimates or technical consultations.
              </p>
            </div>

            {/* Location & Availability */}
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${
              darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center font-bold">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`text-sm font-bold font-mono uppercase tracking-wider ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Location & Timezone
                  </h4>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {personalInfo.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                <Clock className="w-4 h-4" />
                <span>UTC+2 (Cairo Time) • Remote Collaboration</span>
              </div>
            </div>

            {/* Social Links Card */}
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${
              darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
            }`}>
              <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Developer Profiles
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-semibold ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <Github className="w-4 h-4 text-slate-400" />
                  <span>GitHub</span>
                </a>

                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-semibold ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <Linkedin className="w-4 h-4 text-slate-400" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className={`p-8 rounded-2xl border shadow-md relative overflow-hidden ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
            }`}>
              
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Thank you, {name || 'visitor'}! Your inquiry has been stored directly in Kirlous's portfolio Admin Inbox. You will receive a response shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer hover:bg-slate-800 transition-all dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/20">
                    <h3 className={`text-xl font-bold flex items-center gap-2 ${
                      darkMode ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                      Send a Direct Message
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">Live Inbox Ready</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className={`text-xs font-mono font-bold ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-slate-500 transition-colors ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className={`text-xs font-mono font-bold ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Your Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-slate-500 transition-colors ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-mono font-bold ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Subject / Project Scope
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Website Development or Android Mobile App"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-slate-500 transition-colors ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-mono font-bold ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Detailed Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your project requirements, target deadline, or questions..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-slate-500 transition-colors custom-scrollbar ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl font-semibold text-xs bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    {isSubmitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Kirlous Wael</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
