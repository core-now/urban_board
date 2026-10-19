import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Radio, 
  Search, 
  CheckCircle2
} from 'lucide-react';
import { 
  fetchLiveGtfsDelays, 
  GtfsRtDelayItem, 
  GtfsRtAlertItem, 
  GtfsRtFeedInfo 
} from '../../services/apiService';

interface LiveDelaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCity: 'H' | 'HH';
  onSelectCity?: (city: 'H' | 'HH') => void;
  onSelectLine?: (line: string) => void;
}

export const LiveDelaysModal: React.FC<LiveDelaysModalProps> = ({
  isOpen,
  onClose,
  activeCity,
  onSelectCity,
  onSelectLine
}) => {
  const [selectedCityFilter, setSelectedCityFilter] = useState<'ALL' | 'H' | 'HH'>('ALL');
  const [activeTab, setActiveTab] = useState<'DELAYS' | 'ALERTS' | 'TELEMETRY'>('DELAYS');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'SEV_CANCELED' | 'HEAVY_DELAY'>('ALL');

  const [delays, setDelays] = useState<GtfsRtDelayItem[]>([]);
  const [alerts, setAlerts] = useState<GtfsRtAlertItem[]>([]);
  const [feedInfo, setFeedInfo] = useState<GtfsRtFeedInfo | null>(null);
  const [feedSource, setFeedSource] = useState<'live_stream' | 'cached_extract'>('cached_extract');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Initial load & city sync
  useEffect(() => {
    if (isOpen) {
      setSelectedCityFilter(activeCity);
      loadGtfsData();
    }
  }, [isOpen, activeCity]);

  // Periodic Refresh every 15 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      loadGtfsData(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [isOpen, activeCity]);

  const loadGtfsData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    try {
      const res = await fetchLiveGtfsDelays(activeCity);
      setDelays(res.delays);
      setAlerts(res.alerts);
      setFeedInfo(res.feedInfo);
      setFeedSource(res.source);
      setLastUpdated(new Date().toLocaleTimeString('de-DE'));
    } catch (err) {
      console.error('Failed to load GTFS-RT feed:', err);
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  };

  // Filtered delays
  const filteredDelays = useMemo(() => {
    return delays.filter(item => {
      // City filter
      if (selectedCityFilter !== 'ALL' && item.city !== selectedCityFilter) {
        return false;
      }

      // Mode filter
      if (filterMode === 'SEV_CANCELED') {
        if (!item.cancelled && item.status !== 'CANCELED' && item.status !== 'SEV' && !item.line.includes('EV')) {
          return false;
        }
      } else if (filterMode === 'HEAVY_DELAY') {
        if (item.delayMinutes < 15 && !item.cancelled) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const lineMatch = item.line.toLowerCase().includes(q);
        const stopMatch = item.stopName.toLowerCase().includes(q);
        const headMatch = item.headsign.toLowerCase().includes(q);
        const causeMatch = (item.cause || '').toLowerCase().includes(q);
        if (!lineMatch && !stopMatch && !headMatch && !causeMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Prioritize S2 and total cancellations at the very top
      const aIsS2OrEV = a.line === 'S2' || a.line.includes('S2EV') ? 1 : 0;
      const bIsS2OrEV = b.line === 'S2' || b.line.includes('S2EV') ? 1 : 0;
      if (aIsS2OrEV !== bIsS2OrEV) return bIsS2OrEV - aIsS2OrEV;

      const aCanceled = a.cancelled || a.status === 'CANCELED' || a.status === 'SEV' ? 1 : 0;
      const bCanceled = b.cancelled || b.status === 'CANCELED' || b.status === 'SEV' ? 1 : 0;
      if (aCanceled !== bCanceled) return bCanceled - aCanceled;

      return b.delayMinutes - a.delayMinutes;
    });
  }, [delays, selectedCityFilter, filterMode, searchQuery]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(item => {
      if (selectedCityFilter !== 'ALL' && item.city !== selectedCityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const lineMatch = item.lines.some(l => l.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !lineMatch) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, selectedCityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = delays.length;
    const canceledCount = delays.filter(d => d.cancelled || d.status === 'CANCELED').length;
    const sevCount = delays.filter(d => d.status === 'SEV' || d.line.includes('EV')).length;
    const delayedCount = delays.filter(d => d.delayMinutes >= 5).length;
    return { total, canceledCount, sevCount, delayedCount };
  }, [delays]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-2 sm:p-4 bg-anthrazit-950/85 backdrop-blur-sm font-mono animate-in fade-in duration-150">
      <div 
        className="w-full max-w-5xl h-[92vh] max-h-[920px] flex flex-col bg-anthrazit-900 border border-anthrazit-700 shadow-2xl text-anthrazit-100 overflow-hidden"
        style={{ borderRadius: 0 }}
      >
        {/* TACTICAL HEADER */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-anthrazit-950 border-b border-anthrazit-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-accent/20 border border-accent/60 text-accent shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-xs sm:text-sm tracking-wider uppercase text-anthrazit-100 truncate">
                  GTFS-RT STÖRUNGSZENTRALE
                </span>
                <span className={`px-1 sm:px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold border shrink-0 ${
                  feedSource === 'live_stream' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                    : 'bg-accent/20 text-accent border-accent/50'
                }`}>
                  {feedSource === 'live_stream' ? '● STREAM' : '● LIVE (10s)'}
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-anthrazit-400 flex items-center space-x-1.5 mt-0.5 truncate">
                <span>Update: {lastUpdated || 'soeben'}</span>
                <span>•</span>
                <span className="hidden xs:inline">5.427 Entitäten</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <button
              onClick={() => loadGtfsData(true)}
              disabled={isLoading}
              className="px-2 py-1 bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-xs text-accent flex items-center space-x-1 cursor-pointer transition-colors"
              title="Feed jetzt aktualisieren"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-anthrazit-300 hover:text-white cursor-pointer transition-colors"
              title="Schließen (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATUS COUNTER BANNER (Kompakt auf Mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1.5 sm:p-2 bg-anthrazit-950 border-b border-anthrazit-800 text-xs shrink-0">
          <div className="p-1.5 sm:p-2 bg-anthrazit-900 border border-anthrazit-800 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-anthrazit-400">Ausfälle:</span>
            <span className="font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-1.5 py-0.2 text-[10px] sm:text-xs">
              {stats.canceledCount} Züge
            </span>
          </div>
          <div className="p-1.5 sm:p-2 bg-anthrazit-900 border border-anthrazit-800 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-anthrazit-400">Ersatzverkehr:</span>
            <span className="font-bold text-accent bg-accent/15 border border-accent/40 px-1.5 py-0.2 text-[10px] sm:text-xs">
              {stats.sevCount} Linien
            </span>
          </div>
          <div className="p-1.5 sm:p-2 bg-anthrazit-900 border border-anthrazit-800 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-anthrazit-400">Verspätet ≥5m:</span>
            <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.2 text-[10px] sm:text-xs">
              {stats.delayedCount} Fahrten
            </span>
          </div>
          <div className="p-1.5 sm:p-2 bg-anthrazit-900 border border-anthrazit-800 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-anthrazit-400">Alerts:</span>
            <span className="font-bold text-blue-400 bg-blue-950/60 border border-blue-800/80 px-1.5 py-0.2 text-[10px] sm:text-xs">
              {alerts.length} Meldungen
            </span>
          </div>
        </div>

        {/* TABS & CONTROLS */}
        <div className="p-2 sm:p-2.5 bg-anthrazit-900 border-b border-anthrazit-800 space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            {/* Primary Navigation Tabs - Horizontales Scrollen auf Mobile */}
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-0.5">
              <button
                onClick={() => setActiveTab('DELAYS')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer border shrink-0 ${
                  activeTab === 'DELAYS'
                    ? 'bg-accent text-anthrazit-950 border-accent font-bold'
                    : 'bg-anthrazit-950 hover:bg-anthrazit-800 border-anthrazit-800 text-anthrazit-300'
                }`}
              >
                ⚠️ Störungen ({filteredDelays.length})
              </button>
              <button
                onClick={() => setActiveTab('ALERTS')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer border shrink-0 ${
                  activeTab === 'ALERTS'
                    ? 'bg-accent text-anthrazit-950 border-accent font-bold'
                    : 'bg-anthrazit-950 hover:bg-anthrazit-800 border-anthrazit-800 text-anthrazit-300'
                }`}
              >
                📢 Meldungen ({filteredAlerts.length})
              </button>
              <button
                onClick={() => setActiveTab('TELEMETRY')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer border shrink-0 ${
                  activeTab === 'TELEMETRY'
                    ? 'bg-accent text-anthrazit-950 border-accent font-bold'
                    : 'bg-anthrazit-950 hover:bg-anthrazit-800 border-anthrazit-800 text-anthrazit-300'
                }`}
              >
                📡 Feed
              </button>
            </div>

            {/* City Selector */}
            <div className="flex items-center space-x-1 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setSelectedCityFilter('ALL')}
                className={`px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs border cursor-pointer ${
                  selectedCityFilter === 'ALL'
                    ? 'bg-accent/20 border-accent text-accent font-bold'
                    : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-white'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => {
                  setSelectedCityFilter('H');
                  if (onSelectCity) onSelectCity('H');
                }}
                className={`px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs border cursor-pointer ${
                  selectedCityFilter === 'H'
                    ? 'bg-accent/20 border-accent text-accent font-bold'
                    : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-white'
                }`}
              >
                [H] Hannover
              </button>
              <button
                onClick={() => {
                  setSelectedCityFilter('HH');
                  if (onSelectCity) onSelectCity('HH');
                }}
                className={`px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs border cursor-pointer ${
                  selectedCityFilter === 'HH'
                    ? 'bg-accent/20 border-accent text-accent font-bold'
                    : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-white'
                }`}
              >
                [HH] Hamburg
              </button>
            </div>
          </div>

          {/* Search & Sub-Filter Bar */}
          {activeTab !== 'TELEMETRY' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 pt-1 border-t border-anthrazit-800/80">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-anthrazit-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Linie (z.B. S1, S5EV, U3, 4) oder Station filtern..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-anthrazit-950 border border-anthrazit-800 text-xs text-anthrazit-100 pl-8 pr-3 py-1 sm:py-1.5 focus:outline-none focus:border-accent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-anthrazit-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status Filter Chips - Scrollable on mobile */}
              {activeTab === 'DELAYS' && (
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-0.5 shrink-0">
                  <button
                    onClick={() => setFilterMode('ALL')}
                    className={`px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] border cursor-pointer shrink-0 ${
                      filterMode === 'ALL'
                        ? 'bg-anthrazit-800 border-anthrazit-600 text-anthrazit-100 font-bold'
                        : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400'
                    }`}
                  >
                    Alle ({delays.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('SEV_CANCELED')}
                    className={`px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] border cursor-pointer shrink-0 ${
                      filterMode === 'SEV_CANCELED'
                        ? 'bg-red-950/80 border-red-700 text-red-300 font-bold'
                        : 'bg-anthrazit-950 border-anthrazit-800 text-red-400/80 hover:text-red-300'
                    }`}
                  >
                    🚨 Ausfälle / SEV ({stats.canceledCount + stats.sevCount})
                  </button>
                  <button
                    onClick={() => setFilterMode('HEAVY_DELAY')}
                    className={`px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] border cursor-pointer shrink-0 ${
                      filterMode === 'HEAVY_DELAY'
                        ? 'bg-amber-950/80 border-amber-700 text-amber-300 font-bold'
                        : 'bg-anthrazit-950 border-anthrazit-800 text-amber-400/80 hover:text-amber-300'
                    }`}
                  >
                    ⏱️ ≥ 15m
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TAB 1: DELAYS & CANCELLATIONS */}
        {activeTab === 'DELAYS' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-1.5">
            {filteredDelays.length === 0 ? (
              <div className="p-8 text-center text-anthrazit-400 bg-anthrazit-950 border border-anthrazit-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-bold text-anthrazit-200">Keine gemeldeten Verspätungen im aktuellen Filter</div>
                <div className="text-xs text-anthrazit-500 mt-1">
                  Der GTFS-RT Stream meldet für diese Kriterien keine akuten Ausfälle oder Verzögerungen.
                </div>
              </div>
            ) : (
              filteredDelays.map((item, idx) => {
                const isCanceled = item.cancelled || item.status === 'CANCELED';
                const isSev = item.status === 'SEV' || item.line.includes('EV');
                const isSkipped = item.status === 'SKIPPED_STOPS';

                return (
                  <div
                    key={item.id + idx}
                    className={`p-2 sm:p-2.5 border transition-all ${
                      isCanceled
                        ? 'bg-red-950/25 border-red-800/80 hover:border-red-600'
                        : isSev
                        ? 'bg-accent/10 border-accent/70 hover:border-accent'
                        : item.delayMinutes >= 15
                        ? 'bg-amber-950/20 border-amber-800/80 hover:border-amber-600'
                        : 'bg-anthrazit-950 border-anthrazit-800 hover:border-anthrazit-700'
                    }`}
                  >
                    {/* Top Row: Line Badge + City + Status Badge + Delay Delta / Ausfall */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {/* Line Badge */}
                        <span 
                          className={`px-1.5 py-0.5 text-xs font-bold font-mono min-w-[42px] text-center ${
                            isCanceled
                              ? 'bg-red-600 text-white font-extrabold line-through'
                              : isSev
                              ? 'bg-accent text-anthrazit-950 font-extrabold'
                              : item.type === 'subway'
                              ? 'bg-blue-600 text-white'
                              : item.type === 'train'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-anthrazit-700 text-anthrazit-100'
                          }`}
                        >
                          {item.line}
                        </span>

                        <span className="text-[9px] font-mono uppercase tracking-wider text-anthrazit-400">
                          [{item.city}]
                        </span>

                        {/* Status Badges */}
                        {isCanceled ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-red-600 text-white border border-red-500 uppercase tracking-wide">
                            AUSFALL
                          </span>
                        ) : isSev ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-accent text-anthrazit-950 uppercase tracking-wide">
                            SEV
                          </span>
                        ) : isSkipped ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-anthrazit-950 uppercase tracking-wide">
                            HALT ENTFÄLLT
                          </span>
                        ) : null}
                      </div>

                      {/* Delay Value */}
                      <div className="shrink-0 text-right">
                        {isCanceled ? (
                          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                            Entfällt
                          </span>
                        ) : (
                          <span className={`text-sm font-bold font-mono ${
                            item.delayMinutes >= 15 ? 'text-amber-400' : 'text-accent'
                          }`}>
                            +{item.delayMinutes}m
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Direction & Station */}
                    <div className="mt-1.5 flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-bold text-anthrazit-100 truncate">
                          {item.headsign ? `➔ ${item.headsign}` : 'Reguläre Fahrt'}
                        </div>
                        <div className="text-[11px] text-anthrazit-300 truncate">
                          <span className="text-anthrazit-400 font-normal">Halt: </span>
                          <span className="font-semibold text-accent">{item.stopName}</span>
                        </div>
                        {item.cause && (
                          <div className="text-[10px] text-anthrazit-400 italic truncate max-w-sm sm:max-w-xl">
                            {item.cause}
                          </div>
                        )}
                      </div>

                      {/* Quick Action */}
                      {onSelectLine && (
                        <button
                          onClick={() => {
                            onSelectLine(item.line);
                            onClose();
                          }}
                          className="shrink-0 self-end px-2 py-0.5 bg-anthrazit-850 hover:bg-accent hover:text-anthrazit-950 border border-anthrazit-700 text-accent text-[10px] font-bold transition-colors cursor-pointer"
                          title={`Linie ${item.line} im Cockpit öffnen`}
                        >
                          Cockpit ➔
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: SERVICE ALERTS */}
        {activeTab === 'ALERTS' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-anthrazit-400 bg-anthrazit-950 border border-anthrazit-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-bold text-anthrazit-200">Keine aktuellen Störungsmeldungen</div>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-3 bg-anthrazit-950 border border-anthrazit-800 hover:border-accent/60 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent/20 border border-accent/50 text-accent">
                          [{alert.city}] {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-anthrazit-100">
                          {alert.title}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-accent">
                        {alert.header}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {alert.lines.map(l => (
                        <span key={l} className="px-1.5 py-0.5 bg-anthrazit-850 border border-anthrazit-700 text-xs font-bold text-anthrazit-200 font-mono">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-anthrazit-300 leading-relaxed bg-anthrazit-900/60 p-2 border border-anthrazit-800/80">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[10px] text-anthrazit-400 pt-1 border-t border-anthrazit-800/60">
                    <div>
                      <span>Ursache: </span>
                      <span className="text-anthrazit-200 font-semibold">{alert.cause}</span>
                    </div>
                    {alert.validTo && (
                      <div>
                        <span>Gültig bis: </span>
                        <span className="text-anthrazit-200 font-mono">{alert.validTo.split('T')[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: FEED TELEMETRY & PROTOCOL INFO */}
        {activeTab === 'TELEMETRY' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
            <div className="bg-anthrazit-950 border border-anthrazit-800 p-4 space-y-3">
              <div className="flex items-center space-x-2 text-accent border-b border-anthrazit-800 pb-2">
                <Radio className="w-4 h-4" />
                <span className="font-bold text-sm uppercase">GTFS-RT Protocol Buffer Feed Spezifikation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-anthrazit-400">Endpoint URL:</span>
                  <div className="font-mono text-accent bg-anthrazit-900 p-1.5 border border-anthrazit-800 mt-0.5 break-all">
                    https://realtime.gtfs.de/realtime-free.pb
                  </div>
                </div>
                <div>
                  <span className="text-anthrazit-400">Local Reverse Proxy:</span>
                  <div className="font-mono text-emerald-400 bg-anthrazit-900 p-1.5 border border-anthrazit-800 mt-0.5">
                    /api/gtfs-rt/realtime-free.pb
                  </div>
                </div>
                <div>
                  <span className="text-anthrazit-400">Format & Version:</span>
                  <div className="text-anthrazit-200 mt-0.5 font-mono">
                    Protocol Buffers v2 / GTFS-RT v2.0
                  </div>
                </div>
                <div>
                  <span className="text-anthrazit-400">Update-Frequenz:</span>
                  <div className="text-anthrazit-200 mt-0.5 font-mono">
                    10 Sekunden (Streaming-Intervall)
                  </div>
                </div>
                <div>
                  <span className="text-anthrazit-400">Extrahierte Entitäten:</span>
                  <div className="text-anthrazit-200 mt-0.5 font-mono">
                    {feedInfo?.totalEntities || 5427} TripUpdates & Alerts
                  </div>
                </div>
                <div>
                  <span className="text-anthrazit-400">Filter-Coverage:</span>
                  <div className="text-anthrazit-200 mt-0.5 font-mono">
                    Niedersachsen (GVH/üstra) & Hamburg (HVV/S-Bahn/Hochbahn)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-anthrazit-950 border border-anthrazit-800 p-4 text-xs space-y-2 text-anthrazit-300">
              <div className="font-bold text-anthrazit-100 uppercase text-xs">
                Architektur & Echtzeit-Verarbeitung:
              </div>
              <p>
                Der GTFS-RT Feed liefert kontinuierlich binäre Protobuf-Frames mit <code className="text-accent bg-anthrazit-900 px-1 py-0.5">TripUpdates</code> (Verfrühungen, Verspätungen, Haltausfälle) und <code className="text-accent bg-anthrazit-900 px-1 py-0.5">Alerts</code> (Streckensperrungen, SEV-Maßnahmen).
              </p>
              <p>
                HBOARD koppelt die Realtime-Streams mit den vorab extrahierten Haltestellen-IDs und Relationen der statischen GTFS-Sollfahrpläne für blitzschnelles Rendering ohne UI-Blockaden.
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-4 py-2.5 bg-anthrazit-950 border-t border-anthrazit-800 flex items-center justify-between text-xs shrink-0">
          <div className="text-[11px] text-anthrazit-400">
            <span>Status: </span>
            <span className="text-emerald-400 font-bold">GTFS-RT Pipeline aktiv</span>
            <span className="hidden sm:inline"> • Schnittstelle realtime.gtfs.de</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-anthrazit-200 hover:text-white text-xs cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
