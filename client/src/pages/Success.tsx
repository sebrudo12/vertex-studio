import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Copy, Check, Download, ArrowRight, Key, Terminal } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Success: React.FC = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const orderData = location.state as {
    orderId: number;
    orderNumber: string;
    totalAmount: number;
    licenses: { id: number; key: string; productTitle: string; productId: number }[];
  } | null;

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00E5FF', '#ffffff', '#10B981', '#5865F2'],
    });
  }, []);

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast('License key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (!orderData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Order Confirmed</h2>
        <p className="text-sm text-gray-400">
          Your purchase has been processed. Visit your customer dashboard to manage your licenses and downloads.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 rounded-xl font-bold text-black bg-[var(--brand-primary)]"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Thank You For Your Purchase!
        </h1>
        <p className="text-sm text-gray-400">
          Order Reference: <span className="font-mono text-white font-bold">{orderData.orderNumber}</span>
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-dark-850 border border-white/10 backdrop-blur-md space-y-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-[var(--brand-primary)]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Your Generated Licenses
          </h2>
        </div>

        <div className="space-y-4">
          {orderData.licenses?.map((lic) => (
            <div
              key={lic.id}
              className="p-4 rounded-xl bg-dark-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{lic.productTitle}</h4>
                <p className="text-xs text-gray-400 mt-0.5">Status: <span className="text-emerald-400 font-semibold">Active</span></p>
                <div className="mt-2 font-mono text-sm sm:text-base font-bold text-[var(--brand-primary)] tracking-wider">
                  {lic.key}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyToClipboard(lic.key)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === lic.key ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Key</span>
                    </>
                  )}
                </button>

                <a
                  href={`/api/downloads/${lic.productId}`}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-dark-850/60 border border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Quick FiveM Setup (server.cfg)</span>
        </div>
        <div className="p-3 rounded-lg bg-black font-mono text-xs text-gray-300 border border-white/10 overflow-x-auto">
          {orderData.licenses?.map((l) => (
            <div key={l.id} className="py-0.5">
              set vertex_license "{l.key}"
            </div>
          ))}
          <div className="text-gray-500">ensure vertex_loadingscreen</div>
        </div>
        <p className="text-[11px] text-gray-400">
          You can bind or change your FiveM server IP at any time inside your customer dashboard.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Link
          to="/dashboard/downloads"
          className="px-6 py-3 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
        >
          View All Downloads
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl text-sm font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center gap-2 transition-colors shadow-lg shadow-[var(--brand-glow)]"
        >
          <span>Go to Customer Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};