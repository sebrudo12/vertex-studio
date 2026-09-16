import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Disc as DiscordIcon, ShieldAlert, ArrowRight, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FAQS = [
  {
    q: 'How do I download my scripts after purchasing?',
    a: 'Once your order is processed, your resources and unique FiveM license keys appear immediately under your Customer Dashboard -> Downloads & Licenses tabs. You can download the zip package with one click.'
  },
  {
    q: 'Where do I put my license key in FiveM?',
    a: 'Add `set vertex_license "YOUR-KEY-HERE"` in your server.cfg file right before the resource start command. You can also assign or update your bound server IP from your Customer Dashboard.'
  },
  {
    q: 'What frameworks are supported?',
    a: 'Our scripts natively support QBCore, ESX Legacy, and Qbox Framework. Many of our UI resources (like Vertex Loading Screen and Vertex HUD) are completely standalone and work on any server.'
  },
  {
    q: 'Can I change my server IP if I switch hosting providers?',
    a: 'Yes! Go to Dashboard -> Licenses, click "Update Server IP" and save your new dedicated server IP address.'
  },
  {
    q: 'Are updates free?',
    a: 'Yes, all bug fixes, security patches, and framework compatibility updates are 100% free for lifetime license holders.'
  }
];

export const Support: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
          <LifeBuoy className="w-4 h-4" />
          <span>Vertex Support Hub</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white font-display">
          How Can We Help You?
        </h1>
        <p className="text-sm text-gray-400">
          Find answers to common questions or reach out directly to our dedicated engineering staff.
        </p>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Discord Support Card */}
        <div className="p-8 rounded-2xl bg-dark-850/80 border border-[#5865F2]/20 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2]">
              <DiscordIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Live Discord Support</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Connect directly with our staff team and community in real time. Average response time is under 15 minutes.
            </p>
          </div>
          <a
            href="https://discord.gg/vertexstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] flex items-center justify-center gap-2 transition-colors"
          >
            <span>Join Discord Support</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Ticket System Card */}
        <div className="p-8 rounded-2xl bg-dark-850/80 border border-white/10 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-primary)]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dashboard Tickets</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Open a formal support ticket linked to your product purchase, licenses, or custom installation assistance.
            </p>
          </div>
          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard/support');
              } else {
                navigate('/login?redirect=/dashboard/support');
              }
            }}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center justify-center gap-2 transition-colors shadow-md shadow-[var(--brand-glow)]"
          >
            <span>Open Support Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white font-display text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-dark-850/60 border border-white/5 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-[var(--brand-primary)] transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};