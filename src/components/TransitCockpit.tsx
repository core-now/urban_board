import React, { useState, useEffect, useRef } from 'react';
import { 
  Train, 
  ArrowRightLeft, 
  MapPin, 
  Clock, 
  X, 
  RefreshCw, 
  Search, 
  Loader2
} from 'lucide-react';
import { TransitLineRoute, HANNOVER_TRANSIT_ROUTES, HAMBURG_TRANSIT_ROUTES } from '../data/transitRoutes';
import { HANNOVER_SCHEDULES, HAMBURG_SCHEDULES, LineSchedule, ScheduleStopItem } from '../data/transitSchedules';
import { ALL_HANNOVER_STATIONS } from '../data/hannoverStations';
import { ALL_HAMBURG_STATIONS } from '../data/hamburgStations';
import { 
  fetchLiveDepartures, 
  searchTransitStops, 
  TransitStop, 
  LiveDeparture, 
  fetchLiveOsmLineRoute 
} from '../services/apiService';

interface TransitCockpitProps {
  activeCity: 'H' | 'HH';
  isOpen: boolean;
  onClose?: () => void;
  activeRoute: TransitLineRoute | null;
  onSelectRoute: (route: TransitLineRoute | null) => void;
  selectedTransitStop: TransitStop | null;
  onSelectTransitStop: (stop: TransitStop | null) => void;
  onFlyToStation: (lat: number, lng: number, name?: string) => void;
}

export const TransitCockpit: React.FC<TransitCockpitProps> = ({
  activeCity,
  isOpen,
  onClose,
  activeRoute,
  onSelectRoute,
  selectedTransitStop,
  onSelectTransitStop,
  onFlyToStation
}) => {
  const isHamburg = activeCity === 'HH';
  const schedulesMap = isHamburg ? HAMBURG_SCHEDULES : HANNOVER_SCHEDULES;
  const linesList = Object.values(schedulesMap);

  // Active Category Filter for Line Selector:
  // Hamburg: 'U' (U-Bahn), 'S' (S-Bahn), 'F' (Fähre), 'ALL'
  // Hannover: 'STADTBAHN', 'S-BAHN', 'ALL'
  const [activeCategory, setActiveCategory] = useState<string>(isHamburg ? 'U' : 'STADTBAHN');
  const [selectedLineRef, setSelectedLineRef] = useState<string>(isHamburg ? 'U3' : '6');
  const [selectedDirection, setSelectedDirection] = useState<'A' | 'B'>('A');

  // Live Departures State for selected stop
  const [departures, setDepartures] = useState<LiveDeparture[]>([]);
  const [loadingDepartures, setLoadingDepartures] = useState<boolean>(false);

  // Quick Station Search within Cockpit
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TransitStop[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync category & line when activeCity changes
  useEffect(() => {
    if (activeCity === 'HH') {
      setActiveCategory('U');
      setSelectedLineRef('U3');
    } else {
      setActiveCategory('STADTBAHN');
      setSelectedLineRef('6');
    }
    setSelectedDirection('A');
  }, [activeCity]);

  // Synchronize when activeRoute changes from map
  useEffect(() => {
    if (activeRoute && activeRoute.ref) {
      setSelectedLineRef(activeRoute.ref);
    }
  }, [activeRoute]);

  // Categories
  const categoryFilters = isHamburg
    ? [
        { id: 'ALL', label: 'Alle' },
        { id: 'U', label: 'U-Bahn' },
        { id: 'S', label: 'S-Bahn' },
        { id: 'F', label: 'HADAG Fähren' },
      ]
    : [
        { id: 'ALL', label: 'Alle' },
        { id: 'STADTBAHN', label: 'Stadtbahn' },
        { id: 'S-BAHN', label: 'S-Bahn' },
      ];

  // Filtered lines
  const filteredLines = linesList.filter(l => {
    if (activeCategory === 'ALL') return true;
    if (isHamburg) {
      if (activeCategory === 'U') return l.stammstrecke === 'U' || l.lineRef.startsWith('U');
      if (activeCategory === 'S') return l.stammstrecke === 'S' || l.lineRef.startsWith('S');
      if (activeCategory === 'F') return l.stammstrecke === 'F' || ['61', '62', '72'].includes(l.lineRef);
    } else {
      if (activeCategory === 'STADTBAHN') return ['A', 'B', 'C', 'D'].includes(l.stammstrecke || '') || !l.lineRef.startsWith('S');
      if (activeCategory === 'S-BAHN') return l.stammstrecke === 'S' || l.lineRef.startsWith('S');
    }
    return true;
  });

  const activeSchedule: LineSchedule = schedulesMap[selectedLineRef] || linesList[0];
  const activeDir = selectedDirection === 'A' ? activeSchedule?.directionA : activeSchedule?.directionB;

  // Select Line Handler: also activates Map Route
  const handleSelectLine = async (lineRef: string) => {
    setSelectedLineRef(lineRef);
    setSelectedDirection('A');

    const routesMap = isHamburg ? HAMBURG_TRANSIT_ROUTES : HANNOVER_TRANSIT_ROUTES;
    const directRoute = routesMap[lineRef];
    if (directRoute) {
      onSelectRoute(directRoute);
    } else {
      const osmRoute = await fetchLiveOsmLineRoute(lineRef, activeCity);
      if (osmRoute) {
        onSelectRoute(osmRoute);
      }
    }
  };

  // Station Click Handler
  const handleSelectStopItem = (stopItem: ScheduleStopItem) => {
    let stopObj: TransitStop;
    if (isHamburg) {
      const match = ALL_HAMBURG_STATIONS.find(s => 
        s.name.toLowerCase().includes(stopItem.stopName.toLowerCase()) || 
        stopItem.stopName.toLowerCase().includes(s.name.toLowerCase())
      );
      stopObj = match || {
        id: `hh-${stopItem.stopName.toLowerCase().replace(/\s+/g, '-')}`,
        name: stopItem.stopName,
        lat: 53.5511,
        lng: 9.9937,
        type: activeSchedule.lineName
      };
    } else {
      const match = ALL_HANNOVER_STATIONS.find(s => 
        s.name.toLowerCase().includes(stopItem.stopName.toLowerCase()) || 
        stopItem.stopName.toLowerCase().includes(s.name.toLowerCase())
      );
      stopObj = match || {
        id: `hn-${stopItem.stopName.toLowerCase().replace(/\s+/g, '-')}`,
        name: stopItem.stopName,
        lat: 52.3759,
        lng: 9.7320,
        type: activeSchedule.lineName
      };
    }

    onSelectTransitStop(stopObj);
    onFlyToStation(stopObj.lat, stopObj.lng, stopObj.name);
  };

  // Load Departures
  const loadDepartures = async (station: TransitStop) => {
    setLoadingDepartures(true);
    try {
      const res = await fetchLiveDepartures(station.id, 25, activeCity);
      if (res.success) {
        setDepartures(res.departures);
      }
    } finally {
      setLoadingDepartures(false);
    }
  };

  // Trigger Departures when selectedTransitStop changes
  useEffect(() => {
    if (!selectedTransitStop) {
      setDepartures([]);
      return;
    }
    loadDepartures(selectedTransitStop);
    const interval = setInterval(() => {
      loadDepartures(selectedTransitStop);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedTransitStop, activeCity]);

  // Live Station Search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchTransitStops(searchQuery, activeCity);
      setSearchResults(results);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCity]);

  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-[380px] lg:w-[400px] h-full bg-anthrazit-950 border-l border-anthrazit-800 flex flex-col shrink-0 select-none z-20 font-mono text-xs overflow-hidden">
      {/* Cockpit Top Bar */}
      <div className="h-12 border-b border-anthrazit-800 px-3 bg-anthrazit-900 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Train className="w-4 h-4 text-accent" />
          <span className="font-bold text-xs uppercase tracking-wider text-anthrazit-100">
            3D-Transit-Cockpit
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-accent text-anthrazit-950 font-bold">
            {activeCity === 'HH' ? 'HVV' : 'GVH'}
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-anthrazit-800 text-anthrazit-400 hover:text-anthrazit-100 border border-anthrazit-700 cursor-pointer"
            title="Cockpit einklappen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Body - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3.5">
        {/* SEKTION 1: KATEGORIE- & LINIENWÄHLER */}
        <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
          {/* Kategorie Tabs */}
          <div className="flex space-x-1 border-b border-anthrazit-800 pb-2">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-1 py-1 px-1.5 text-center text-[11px] font-bold transition-colors cursor-pointer border ${
                  activeCategory === cat.id
                    ? 'bg-accent text-anthrazit-950 border-accent'
                    : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-anthrazit-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Kompakte, farbcodierte eckige Linien-Buttons */}
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar pt-1">
            {filteredLines.map((line) => {
              const isSelected = selectedLineRef === line.lineRef;
              const isSubway = line.lineRef.startsWith('U') || ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '17'].includes(line.lineRef);
              const isRail = line.lineRef.startsWith('S');
              const isFerry = ['61', '62', '72'].includes(line.lineRef);

              return (
                <button
                  key={line.lineRef}
                  onClick={() => handleSelectLine(line.lineRef)}
                  className={`px-2 py-1 min-h-[32px] min-w-[40px] text-xs font-mono font-bold transition-all cursor-pointer border flex items-center justify-center space-x-1 ${
                    isSelected
                      ? 'bg-accent text-anthrazit-950 border-accent shadow-accent-sm scale-105'
                      : isSubway
                      ? 'bg-anthrazit-950 border-blue-500/40 text-blue-400 hover:border-accent hover:text-accent'
                      : isRail
                      ? 'bg-anthrazit-950 border-emerald-500/40 text-emerald-400 hover:border-accent hover:text-accent'
                      : isFerry
                      ? 'bg-anthrazit-950 border-cyan-500/40 text-cyan-400 hover:border-accent hover:text-accent'
                      : 'bg-anthrazit-950 border-anthrazit-700 text-anthrazit-200 hover:border-accent hover:text-accent'
                  }`}
                  title={`${line.lineName} (${line.corridorName || ''})`}
                >
                  <span>{line.lineRef}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEKTION 2: AKTIVE LINIE & HALTESTELLEN-KETTE */}
        {activeSchedule && (
          <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
            {/* Header: Linien-Name & Richtungs-Umschalter */}
            <div className="flex items-center justify-between pb-2 border-b border-anthrazit-800">
              <div className="min-w-0 pr-2">
                <div className="flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.5 bg-accent text-anthrazit-950 font-bold text-xs">
                    {activeSchedule.lineRef}
                  </span>
                  <span className="font-bold text-xs text-anthrazit-100 truncate">
                    {activeSchedule.lineName}
                  </span>
                </div>
                <span className="text-[10px] text-anthrazit-400 block truncate mt-0.5">
                  {activeSchedule.corridorName}
                </span>
              </div>

              {/* Richtungs-Umschalter */}
              <button
                onClick={() => setSelectedDirection(selectedDirection === 'A' ? 'B' : 'A')}
                className="px-2 py-1 bg-anthrazit-950 hover:bg-anthrazit-850 border border-anthrazit-700 text-accent font-bold text-[10px] flex items-center space-x-1 cursor-pointer shrink-0"
                title="Richtung wechseln"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Richtung</span>
              </button>
            </div>

            {/* Richtungs-Anzeige */}
            <div className="bg-anthrazit-950 p-1.5 border border-anthrazit-800 text-[11px] flex items-center justify-between">
              <span className="text-anthrazit-400 truncate">
                ➔ <strong className="text-anthrazit-100">{activeDir?.destination || 'Endstation'}</strong>
              </span>
              <span className="text-[10px] text-anthrazit-500 shrink-0">
                {activeDir?.stops.length || 0} Stopps
              </span>
            </div>

            {/* Haltestellen-Kette */}
            <div className="space-y-1 max-h-52 overflow-y-auto overscroll-contain pr-1">
              {activeDir?.stops.map((stop, idx) => {
                const isOrigin = idx === 0;
                const isDestination = idx === activeDir.stops.length - 1;
                const isSelected = selectedTransitStop?.name.toLowerCase().includes(stop.stopName.toLowerCase()) ||
                  stop.stopName.toLowerCase().includes(selectedTransitStop?.name.toLowerCase() || '___');

                return (
                  <div
                    key={stop.stopName + idx}
                    onClick={() => handleSelectStopItem(stop)}
                    className={`px-2 py-1.5 border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-accent/20 border-accent text-accent font-bold shadow-sm'
                        : isOrigin || isDestination
                        ? 'bg-anthrazit-950 border-anthrazit-700 text-anthrazit-100 hover:border-anthrazit-600'
                        : 'bg-anthrazit-950/70 border-anthrazit-850 text-anthrazit-300 hover:border-anthrazit-700 hover:text-anthrazit-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-1">
                      <span className={`w-4 h-4 flex items-center justify-center text-[10px] font-mono shrink-0 ${
                        isSelected
                          ? 'bg-accent text-anthrazit-950 font-bold'
                          : 'bg-anthrazit-800 text-anthrazit-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate text-xs">{stop.stopName}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 pl-1">
                      <span className="text-[10px] text-accent font-bold">
                        +{stop.minuteOffset}m
                      </span>
                      {stop.isHighPlatform && (
                        <span className="text-[9px] text-emerald-400" title="Hochbahnsteig">
                          ♿
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEKTION 3: LIVE-ABFAHRTSTAFEL */}
        <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
          {/* Header & Station Quick Search */}
          <div className="flex items-center justify-between pb-1.5 border-b border-anthrazit-800">
            <div className="flex items-center space-x-1.5 min-w-0">
              <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-bold text-xs uppercase text-anthrazit-100 truncate">
                Abfahrtstafel: {selectedTransitStop?.name || 'Keine Station gewählt'}
              </span>
            </div>

            {selectedTransitStop && (
              <button
                onClick={() => loadDepartures(selectedTransitStop)}
                disabled={loadingDepartures}
                className="p-1 hover:bg-anthrazit-800 text-accent border border-anthrazit-700 cursor-pointer"
                title="Echtzeitdaten neu laden"
              >
                <RefreshCw className={`w-3 h-3 ${loadingDepartures ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Station Quick Search Input */}
          <div ref={searchRef} className="relative">
            <div className="flex items-center bg-anthrazit-950 border border-anthrazit-700 px-2 py-1 focus-within:border-accent">
              <Search className="w-3 h-3 text-anthrazit-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Station suchen (z.B. Kröpcke, Hauptbahnhof)..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full bg-transparent text-xs text-anthrazit-100 placeholder-anthrazit-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-anthrazit-400 hover:text-anthrazit-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 max-h-48 overflow-y-auto bg-anthrazit-900 border border-anthrazit-700 shadow-2xl p-1 space-y-1">
                {searchResults.map((stop) => (
                  <div
                    key={stop.id}
                    onClick={() => {
                      onSelectTransitStop(stop);
                      onFlyToStation(stop.lat, stop.lng, stop.name);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-1.5 hover:bg-anthrazit-800 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3 h-3 text-accent shrink-0" />
                      <span className="text-anthrazit-100 truncate">{stop.name}</span>
                    </div>
                    <span className="text-[10px] text-anthrazit-500">{stop.type || 'ÖPNV'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Abfahrten Liste */}
          {selectedTransitStop ? (
            <div className="space-y-1.5 pt-1">
              {loadingDepartures && departures.length === 0 ? (
                <div className="p-4 text-center text-anthrazit-400 text-xs flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span>Lade Live-Daten...</span>
                </div>
              ) : departures.length === 0 ? (
                <div className="p-3 bg-anthrazit-950 border border-anthrazit-800 text-center text-anthrazit-500 text-xs">
                  Keine aktuellen Abfahrten gemeldet.
                </div>
              ) : (
                <div className="space-y-1 max-h-56 overflow-y-auto overscroll-contain pr-1">
                  {departures.map((dep, idx) => {
                    const isDelayed = dep.delayMinutes > 0;
                    return (
                      <div
                        key={dep.tripId + idx}
                        className="p-1.5 bg-anthrazit-950 border border-anthrazit-800 flex items-center justify-between text-xs hover:border-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2 min-w-0 pr-1">
                          <span className={`px-1.5 py-0.5 font-mono font-bold text-[11px] shrink-0 ${
                            dep.line.includes('Stadtbahn') || dep.type === 'subway'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : dep.line.includes('S-Bahn') || dep.type === 'regional'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-accent/20 text-accent border border-accent/40'
                          }`}>
                            {dep.line}
                          </span>
                          <span className="text-anthrazit-200 truncate">{dep.direction}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-anthrazit-100">{dep.when}</div>
                          {dep.cancelled ? (
                            <span className="text-[10px] text-red-400 font-bold">Fällt aus</span>
                          ) : isDelayed ? (
                            <span className="text-[10px] text-accent font-bold">+{dep.delayMinutes}m</span>
                          ) : (
                            <span className="text-[10px] text-emerald-400">Pünktlich</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-anthrazit-950 border border-anthrazit-800 text-center text-anthrazit-500 text-xs">
              Klicke oben auf eine Haltestelle in der Linie oder nutze die Suche.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
