import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-dark-950/80 backdrop-blur-md pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Vertex Studio" className="h-9 w-auto" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg tracking-widest text-white uppercase">
                  VERTEX
                </span>
                <span className="text-[9px] tracking-[0.25em] text-gray-400 font-semibold uppercase -mt-1">
                  STUDIO
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Premium, high-performance resources and scripts built to transform your FiveM roleplay experience. Engineered for reliability, aesthetics, and pure speed.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/store" className="hover:text-white transition-colors">All Scripts</Link></li>
              <li><Link to="/store?category=UI" className="hover:text-white transition-colors">UI & NUI Systems</Link></li>
              <li><Link to="/store?category=Framework" className="hover:text-white transition-colors">Frameworks</Link></li>
              <li><Link to="/changelog" className="hover:text-white transition-colors">Latest Releases</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">Support Center</Link></li>
              <li><Link to="/dashboard/licenses" className="hover:text-white transition-colors">License Manager</Link></li>
              <li>
                <a href="https://discord.gg/vertexstudio" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  Discord Community <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policy */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span className="text-gray-500 cursor-default">Terms of Service</span></li>
              <li><span className="text-gray-500 cursor-default">Privacy Policy</span></li>
              <li><span className="text-gray-500 cursor-default">Refund Policy</span></li>
              <li><span className="text-gray-500 cursor-default">License Agreement</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Vertex Studio. All rights reserved.</p>
          <p className="text-center md:text-right max-w-xl">
            Vertex Studio is not affiliated with, endorsed by, or sponsored by Rockstar Games, Take-Two Interactive, or Cfx.re. FiveM is a registered trademark of Take-Two Interactive.
          </p>
        </div>

      </div>
    </footer>
  );
};
