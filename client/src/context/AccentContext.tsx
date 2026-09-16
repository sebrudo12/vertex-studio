import React, { createContext, useContext, useState, useEffect } from 'react';

export type AccentMode = 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'silver';

interface AccentColors {
  name: string;
  mode: AccentMode;
  primary: string;
  hover: string;
  glow: string;
  muted: string;
}

export const ACCENTS: Record<AccentMode, AccentColors> = {
  cyan: {
    name: 'Electric Cyan',
    mode: 'cyan',
    primary: '#00E5FF',
    hover: '#00B4D8',
    glow: 'rgba(0, 229, 255, 0.35)',
    muted: 'rgba(0, 229, 255, 0.12)',
  },
  purple: {
    name: 'Neon Violet',
    mode: 'purple',
    primary: '#A855F7',
    hover: '#9333EA',
    glow: 'rgba(168, 85, 247, 0.35)',
    muted: 'rgba(168, 85, 247, 0.12)',
  },
  emerald: {
    name: 'Cyber Emerald',
    mode: 'emerald',
    primary: '#10B981',
    hover: '#059669',
    glow: 'rgba(16, 185, 129, 0.35)',
    muted: 'rgba(16, 185, 129, 0.12)',
  },
  amber: {
    name: 'Solar Amber',
    mode: 'amber',
    primary: '#F59E0B',
    hover: '#D97706',
    glow: 'rgba(245, 158, 11, 0.35)',
    muted: 'rgba(245, 158, 11, 0.12)',
  },
  rose: {
    name: 'Crimson Pulse',
    mode: 'rose',
    primary: '#F43F5E',
    hover: '#E11D48',
    glow: 'rgba(244, 63, 94, 0.35)',
    muted: 'rgba(244, 63, 94, 0.12)',
  },
  silver: {
    name: 'Titanium Chrome',
    mode: 'silver',
    primary: '#E2E8F0',
    hover: '#CBD5E1',
    glow: 'rgba(226, 232, 240, 0.35)',
    muted: 'rgba(226, 232, 240, 0.12)',
  },
};

interface AccentContextType {
  currentAccent: AccentColors;
  setAccent: (mode: AccentMode) => void;
}

const AccentContext = createContext<AccentContextType | undefined>(undefined);

export const AccentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AccentMode>(() => {
    return (localStorage.getItem('vertex_accent') as AccentMode) || 'cyan';
  });

  const currentAccent = ACCENTS[mode] || ACCENTS.cyan;

  useEffect(() => {
    localStorage.setItem('vertex_accent', mode);
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', currentAccent.primary);
    root.style.setProperty('--brand-hover', currentAccent.hover);
    root.style.setProperty('--brand-glow', currentAccent.glow);
    root.style.setProperty('--brand-muted', currentAccent.muted);
  }, [mode, currentAccent]);

  return (
    <AccentContext.Provider value={{ currentAccent, setAccent: setMode }}>
      {children}
    </AccentContext.Provider>
  );
};

export const useAccent = () => {
  const context = useContext(AccentContext);
  if (!context) throw new Error('useAccent must be used within an AccentProvider');
  return context;
};
