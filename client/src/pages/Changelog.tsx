import React, { useState, useEffect } from 'react';
import { History, Tag, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Changelog } from '../types';

export const ChangelogPage: React.FC = () => {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChangelog() {
      try {
        const res = await api.get('/changelogs');
        setChangelogs(res.data.changelogs || []);
      } catch (err) {
        console.error('Failed to load changelog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChangelog();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
          <History className="w-4 h-4" />
          <span>Product Updates</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white font-display">
          Changelog & Releases
        </h1>
        <p className="text-sm text-gray-400">
          Discover latest improvements, bug fixes, and feature additions across all Vertex Studio scripts.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading release logs...</div>
      ) : changelogs.length === 0 ? (
        <div className="p-8 rounded-2xl bg-dark-850 text-center text-gray-400">
          No changelog entries published yet.
        </div>
      ) : (
        <div className="space-y-6">
          {changelogs.map((c) => (
            <div
              key={c.id}
              className="p-6 sm:p-8 rounded-2xl bg-dark-850/70 border border-white/5 backdrop-blur-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 font-mono">
                    v{c.version}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{c.title}</h3>
                    <span className="text-xs text-gray-400">{c.product_title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{c.release_date}</span>
                </div>
              </div>

              {/* Added */}
              {c.content.added && c.content.added.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Added
                  </span>
                  <ul className="space-y-1.5 pl-3 border-l border-emerald-500/20">
                    {c.content.added.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fixed */}
              {c.content.fixed && c.content.fixed.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Fixed
                  </span>
                  <ul className="space-y-1.5 pl-3 border-l border-rose-500/20">
                    {c.content.fixed.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved */}
              {c.content.improved && c.content.improved.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Improved
                  </span>
                  <ul className="space-y-1.5 pl-3 border-l border-cyan-500/20">
                    {c.content.improved.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};