import React, { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useAccent, ACCENTS, AccentMode } from '../../context/AccentContext';

export const AccentPicker: React.FC = () => {
  const { currentAccent, setAccent } = useAccent();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Customize Accent Color"
        className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-white/5 hover:border-white/10 text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-1.5"
      >
        <span
          className="w-3.5 h-3.5 rounded-full shadow-sm"
          style={{ backgroundColor: currentAccent.primary }}
        />
        <Palette className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-850/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
            Accent Color
          </div>
          <div className="space-y-1">
            {(Object.keys(ACCENTS) as AccentMode[]).map((mode) => {
              const acc = ACCENTS[mode];
              const isSelected = currentAccent.mode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setAccent(mode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isSelected
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                    style={{ backgroundColor: acc.primary }}
                  />
                  <span>{acc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
