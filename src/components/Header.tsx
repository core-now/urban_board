import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Search, 
  Bookmark,
  Layers, 
  Clock, 
  HelpCircle,
  Menu,
  MoreVertical,
  X,
  SlidersHorizontal,
  Compass,
  Cpu
} from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeCity: 'H' | 'HH';
  onSelectCity: (city: 'H' | 'HH') => void;
  selectedDistrict: string;
  districts: string[];
  onSelectDistrict: (district: string) => void;
  onOpenSearch: () => void;
  onOpenLinklist: () => void;
  onOpenGlossary: () => void;
  onOpenAdmin?: () => void;
  onToggleToolsFlyout?: () => void;
  isToolsFlyoutOpen?: boolean;
  onToggleTransitCockpit?: () => void;
  isTransitCockpitOpen?: boolean;
  activeMarkerCount: number;
}

// Mini Federal State Flag for Niedersachsen (Schwarz-Rot-Gold with white Saxon Steed)
const NiedersachsenFlag: React.FC<{ className?: string }> = ({ className = 'w-4 h-2.5' }) => (
  <svg viewBox="0 0 30 20" className={`shrink-0 overflow-hidden shadow-xs border border-anthrazit-700/60 ${className}`} aria-hidden="true">
    <rect width="30" height="6.67" fill="#000000" />
    <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
    <rect y="13.34" width="30" height="6.67" fill="#FFCE00" />
    <g transform="translate(10, 4) scale(0.65)">
      <path d="M0,0 L15.3,0 L15.3,10 C15.3,14 7.65,18 7.65,18 C7.65,18 0,14 0,10 Z" fill="#D00000" stroke="#FFFFFF" strokeWidth="0.8" />
      <path d="M4 11 C4 11, 4.5 9, 6 8.5 C7 8.2, 8.5 7.5, 9.5 5.5 C9.8 4.8, 10.5 4.5, 11 4.5 C11.5 4.5, 11.5 5.2, 11 5.8 C10.5 6.5, 10 7.5, 10.5 8 C11.5 9, 12.5 8.5, 13 8.5 C12 10, 10.5 11, 9 11.5 C7.5 12, 6 12.5, 5 13.5 C4.8 13.7, 4.2 13.5, 4.5 12.5 C4.8 11.8, 4 11, 4 11 Z" fill="#FFFFFF" />
    </g>
  </svg>
);

// Mini Federal State Flag for Hamburg (Red banner with iconic white 3-tower castle)
const HamburgFlag: React.FC<{ className?: string }> = ({ className = 'w-4 h-2.5' }) => (
  <svg viewBox="0 0 30 20" className={`shrink-0 overflow-hidden shadow-xs border border-anthrazit-700/60 ${className}`} aria-hidden="true">
    <rect width="30" height="20" fill="#D00000" />
    <g fill="#FFFFFF" transform="translate(6.5, 2.5) scale(0.85)">
      <path d="M1,14 L19,14 L19,17 L1,17 Z" />
      <path d="M2,8 L18,8 L18,14 L2,14 Z" />
      <path d="M7,11 C7,9.5 8.5,8.5 10,8.5 C11.5,8.5 13,9.5 13,11 L13,14 L7,14 Z" fill="#D00000" />
      <path d="M8.5,2 L11.5,2 L11.5,8 L8.5,8 Z" />
      <path d="M7.5,2 C7.5,0.8 10,-0.2 10,-0.2 C10,-0.2 12.5,0.8 12.5,2 Z" />
      <path d="M9.5,-1.5 L10.5,-1.5 M10,-2.2 L10,-0.8" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M2.5,4 L6,4 L6,8 L2.5,8 Z" />
      <path d="M2,2.5 L3,2.5 L3,4 L4,4 L4,2.5 L5,2.5 L5,4 L6.5,4 L6.5,2.5 L2,2.5 Z" />
      <circle cx="4.25" cy="0.5" r="0.8" fill="#FFFFFF" />
      <path d="M14,4 L17.5,4 L17.5,8 L14,8 Z" />
      <path d="M13.5,2.5 L15,2.5 L15,4 L16,4 L16,2.5 L17,2.5 L17,4 L18,4 L18,2.5 L13.5,2.5 Z" />
      <circle cx="15.75" cy="0.5" r="0.8" fill="#FFFFFF" />
    </g>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  activeCity,
  onSelectCity,
  selectedDistrict,
  districts,
  onSelectDistrict,
  onOpenSearch,
  onOpenLinklist,
  onOpenGlossary,
  onOpenAdmin,
  onToggleToolsFlyout,
  isToolsFlyoutOpen = false,
  onToggleTransitCockpit,
  isTransitCockpitOpen = true,
  activeMarkerCount
}) => {
  const [isMobileQuickMenuOpen, setIsMobileQuickMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 lg:h-16 border-b border-anthrazit-800 bg-anthrazit-900/95 dark:bg-anthrazit-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 select-none shrink-0">
      {/* Links: Logo HBOARD + City Switcher [H] | [HH] */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Tools/Sensoren Trigger */}
        {onToggleToolsFlyout && (
          <button
            onClick={onToggleToolsFlyout}
            className={`md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center border font-mono text-xs cursor-pointer transition-colors ${
              isToolsFlyoutOpen
                ? 'bg-accent text-anthrazit-950 border-accent font-bold'
                : 'bg-anthrazit-850 hover:bg-anthrazit-800 border-anthrazit-700 text-accent'
            }`}
            title="Sensoren & Werkzeuge Flyout öffnen"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-anthrazit-850 border border-accent/40 text-accent font-mono font-bold text-base shadow-accent-sm">
            ⬡
          </div>
          <span className="font-mono font-bold tracking-wider text-sm text-anthrazit-100 uppercase hidden sm:inline">
            HBOARD
          </span>
        </div>

        {/* City Switcher [H] HANNOVER | [HH] HAMBURG */}
        <div className="flex items-center bg-anthrazit-950 border border-anthrazit-800 p-0.5 space-x-0.5">
          <button
            onClick={() => onSelectCity('H')}
            className={`px-3 py-1.5 min-h-[40px] text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeCity === 'H'
                ? 'bg-accent text-anthrazit-950 border border-accent/60'
                : 'text-anthrazit-400 hover:text-anthrazit-200 hover:bg-anthrazit-850 border border-transparent'
            }`}
            title="Sektor Hannover (GVH) aktivieren"
          >
            <NiedersachsenFlag className="w-3.5 h-2.5" />
            <span>[H]</span>
            <span className="hidden md:inline font-medium opacity-90 text-[11px]">HANNOVER</span>
          </button>

          <button
            onClick={() => onSelectCity('HH')}
            className={`px-3 py-1.5 min-h-[40px] text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeCity === 'HH'
                ? 'bg-accent text-anthrazit-950 border border-accent/60'
                : 'text-anthrazit-400 hover:text-anthrazit-200 hover:bg-anthrazit-850 border border-transparent'
            }`}
            title="Sektor Hamburg (HVV) aktivieren"
          >
            <HamburgFlag className="w-3.5 h-2.5" />
            <span>[HH]</span>
            <span className="hidden md:inline font-medium opacity-90 text-[11px]">HAMBURG</span>
          </button>
        </div>
      </div>

      {/* Mitte: Schlanke Live-Uhrzeit (HH:MM:SS) & Status-Indikator */}
      <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 bg-anthrazit-950 border border-anthrazit-800 text-xs font-mono text-anthrazit-300">
        <div className="flex items-center space-x-1.5">
          <span className="inline-block w-2 h-2 bg-emerald-500 shadow-sm"></span>
          <span className="text-emerald-400 font-bold tracking-wider">LIVE</span>
        </div>
        <span className="text-anthrazit-700">|</span>
        <div className="flex items-center space-x-1 text-anthrazit-200">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span className="font-semibold tracking-widest">{currentTime || '00:00:00'}</span>
        </div>
        <span className="text-anthrazit-700">|</span>
        <div className="flex items-center space-x-1 text-anthrazit-400 text-[11px]">
          <Layers className="w-3 h-3 text-anthrazit-400" />
          <span>{activeMarkerCount} Nodes</span>
        </div>
      </div>

      {/* Rechts: Schnellsuche, Tools-Flyout-Button, Admin-Button */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 min-h-[40px] bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-xs text-anthrazit-300 transition-colors cursor-pointer group"
          title="OSINT Schnellsuche (Strg + K)"
        >
          <Search className="w-3.5 h-3.5 text-anthrazit-400 group-hover:text-accent" />
          <span className="hidden lg:inline text-anthrazit-400 text-xs">Suche...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-anthrazit-950 border border-anthrazit-700 text-[10px] font-mono text-accent">
            Ctrl+K
          </kbd>
        </button>

        {/* Sensoren & Tools Flyout Toggle Button (Desktop & Mobile) */}
        {onToggleToolsFlyout && (
          <button
            onClick={onToggleToolsFlyout}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 min-h-[40px] border text-xs font-mono transition-colors cursor-pointer ${
              isToolsFlyoutOpen
                ? 'bg-accent text-anthrazit-950 border-accent font-bold shadow-accent-sm'
                : 'bg-anthrazit-850 hover:bg-anthrazit-800 border-anthrazit-700 text-anthrazit-200 hover:text-accent'
            }`}
            title="Sensoren, Kameras, IoT & Cyber-Tools Flyout"
          >
            <Cpu className="w-3.5 h-3.5 text-accent" />
            <span>Tools & Sensoren</span>
          </button>
        )}

        {/* Transit Cockpit Toggle Button (Desktop) */}
        {onToggleTransitCockpit && (
          <button
            onClick={onToggleTransitCockpit}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 min-h-[40px] border text-xs font-mono transition-colors cursor-pointer ${
              isTransitCockpitOpen
                ? 'bg-accent/15 border-accent text-accent font-bold'
                : 'bg-anthrazit-850 hover:bg-anthrazit-800 border-anthrazit-700 text-anthrazit-300'
            }`}
            title="Transit-Cockpit ein-/ausblenden"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Cockpit</span>
          </button>
        )}

        {/* Desktop Admin / Ops Hub Trigger */}
        <button
          onClick={onOpenAdmin}
          className="hidden md:flex items-center space-x-1 px-3 py-1.5 min-h-[40px] bg-accent/15 hover:bg-accent/25 border border-accent/50 text-xs font-mono text-accent transition-colors cursor-pointer"
          title="Admin & Operations Dashboard öffnen (PW: 4dm1n)"
        >
          <span className="font-bold">⚡ OPS</span>
        </button>

        {/* Desktop District Filter Dropdown */}
        <div className="hidden xl:flex items-center">
          <select
            value={selectedDistrict}
            onChange={(e) => onSelectDistrict(e.target.value)}
            aria-label="Stadtbezirk filtern"
            className="text-xs min-h-[40px] bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-anthrazit-200 px-2 py-1 focus:outline-none focus:border-accent font-mono transition-colors"
          >
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
          className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-anthrazit-300 hover:text-accent transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-accent" />
          ) : (
            <Moon className="w-4 h-4 text-anthrazit-700" />
          )}
        </button>

        {/* Mobile Quick Menu Hamburger / Dots Button */}
        <div className="relative md:hidden">
          <button
            onClick={() => setIsMobileQuickMenuOpen(prev => !prev)}
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-accent font-bold transition-colors cursor-pointer"
            title="Weitere Optionen & Menü"
          >
            {isMobileQuickMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
          </button>

          {isMobileQuickMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-anthrazit-950/60"
                onClick={() => setIsMobileQuickMenuOpen(false)}
              />
              <div className="absolute right-0 top-12 w-64 p-3 bg-anthrazit-900 border border-anthrazit-700 shadow-2xl z-50 space-y-2 font-mono text-xs">
                <div className="text-xs font-bold text-anthrazit-400 uppercase pb-1 border-b border-anthrazit-800 flex items-center justify-between">
                  <span>HBOARD Quick Actions</span>
                  <span className="text-accent text-xs">v0.2</span>
                </div>

                <button
                  onClick={() => {
                    onToggleToolsFlyout?.();
                    setIsMobileQuickMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 min-h-[44px] bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-anthrazit-100 flex items-center space-x-2 font-bold cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-accent" />
                  <span>🛠️ Sensoren & Werkzeuge</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAdmin?.();
                    setIsMobileQuickMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 min-h-[44px] bg-accent/15 hover:bg-accent/25 border border-accent/40 text-accent flex items-center space-x-2 font-bold cursor-pointer"
                >
                  <span>⚡ OPS & Admin Center</span>
                </button>

                <button
                  onClick={() => {
                    onOpenGlossary();
                    setIsMobileQuickMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 min-h-[44px] bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-750 text-anthrazit-200 flex items-center space-x-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-accent" />
                  <span>📖 Glossar & Hilfe</span>
                </button>

                <button
                  onClick={() => {
                    onOpenLinklist();
                    setIsMobileQuickMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 min-h-[44px] bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-750 text-anthrazit-200 flex items-center space-x-2 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4 text-accent" />
                  <span>🔗 Primärquellen & Links</span>
                </button>

                <div className="pt-1 border-t border-anthrazit-800 space-y-1">
                  <div className="text-xs text-anthrazit-400 font-bold uppercase flex items-center space-x-1">
                    <SlidersHorizontal className="w-3 h-3 text-accent" />
                    <span>Stadtbezirk filtern:</span>
                  </div>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      onSelectDistrict(e.target.value);
                      setIsMobileQuickMenuOpen(false);
                    }}
                    className="w-full text-xs min-h-[44px] bg-anthrazit-950 border border-anthrazit-700 text-anthrazit-200 px-3 py-2 focus:outline-none focus:border-accent font-mono"
                  >
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
