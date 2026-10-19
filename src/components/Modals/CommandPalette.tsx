import React, { useState, useEffect } from 'react';
import { Search, Train } from 'lucide-react';
import { GeoLocation } from '../../types';
import { ALL_HANNOVER_STATIONS } from '../../data/hannoverStations';
import { ALL_HAMBURG_STATIONS } from '../../data/hamburgStations';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMarker: (marker: GeoLocation) => void;
  onSelectPreset?: (preset: any) => void;
  onOpenLinklist?: () => void;
  onOpenAdmin?: () => void;
  activeCity?: 'H' | 'HH';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectMarker,
  activeCity = 'H'
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cityStationList = activeCity === 'HH' ? ALL_HAMBURG_STATIONS : ALL_HANNOVER_STATIONS;
  const otherStationList = activeCity === 'HH' ? ALL_HANNOVER_STATIONS : ALL_HAMBURG_STATIONS;
  const allStations = [...cityStationList, ...otherStationList];

  const filteredStations = query.trim().length >= 2
    ? allStations.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.type?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15)
    : [];

  return (
    <div className="fixed inset-0 z-[1200] flex items-end lg:items-start justify-center pt-0 lg:pt-20 p-0 lg:p-4 bg-anthrazit-950/80 backdrop-blur-sm">
      <div className="w-full lg:max-w-2xl max-h-[90dvh] lg:max-h-[85dvh] flex flex-col rounded-t-xl lg:rounded-xl bg-anthrazit-900 border-t lg:border border-anthrazit-700 shadow-2xl overflow-hidden font-mono pb-[env(safe-area-inset-bottom)] z-[1201]">
        {/* Input */}
        <div className="flex items-center px-3 lg:px-4 border-b border-anthrazit-800 bg-anthrazit-950 min-h-[60px]">
          <Search className="w-5 h-5 text-accent mr-3 shrink-0" />
          <input
            type="text"
            placeholder={activeCity === 'HH' ? 'Haltestellen, Knoten, Presets...' : 'Haltestellen, Knoten, Presets...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3 min-h-[44px] bg-transparent text-sm text-anthrazit-100 placeholder-anthrazit-500 focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-1 rounded bg-anthrazit-800 border border-anthrazit-700 text-xs text-anthrazit-400 hidden lg:inline-block shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 lg:p-4 space-y-4">

          {/* Station Results */}
          {filteredStations.length > 0 && (
            <div>
              <div className="text-xs font-bold text-accent uppercase px-2 mb-2 flex items-center justify-between">
                <span>ÖPNV Haltestellen & Knoten</span>
                <span className="text-[10px] text-anthrazit-400">{filteredStations.length} Treffer</span>
              </div>
              <div className="space-y-1.5">
                {filteredStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => {
                      onSelectMarker({
                        id: station.id,
                        name: station.name,
                        lat: station.lat,
                        lng: station.lng,
                        category: 'traffic',
                        type: 'Haltestelle',
                        status: 'active',
                        explanation: `Haltestelle ${station.name} (${station.type}).`,
                        details: {
                          'Station': station.name,
                          'Linien': station.type || 'ÖPNV',
                          'Netz': activeCity === 'HH' ? 'HVV Hamburg' : 'GVH Hannover'
                        },
                        timestamp: 'Live'
                      });
                      onClose();
                    }}
                    className="w-full min-h-[44px] flex items-center justify-between p-2.5 bg-anthrazit-950 hover:bg-anthrazit-850 border border-anthrazit-800 hover:border-accent text-xs text-anthrazit-200 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 bg-anthrazit-900 border border-accent/40 flex items-center justify-center shrink-0 text-accent">
                        <Train className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-anthrazit-100 block truncate text-xs">{station.name}</span>
                        <span className="text-[10px] text-anthrazit-400 block truncate">
                          {station.type || 'Haltestelle'} • Lat: {station.lat.toFixed(4)}, Lng: {station.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-accent text-anthrazit-950 font-bold shrink-0 ml-2">
                      Fokus & Fahrplan
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
