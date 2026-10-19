import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Train, 
  ArrowRightLeft, 
  MapPin, 
  Clock, 
  X, 
  RefreshCw, 
  Search, 
  Loader2,
  Bus,
  Compass,
  Ship,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { TransitLineRoute, HANNOVER_TRANSIT_ROUTES, HAMBURG_TRANSIT_ROUTES } from '../data/transitRoutes';
import { 
  HANNOVER_SCHEDULES, 
  HAMBURG_SCHEDULES, 
  LineSchedule, 
  ScheduleStopItem,
  generateStationTimetable 
} from '../data/transitSchedules';
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
  onOpenLiveDelays?: () => void;
}

// Verkehrsmittel-Kategorien
type TransitMode = 'METRO' | 'SBAHN' | 'REGIO' | 'BUS' | 'FERRY';

export const TransitCockpit: React.FC<TransitCockpitProps> = ({
  activeCity,
  isOpen,
  onClose,
  activeRoute,
  onSelectRoute,
  selectedTransitStop,
  onSelectTransitStop,
  onFlyToStation,
  onOpenLiveDelays
}) => {
  const isHamburg = activeCity === 'HH';
  const schedulesMap = isHamburg ? HAMBURG_SCHEDULES : HANNOVER_SCHEDULES;
  const linesList = Object.values(schedulesMap);

  // Haupt-Tab: 'GUIDED' (Geführte Linien-Navigation) oder 'DIRECT' (Direkt-Auskunft & Schnellsuche)
  const [cockpitTab, setCockpitTab] = useState<'GUIDED' | 'DIRECT'>('GUIDED');

  // Stepper-Status (Schritt 1 bis 4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Gewähltes Verkehrsmittel in Schritt 1
  const [selectedMode, setSelectedMode] = useState<TransitMode>(isHamburg ? 'METRO' : 'METRO');
  
  // Gewählte Linie in Schritt 2
  const [selectedLineRef, setSelectedLineRef] = useState<string>(isHamburg ? 'U3' : '6');
  
  // Gewählte Richtung & Haltestelle in Schritt 3
  const [selectedDirection, setSelectedDirection] = useState<'A' | 'B'>('A');

  // Timetable-View-Toggle in Schritt 4 ('LIVE' vs 'AUSHANG')
  const [timetableSubTab, setTimetableSubTab] = useState<'LIVE' | 'AUSHANG'>('LIVE');
  const [timetableDayTab, setTimetableDayTab] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');

  // Live Departures State
  const [departures, setDepartures] = useState<LiveDeparture[]>([]);
  const [loadingDepartures, setLoadingDepartures] = useState<boolean>(false);

  // Quick Station Search within Cockpit (Direkt-Auskunft)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TransitStop[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync category & line when activeCity changes
  useEffect(() => {
    if (activeCity === 'HH') {
      setSelectedMode('METRO');
      setSelectedLineRef('U3');
    } else {
      setSelectedMode('METRO');
      setSelectedLineRef('6');
    }
    setSelectedDirection('A');
    setCurrentStep(1);
  }, [activeCity]);

  // Synchronize when activeRoute changes from outside (e.g. map click)
  useEffect(() => {
    if (activeRoute && activeRoute.ref) {
      setSelectedLineRef(activeRoute.ref);
      // Determine mode
      if (activeRoute.ref.startsWith('U') || (!isHamburg && ['1','2','3','4','5','6','7','8','9','10','11','13','17'].includes(activeRoute.ref))) {
        setSelectedMode('METRO');
      } else if (activeRoute.ref.startsWith('S')) {
        setSelectedMode('SBAHN');
      } else if (activeRoute.ref.startsWith('RE') || activeRoute.ref.startsWith('RB') || activeRoute.ref.startsWith('A')) {
        setSelectedMode('REGIO');
      } else if (['61', '62', '72', '73', '75'].includes(activeRoute.ref)) {
        setSelectedMode('FERRY');
      } else {
        setSelectedMode('BUS');
      }
    }
  }, [activeRoute, isHamburg]);

  // Verkehrsmittel-Kacheln für Schritt 1
  const availableModes: { id: TransitMode; label: string; subLabel: string; icon: React.ReactNode; color: string }[] = useMemo(() => {
    const list: { id: TransitMode; label: string; subLabel: string; icon: React.ReactNode; color: string }[] = [
      {
        id: 'METRO',
        label: isHamburg ? 'U-Bahn' : 'Stadtbahn',
        subLabel: isHamburg ? 'Hochbahn U1-U4' : 'ÜSTRA Linien 1-17',
        icon: <Train className="w-4 h-4" />,
        color: 'border-blue-500/40 text-blue-400'
      },
      {
        id: 'SBAHN',
        label: 'S-Bahn',
        subLabel: isHamburg ? 'S-Bahn Hamburg S1-S5' : 'S-Bahn Hannover S1-S51',
        icon: <Train className="w-4 h-4" />,
        color: 'border-emerald-500/40 text-emerald-400'
      },
      {
        id: 'REGIO',
        label: 'Regio / DB',
        subLabel: isHamburg ? 'Regionalbahn & AKN' : 'Regional-Express & DB Regio',
        icon: <Train className="w-4 h-4" />,
        color: 'border-red-500/40 text-red-400'
      },
      {
        id: 'BUS',
        label: 'Bus',
        subLabel: isHamburg ? 'Metrobus & Schnellbus' : 'ÜSTRA Stadt- & SprintH-Busse',
        icon: <Bus className="w-4 h-4" />,
        color: 'border-lime-500/40 text-lime-400'
      }
    ];

    if (isHamburg) {
      list.push({
        id: 'FERRY',
        label: 'HADAG Fähre',
        subLabel: 'Hafen- & Elbfähren 61, 62, 72, 73, 75',
        icon: <Ship className="w-4 h-4" />,
        color: 'border-cyan-500/40 text-cyan-400'
      });
    }

    return list;
  }, [isHamburg]);

  // Filter Linien basierend auf ausgewähltem Verkehrsmittel
  const linesForSelectedMode = useMemo(() => {
    return linesList.filter(l => {
      if (selectedMode === 'METRO') {
        if (isHamburg) return l.stammstrecke === 'U' || l.lineRef.startsWith('U');
        return ['A', 'B', 'C', 'D'].includes(l.stammstrecke || '');
      }
      if (selectedMode === 'SBAHN') {
        return l.stammstrecke === 'S' || l.lineRef.startsWith('S');
      }
      if (selectedMode === 'REGIO') {
        return l.stammstrecke === 'R' || l.lineRef.startsWith('RE') || l.lineRef.startsWith('RB') || l.lineRef.startsWith('A');
      }
      if (selectedMode === 'BUS') {
        return l.stammstrecke === 'BUS';
      }
      if (selectedMode === 'FERRY') {
        return l.stammstrecke === 'F' || ['61', '62', '72', '73', '75'].includes(l.lineRef);
      }
      return false;
    });
  }, [linesList, selectedMode, isHamburg]);

  const activeSchedule: LineSchedule = schedulesMap[selectedLineRef] || linesList[0];
  const activeDir = selectedDirection === 'A' ? activeSchedule?.directionA : activeSchedule?.directionB;

  // Station auswählen & zur Station fliegen
  const handleSelectStopItem = (stopItem: ScheduleStopItem, advanceToStep4 = true) => {
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
        type: activeSchedule?.lineName || 'ÖPNV'
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
        type: activeSchedule?.lineName || 'ÖPNV'
      };
    }

    onSelectTransitStop(stopObj);
    onFlyToStation(stopObj.lat, stopObj.lng, stopObj.name);

    if (advanceToStep4) {
      setCurrentStep(4);
    }
  };

  // Schritt 1 -> 2: Verkehrsmittel wählen
  const handleSelectMode = (mode: TransitMode) => {
    setSelectedMode(mode);
    setCurrentStep(2);
    // Falls aktuelle Linie nicht im neuen Mode liegt, nimm die erste Linie des neuen Mode
    const candidateLines = linesList.filter(l => {
      if (mode === 'METRO') {
        return isHamburg ? (l.stammstrecke === 'U' || l.lineRef.startsWith('U')) : ['A', 'B', 'C', 'D'].includes(l.stammstrecke || '');
      }
      if (mode === 'SBAHN') return l.stammstrecke === 'S' || l.lineRef.startsWith('S');
      if (mode === 'REGIO') return l.stammstrecke === 'R' || l.lineRef.startsWith('RE') || l.lineRef.startsWith('RB') || l.lineRef.startsWith('A');
      if (mode === 'BUS') return l.stammstrecke === 'BUS';
      if (mode === 'FERRY') return l.stammstrecke === 'F' || ['61', '62', '72', '73', '75'].includes(l.lineRef);
      return false;
    });
    if (candidateLines.length > 0 && !candidateLines.find(c => c.lineRef === selectedLineRef)) {
      handleSelectLine(candidateLines[0].lineRef, false);
    }
  };

  // Schritt 2 -> 3: Linie wählen
  const handleSelectLine = async (lineRef: string, advanceToStep3 = true) => {
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

    if (advanceToStep3) {
      setCurrentStep(3);
    }
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

  // Find stop offset for active station to generate Timetable
  const currentStopItem: ScheduleStopItem = useMemo(() => {
    if (!activeDir || !activeDir.stops) return { stopName: 'Station', minuteOffset: 0 };
    if (!selectedTransitStop) return activeDir.stops[0];
    return (
      activeDir.stops.find(s =>
        s.stopName.toLowerCase().includes(selectedTransitStop.name.toLowerCase()) ||
        selectedTransitStop.name.toLowerCase().includes(s.stopName.toLowerCase())
      ) || activeDir.stops[0]
    );
  }, [activeDir, selectedTransitStop]);

  const stationTimetable = useMemo(() => {
    return generateStationTimetable(currentStopItem.minuteOffset, activeSchedule?.operatingHours?.nightService ?? true);
  }, [currentStopItem, activeSchedule]);

  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-[410px] lg:w-[430px] h-full bg-anthrazit-950 border-l border-anthrazit-800 flex flex-col shrink-0 select-none z-20 font-mono text-xs overflow-hidden">
      {/* Cockpit Top Bar */}
      <div className="h-12 border-b border-anthrazit-800 px-3 bg-anthrazit-900 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Train className="w-4 h-4 text-accent" />
          <span className="font-bold text-xs uppercase tracking-wider text-anthrazit-100">
            Fahrplan & Auskunft
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

      {/* Haupt-Tabs: Geführte Navigation vs Direkt-Auskunft */}
      <div className="flex border-b border-anthrazit-800 bg-anthrazit-900/60 p-1.5 gap-1.5 shrink-0">
        <button
          onClick={() => setCockpitTab('GUIDED')}
          className={`flex-1 py-1.5 px-2 text-center text-[11px] font-bold tracking-tight uppercase transition-all cursor-pointer border flex items-center justify-center space-x-1.5 ${
            cockpitTab === 'GUIDED'
              ? 'bg-accent text-anthrazit-950 border-accent font-black shadow-sm'
              : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-anthrazit-200 hover:border-anthrazit-700'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Geführte Linien-Navigation</span>
        </button>

        <button
          onClick={() => setCockpitTab('DIRECT')}
          className={`flex-1 py-1.5 px-2 text-center text-[11px] font-bold tracking-tight uppercase transition-all cursor-pointer border flex items-center justify-center space-x-1.5 ${
            cockpitTab === 'DIRECT'
              ? 'bg-accent text-anthrazit-950 border-accent font-black shadow-sm'
              : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-anthrazit-200 hover:border-anthrazit-700'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Direkt-Auskunft</span>
        </button>
      </div>

      {/* Main Body - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3">
        {/* ========================================================
            MODUS 1: GEFÜHRTE LINIE-NAVIGATION (STEPPER WIZARD)
            ======================================================== */}
        {cockpitTab === 'GUIDED' && (
          <div className="space-y-3">
            {/* Stepper Breadcrumb / Fortschrittsleiste */}
            <div className="bg-anthrazit-900 border border-anthrazit-800 p-2">
              <div className="text-[10px] text-anthrazit-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center justify-between">
                <span>Ablauf-Assistent:</span>
                <span className="text-accent font-bold">Schritt {currentStep} von 4</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { step: 1, label: '1. Modus', val: availableModes.find(m => m.id === selectedMode)?.label },
                  { step: 2, label: '2. Linie', val: activeSchedule ? activeSchedule.lineRef : '-' },
                  { step: 3, label: '3. Halt', val: selectedTransitStop ? selectedTransitStop.name : '-' },
                  { step: 4, label: '4. Plan', val: 'Zeiten' }
                ].map((s) => {
                  const isCurrent = currentStep === s.step;
                  const isPassed = currentStep > s.step;
                  return (
                    <button
                      key={s.step}
                      onClick={() => setCurrentStep(s.step as 1 | 2 | 3 | 4)}
                      className={`text-left p-1 border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-accent/20 border-accent text-accent font-bold'
                          : isPassed
                          ? 'bg-anthrazit-950 border-anthrazit-700 text-anthrazit-300 hover:border-accent/60'
                          : 'bg-anthrazit-950/40 border-anthrazit-850 text-anthrazit-600'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-tighter truncate">{s.label}</div>
                      <div className="text-[10px] font-bold truncate text-anthrazit-100">
                        {s.val}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SCHRITT 1: VERKEHRSMITTEL WÄHLEN */}
            {currentStep === 1 && (
              <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-anthrazit-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 bg-accent text-anthrazit-950 font-black text-[10px]">
                      SCHRITT 1
                    </span>
                    <span className="font-bold text-xs uppercase text-anthrazit-100">
                      Verkehrsmittel wählen
                    </span>
                  </div>
                  <span className="text-[10px] text-anthrazit-500">Klick öffnet Schritt 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {availableModes.map((mode) => {
                    const isSelected = selectedMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleSelectMode(mode.id)}
                        className={`p-2.5 border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                          isSelected
                            ? 'bg-accent/15 border-accent text-accent font-bold shadow-accent-sm'
                            : `bg-anthrazit-950 ${mode.color} hover:border-accent hover:text-accent`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {mode.icon}
                            <span className="font-bold text-xs text-anthrazit-100">{mode.label}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-anthrazit-500" />
                        </div>
                        <div className="text-[10px] text-anthrazit-400 line-clamp-1">
                          {mode.subLabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCHRITT 2: LINIENAUSWAHL */}
            {currentStep === 2 && (
              <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-anthrazit-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 bg-accent text-anthrazit-950 font-black text-[10px]">
                      SCHRITT 2
                    </span>
                    <span className="font-bold text-xs uppercase text-anthrazit-100">
                      Linie wählen ({availableModes.find(m => m.id === selectedMode)?.label})
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-[10px] text-accent hover:underline cursor-pointer"
                  >
                    ← Modus ändern
                  </button>
                </div>

                <div className="space-y-1.5 pt-1 max-h-80 overflow-y-auto pr-1">
                  {linesForSelectedMode.length === 0 ? (
                    <div className="p-3 text-center text-anthrazit-500 text-xs">
                      Keine Linien in dieser Kategorie vorhanden.
                    </div>
                  ) : (
                    linesForSelectedMode.map((line) => {
                      const isSelected = selectedLineRef === line.lineRef;
                      const isLineCanceled = line.isDisrupted && line.disruptionType === 'CANCELED';

                      return (
                        <button
                          key={line.lineRef}
                          onClick={() => handleSelectLine(line.lineRef, true)}
                          className={`w-full p-2 border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-accent/20 border-accent shadow-sm'
                              : isLineCanceled
                              ? 'bg-red-950/20 border-red-900/60 hover:border-red-600'
                              : 'bg-anthrazit-950 border-anthrazit-800 hover:border-accent/60'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                            <span 
                              className="px-2 py-1 font-mono font-black text-xs shrink-0 text-anthrazit-950"
                              style={{ backgroundColor: line.color || '#ff8000' }}
                            >
                              {line.lineRef}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-xs font-bold truncate ${isLineCanceled ? 'line-through text-red-300' : 'text-anthrazit-100'}`}>
                                  {line.directionA?.origin} ⇄ {line.directionA?.destination}
                                </span>
                                {isLineCanceled && (
                                  <span className="px-1.5 py-0.5 bg-red-600 text-white font-mono font-black text-[9px] shrink-0 tracking-wider">
                                    AUSFALL
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-anthrazit-400 truncate">
                                {line.corridorName}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 text-[10px] text-accent font-bold">
                            {isLineCanceled ? (
                              <span className="text-red-400 font-bold">SEV aktiv</span>
                            ) : (
                              <span>{line.directionA?.stops.length || 0} Halte</span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* SCHRITT 3: RICHTUNG & HALTESTELLE WÄHLEN */}
            {currentStep === 3 && activeSchedule && (
              <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
                {/* PROMINENTER AUSFALL-BANNER FÜR S2 ODER ÄHNLICHE DISRUPTED LINES */}
                {activeSchedule.isDisrupted && (
                  <div className="p-2.5 bg-red-950/80 border-2 border-red-600 text-white space-y-2 animate-in fade-in">
                    <div className="flex items-start space-x-2">
                      <span className="text-base shrink-0">🚨</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs uppercase tracking-wider text-red-200">
                          BAUARBEITEN / GESAMTAUSFALL: Die {activeSchedule.lineRef} entfällt aktuell vollständig.
                        </div>
                        <div className="text-[11px] text-red-300 mt-0.5">
                          {activeSchedule.disruptionNotice || 'Ersatzverkehr mit Bussen (S2EV) ist eingerichtet.'}
                        </div>
                      </div>
                    </div>

                    {/* 1-Klick-Button zum Wechsel auf Ersatzverkehr falls vorhanden */}
                    {schedulesMap[`${activeSchedule.lineRef}EV`] && (
                      <button
                        onClick={() => handleSelectLine(`${activeSchedule.lineRef}EV`, true)}
                        className="w-full py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer uppercase tracking-wider transition-colors shadow-md"
                      >
                        <span>➔ Zu {activeSchedule.lineRef}EV wechseln</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Linien-Header mit Schnellnavigation zurück */}
                <div className="flex items-center justify-between pb-1.5 border-b border-anthrazit-800">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span 
                      className="px-2 py-0.5 font-mono font-bold text-xs text-anthrazit-950 shrink-0"
                      style={{ backgroundColor: activeSchedule.color || '#ff8000' }}
                    >
                      {activeSchedule.lineRef}
                    </span>
                    <span className="font-bold text-xs text-anthrazit-100 truncate">
                      {activeSchedule.lineName}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-[10px] text-accent hover:underline cursor-pointer shrink-0"
                  >
                    ← Andere Linie
                  </button>
                </div>

                {/* Richtungs-Umschalter */}
                <div className="flex items-center justify-between bg-anthrazit-950 p-1.5 border border-anthrazit-800">
                  <div className="min-w-0 pr-1">
                    <div className="text-[9px] uppercase tracking-wider text-anthrazit-400">Fahrtrichtung:</div>
                    <div className="text-xs font-bold text-anthrazit-100 truncate">
                      ➔ {activeDir?.destination || 'Endstation'}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDirection(selectedDirection === 'A' ? 'B' : 'A')}
                    className="px-2 py-1 bg-anthrazit-900 hover:bg-anthrazit-800 border border-anthrazit-700 text-accent font-bold text-[10px] flex items-center space-x-1 cursor-pointer shrink-0"
                    title="Gegenrichtung ansehen"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Richtung wechseln</span>
                  </button>
                </div>

                {/* Haltestellen-Liste mit Fahrzeit-Offset */}
                <div className="space-y-1 max-h-72 overflow-y-auto overscroll-contain pr-1 pt-1">
                  <div className="text-[10px] text-anthrazit-400 uppercase tracking-wider px-1">
                    Haltestelle wählen ({activeDir?.stops.length || 0} Stationen):
                  </div>

                  {activeDir?.stops.map((stop, idx) => {
                    const isOrigin = idx === 0;
                    const isDestination = idx === activeDir.stops.length - 1;
                    const isSelected = selectedTransitStop?.name.toLowerCase().includes(stop.stopName.toLowerCase()) ||
                      stop.stopName.toLowerCase().includes(selectedTransitStop?.name.toLowerCase() || '___');

                    const isSkippedOrNotice = stop.notice && (
                      stop.notice.toLowerCase().includes('entfällt') ||
                      stop.notice.toLowerCase().includes('ausfall') ||
                      stop.notice.toLowerCase().includes('baustelle') ||
                      stop.notice.toLowerCase().includes('sev') ||
                      stop.notice.toLowerCase().includes('gesperrt')
                    );

                    return (
                      <div
                        key={stop.stopName + idx}
                        onClick={() => handleSelectStopItem(stop, true)}
                        className={`px-2 py-1.5 border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isSkippedOrNotice
                            ? 'bg-red-950/30 border-red-800/80 hover:border-red-600'
                            : isSelected
                            ? 'bg-accent/20 border-accent text-accent font-bold shadow-sm'
                            : isOrigin || isDestination
                            ? 'bg-anthrazit-950 border-anthrazit-700 text-anthrazit-100 hover:border-accent hover:text-accent'
                            : 'bg-anthrazit-950/70 border-anthrazit-850 text-anthrazit-300 hover:border-anthrazit-700 hover:text-anthrazit-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 pr-1">
                          <span className={`w-4 h-4 flex items-center justify-center text-[10px] font-mono shrink-0 ${
                            isSkippedOrNotice
                              ? 'bg-red-600 text-white font-bold'
                              : isSelected
                              ? 'bg-accent text-anthrazit-950 font-bold'
                              : 'bg-anthrazit-800 text-anthrazit-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`truncate text-xs ${isSkippedOrNotice ? 'line-through text-red-300 font-medium' : ''}`}>
                            {stop.stopName}
                          </span>
                          {isSkippedOrNotice && (
                            <span className="px-1 py-0.2 bg-red-600 text-white font-bold text-[9px] shrink-0 uppercase">
                              [HALT ENTFÄLLT]
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0 pl-1">
                          <span className={`text-[10px] font-bold ${isSkippedOrNotice ? 'text-red-400' : 'text-accent'}`}>
                            +{stop.minuteOffset}m
                          </span>
                          {stop.isHighPlatform && (
                            <span className="text-[9px] text-emerald-400" title="Barrierefreier Hochbahnsteig">
                              ♿
                            </span>
                          )}
                          <ChevronRight className="w-3 h-3 text-anthrazit-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCHRITT 4: ABFAHRTSZEITEN & FAHRPLAN */}
            {currentStep === 4 && (
              <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
                {/* Header Station & Schnellwechsel */}
                <div className="flex items-center justify-between pb-1.5 border-b border-anthrazit-800">
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="font-bold text-xs uppercase text-anthrazit-100 truncate">
                        {selectedTransitStop?.name || currentStopItem.stopName}
                      </span>
                    </div>
                    <div className="text-[10px] text-anthrazit-400 truncate">
                      Linie {activeSchedule?.lineRef} ➔ {activeDir?.destination}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-2 py-1 bg-anthrazit-950 hover:bg-anthrazit-850 border border-anthrazit-700 text-accent font-bold text-[10px] cursor-pointer"
                      title="Station wechseln"
                    >
                      Station wechseln
                    </button>
                    {selectedTransitStop && (
                      <button
                        onClick={() => loadDepartures(selectedTransitStop)}
                        disabled={loadingDepartures}
                        className="p-1 hover:bg-anthrazit-800 text-accent border border-anthrazit-700 cursor-pointer"
                        title="Live-Daten aktualisieren"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingDepartures ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Tabs: Live-Abfahrtstafel vs Aushangfahrplan */}
                <div className="flex border-b border-anthrazit-800 pb-1.5 gap-1">
                  <button
                    onClick={() => setTimetableSubTab('LIVE')}
                    className={`flex-1 py-1 text-center text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                      timetableSubTab === 'LIVE'
                        ? 'bg-accent text-anthrazit-950 border-accent'
                        : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-anthrazit-200'
                    }`}
                  >
                    Live-Abfahrten (Echtzeit)
                  </button>
                  <button
                    onClick={() => setTimetableSubTab('AUSHANG')}
                    className={`flex-1 py-1 text-center text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                      timetableSubTab === 'AUSHANG'
                        ? 'bg-accent text-anthrazit-950 border-accent'
                        : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-anthrazit-200'
                    }`}
                  >
                    Aushangfahrplan (Soll)
                  </button>
                </div>

                {/* TAB 1: LIVE-ABFAHRTEN */}
                {timetableSubTab === 'LIVE' && (
                  <div className="space-y-1.5">
                    {loadingDepartures && departures.length === 0 ? (
                      <div className="p-4 text-center text-anthrazit-400 text-xs flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <span>Lade Echtzeit-Abfahrten...</span>
                      </div>
                    ) : departures.length === 0 ? (
                      <div className="p-3 bg-anthrazit-950 border border-anthrazit-800 text-center text-anthrazit-400 text-xs">
                        Aktuell keine Live-Abfahrten im Schnittstellen-Feed gemeldet.
                        <div className="mt-1 text-[10px] text-accent">
                          Prüfe den Reiter „Aushangfahrplan (Soll)“ für planmäßige Abfahrten.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-64 overflow-y-auto overscroll-contain pr-1">
                        {departures.map((dep, idx) => {
                          const isDelayed = dep.delayMinutes > 0;
                          const isCanceled = dep.cancelled;
                          return (
                            <div
                              key={dep.tripId + idx}
                              className={`p-1.5 border flex items-center justify-between text-xs transition-colors ${
                                isCanceled
                                  ? 'bg-red-950/25 border-red-800/80 hover:border-red-600'
                                  : 'bg-anthrazit-950 border-anthrazit-800 hover:border-accent/50'
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0 pr-1">
                                <span className={`px-1.5 py-0.5 font-mono font-bold text-[11px] shrink-0 ${
                                  isCanceled
                                    ? 'bg-red-600 text-white line-through font-extrabold'
                                    : dep.line.includes('Stadtbahn') || dep.type === 'subway'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                    : dep.line.includes('S-Bahn') || dep.type === 'regional'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-accent/20 text-accent border border-accent/40'
                                }`}>
                                  {dep.line}
                                </span>
                                <span className={`text-anthrazit-200 truncate ${isCanceled ? 'line-through text-red-300' : ''}`}>
                                  {dep.direction}
                                </span>
                              </div>

                              <div className="text-right shrink-0">
                                <div className={`font-bold ${isCanceled ? 'text-red-400 line-through' : 'text-anthrazit-100'}`}>
                                  {dep.when}
                                </div>
                                {isCanceled ? (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-red-600 text-white font-extrabold uppercase">
                                    [Fahrt fällt aus]
                                  </span>
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
                )}

                {/* TAB 2: AUSHANGFAHRPLAN (MATRIX-FAHRPLAN) */}
                {timetableSubTab === 'AUSHANG' && (
                  <div className="space-y-2">
                    {/* Wochentag Umschalter */}
                    <div className="flex space-x-1 border border-anthrazit-800 p-0.5 bg-anthrazit-950">
                      {(['weekday', 'saturday', 'sunday'] as const).map((dayKey) => (
                        <button
                          key={dayKey}
                          onClick={() => setTimetableDayTab(dayKey)}
                          className={`flex-1 py-1 text-center text-[10px] font-bold cursor-pointer transition-colors ${
                            timetableDayTab === dayKey
                              ? 'bg-accent text-anthrazit-950 font-black'
                              : 'text-anthrazit-400 hover:text-anthrazit-100'
                          }`}
                        >
                          {dayKey === 'weekday' ? 'Mo - Fr' : dayKey === 'saturday' ? 'Samstag' : 'So / Feiertag'}
                        </button>
                      ))}
                    </div>

                    {/* Stundentakt-Tabelle */}
                    <div className="max-h-60 overflow-y-auto overscroll-contain pr-1 border border-anthrazit-800">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-anthrazit-950 text-anthrazit-400 border-b border-anthrazit-800">
                            <th className="py-1 px-2 w-12 font-bold border-r border-anthrazit-800">Uhr</th>
                            <th className="py-1 px-2 font-bold">Abfahrtsminuten</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stationTimetable.map((row) => {
                            const mins = timetableDayTab === 'weekday' 
                              ? row.minutesWeekday 
                              : timetableDayTab === 'saturday' 
                              ? row.minutesSaturday 
                              : row.minutesSunday;

                            if (mins.length === 0) return null;

                            return (
                              <tr key={row.hour} className="border-b border-anthrazit-850/60 hover:bg-anthrazit-850/40">
                                <td className="py-1 px-2 font-bold text-accent border-r border-anthrazit-800 text-center">
                                  {row.hour.toString().padStart(2, '0')}
                                </td>
                                <td className="py-1 px-2">
                                  <div className="flex flex-wrap gap-1">
                                    {mins.map((m, mIdx) => (
                                      <span
                                        key={mIdx}
                                        className="px-1 py-0.2 bg-anthrazit-950 border border-anthrazit-700 text-anthrazit-200 font-mono text-[10px]"
                                      >
                                        {m.toString().padStart(2, '0')}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Takt-Info Fußzeile */}
                    <div className="bg-anthrazit-950 p-1.5 border border-anthrazit-800 text-[10px] text-anthrazit-400 flex items-center justify-between">
                      <span>Takt: <strong>{activeSchedule?.frequency?.peak || '10 Min.'}</strong></span>
                      <span>Betrieb: <strong>{activeSchedule?.operatingHours?.firstTrain} – {activeSchedule?.operatingHours?.lastTrain}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            MODUS 2: DIREKT-AUSKUNFT (SCHNELLSUCHE NACH STATION)
            ======================================================== */}
        {cockpitTab === 'DIRECT' && (
          <div className="space-y-3">
            {/* Suchfeld */}
            <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-anthrazit-800">
                <div className="flex items-center space-x-1.5">
                  <Search className="w-3.5 h-3.5 text-accent" />
                  <span className="font-bold text-xs uppercase text-anthrazit-100">
                    Station / Haltestelle suchen
                  </span>
                </div>
                <span className="text-[10px] text-anthrazit-500">Live-Suchindex</span>
              </div>

              <div ref={searchRef} className="relative">
                <div className="flex items-center bg-anthrazit-950 border border-anthrazit-700 px-2 py-1.5 focus-within:border-accent">
                  <Search className="w-3.5 h-3.5 text-anthrazit-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Station eintippen (z.B. Hauptbahnhof, Kröpcke, Altona)..."
                    value={searchQuery}
                    onFocus={() => setIsSearchOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    className="w-full bg-transparent text-xs text-anthrazit-100 placeholder-anthrazit-500 focus:outline-none font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-anthrazit-400 hover:text-anthrazit-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown-Ergebnisse */}
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 max-h-56 overflow-y-auto bg-anthrazit-900 border border-anthrazit-700 shadow-2xl p-1 space-y-1">
                    {searchResults.map((stop) => (
                      <div
                        key={stop.id}
                        onClick={() => {
                          onSelectTransitStop(stop);
                          onFlyToStation(stop.lat, stop.lng, stop.name);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-anthrazit-800 cursor-pointer flex items-center justify-between text-xs border border-transparent hover:border-anthrazit-700"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="text-anthrazit-100 font-bold truncate">{stop.name}</span>
                        </div>
                        <span className="text-[10px] text-accent font-mono shrink-0 pl-1">{stop.type || 'ÖPNV'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ausgewählte Haltestelle & Abfahrtstafel */}
            <div className="space-y-2 bg-anthrazit-900 border border-anthrazit-800 p-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-anthrazit-800">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="font-bold text-xs uppercase text-anthrazit-100 truncate">
                    Abfahrtstafel: {selectedTransitStop?.name || 'Keine Station gewählt'}
                  </span>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {onOpenLiveDelays && (
                    <button
                      onClick={onOpenLiveDelays}
                      className="px-2 py-0.5 bg-accent/20 hover:bg-accent/30 border border-accent/60 text-accent font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                      title="GTFS-RT Verspätungszentrale öffnen"
                    >
                      <span>⚠️ Verspätungen</span>
                    </button>
                  )}
                  {selectedTransitStop && (
                    <button
                      onClick={() => loadDepartures(selectedTransitStop)}
                      disabled={loadingDepartures}
                      className="p-1 hover:bg-anthrazit-800 text-accent border border-anthrazit-700 cursor-pointer"
                      title="Live-Daten aktualisieren"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingDepartures ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {selectedTransitStop ? (
                <div className="space-y-1.5 pt-1">
                  {loadingDepartures && departures.length === 0 ? (
                    <div className="p-4 text-center text-anthrazit-400 text-xs flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span>Lade Echtzeit-Abfahrten...</span>
                    </div>
                  ) : departures.length === 0 ? (
                    <div className="p-3 bg-anthrazit-950 border border-anthrazit-800 text-center text-anthrazit-500 text-xs">
                      Keine aktuellen Abfahrten gemeldet.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-72 overflow-y-auto overscroll-contain pr-1">
                      {departures.map((dep, idx) => {
                        const isDelayed = dep.delayMinutes > 0;
                        const isCanceled = dep.cancelled;
                        return (
                          <div
                            key={dep.tripId + idx}
                            className={`p-1.5 border flex items-center justify-between text-xs transition-colors ${
                              isCanceled
                                ? 'bg-red-950/25 border-red-800/80 hover:border-red-600'
                                : 'bg-anthrazit-950 border-anthrazit-800 hover:border-accent/50'
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0 pr-1">
                              <span className={`px-1.5 py-0.5 font-mono font-bold text-[11px] shrink-0 ${
                                isCanceled
                                  ? 'bg-red-600 text-white line-through font-extrabold'
                                  : dep.line.includes('Stadtbahn') || dep.type === 'subway'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                  : dep.line.includes('S-Bahn') || dep.type === 'regional'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-accent/20 text-accent border border-accent/40'
                              }`}>
                                {dep.line}
                              </span>
                              <span className={`text-anthrazit-200 truncate ${isCanceled ? 'line-through text-red-300' : ''}`}>
                                {dep.direction}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <div className={`font-bold ${isCanceled ? 'text-red-400 line-through' : 'text-anthrazit-100'}`}>
                                {dep.when}
                              </div>
                              {isCanceled ? (
                                <span className="px-1.5 py-0.2 text-[9px] bg-red-600 text-white font-extrabold uppercase">
                                  [Fahrt fällt aus]
                                </span>
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
                <div className="p-4 bg-anthrazit-950 border border-anthrazit-800 text-center text-anthrazit-400 text-xs space-y-2">
                  <div>Nutze die Schnellsuche oben oder wechsle zur „Geführten Linien-Navigation“.</div>
                  <button
                    onClick={() => setCockpitTab('GUIDED')}
                    className="px-3 py-1.5 bg-accent text-anthrazit-950 font-bold uppercase text-[10px] cursor-pointer inline-flex items-center space-x-1"
                  >
                    <span>Zur geführten Navigation</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
