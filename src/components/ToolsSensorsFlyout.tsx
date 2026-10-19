import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Cpu, 
  Activity, 
  Globe, 
  Code2, 
  Eye, 
  EyeOff, 
  Crosshair,
  Camera
} from 'lucide-react';
import { OverpassLiveElement, GeoLocation } from '../types';
import { TelemetryWidget } from './Widgets/TelemetryWidget';
import { CyberAssetsTable } from './Widgets/CyberAssetsTable';
import { OsintQueryHub } from './Widgets/OsintQueryHub';
import { 
  MOCK_IOT_SENSORS, 
  HAMBURG_IOT_SENSORS, 
  MOCK_WEATHER_TELEMETRY, 
  HAMBURG_WEATHER_TELEMETRY,
  MOCK_CYBER_ASSETS,
  HAMBURG_CYBER_ASSETS,
  MOCK_OVERPASS_PRESETS,
  HAMBURG_OVERPASS_PRESETS
} from '../data/mockData';

interface ToolsSensorsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  activeCity: 'H' | 'HH';
  activeLayers: {
    webcams: boolean;
    iotSensors: boolean;
    mobility: boolean;
    infra: boolean;
    gridOverlay: boolean;
  };
  onToggleLayer: (layer: keyof ToolsSensorsFlyoutProps['activeLayers']) => void;
  onCenterCity: () => void;
  onLoadOverpassElements: (elements: OverpassLiveElement[]) => void;
  selectedMarker: GeoLocation | null;
  onClearSelectedMarker: () => void;
  onOpenWebcam?: (cam: GeoLocation) => void;
}

export const ToolsSensorsFlyout: React.FC<ToolsSensorsFlyoutProps> = ({
  isOpen,
  onClose,
  activeCity,
  activeLayers,
  onToggleLayer,
  onCenterCity,
  onLoadOverpassElements,
  selectedMarker,
  onClearSelectedMarker,
  onOpenWebcam
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'iot' | 'cyber' | 'overpass' | 'details'>('layers');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-anthrazit-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Flyout Slide-over Container */}
      <aside className="relative w-full sm:w-[460px] md:w-[500px] h-full bg-anthrazit-950 border-l border-anthrazit-800 shadow-2xl flex flex-col z-10 font-mono text-xs overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-anthrazit-800 px-4 bg-anthrazit-900 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-accent" />
            <span className="font-bold text-sm text-anthrazit-100 uppercase tracking-wider">
              Werkzeuge & Sensoren
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-accent/15 border border-accent/40 text-accent font-bold">
              [{activeCity}]
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center bg-anthrazit-850 hover:bg-anthrazit-800 border border-anthrazit-700 text-anthrazit-300 hover:text-anthrazit-100 cursor-pointer"
            title="Flyout schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab-Bar */}
        <div className="flex border-b border-anthrazit-800 bg-anthrazit-900/90 p-1.5 space-x-1 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'layers', label: 'Layer', icon: Layers },
            { id: 'iot', label: 'IoT/Pegel', icon: Activity },
            { id: 'cyber', label: 'Cyber', icon: Globe },
            { id: 'overpass', label: 'Overpass', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1.5 px-2 min-h-[36px] flex items-center justify-center space-x-1.5 text-xs font-mono transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-accent text-anthrazit-950 border-accent font-bold shadow-sm'
                    : 'bg-anthrazit-950 border-anthrazit-800 text-anthrazit-400 hover:text-anthrazit-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {selectedMarker && (
            <button
              onClick={() => setActiveTab('details')}
              className={`py-1.5 px-2.5 min-h-[36px] flex items-center justify-center space-x-1 text-xs font-mono border transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-accent text-anthrazit-950 border-accent font-bold'
                  : 'bg-anthrazit-850 border-accent/40 text-accent font-bold'
              }`}
            >
              <span>Detail</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          {/* TAB 1: KARTEN-LAYER & GIS */}
          {activeTab === 'layers' && (
            <div className="space-y-4">
              <div className="p-3 bg-anthrazit-900 border border-anthrazit-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-anthrazit-100 uppercase">OSINT GIS Ebenen</span>
                  <button
                    onClick={onCenterCity}
                    className="text-accent hover:underline flex items-center space-x-1 text-[11px] cursor-pointer"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Zentrieren</span>
                  </button>
                </div>
                <p className="text-[11px] font-sans text-anthrazit-400">
                  Schalte dynamische Marker für Webcams, Pegeldaten, Mobility-Hubs und Sicherheitsinfrastruktur zu.
                </p>
              </div>

              <div className="space-y-1.5">
                {[
                  { key: 'webcams', label: activeCity === 'HH' ? 'HPA & City Webcams' : 'VMZ Verkehrs-Kameras', color: 'bg-accent' },
                  { key: 'iotSensors', label: 'Pegel- & Umweltsensoren', color: 'bg-blue-400' },
                  { key: 'mobility', label: activeCity === 'HH' ? 'StadtRAD & ÖPNV Hubs' : 'Nextbike & GBFS Hubs', color: 'bg-emerald-400' },
                  { key: 'infra', label: 'Kritische Infrastruktur (KRITIS)', color: 'bg-amber-400' },
                  { key: 'gridOverlay', label: 'MGRS / Taktisches Gitternetz', color: 'bg-anthrazit-400' },
                ].map((item) => {
                  const isEnabled = activeLayers[item.key as keyof typeof activeLayers];
                  return (
                    <button
                      key={item.key}
                      onClick={() => onToggleLayer(item.key as keyof typeof activeLayers)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] border transition-colors cursor-pointer ${
                        isEnabled
                          ? 'bg-anthrazit-900 border-anthrazit-700 text-anthrazit-100'
                          : 'bg-anthrazit-950/60 border-anthrazit-850 text-anthrazit-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 ${item.color}`} />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      {isEnabled ? (
                        <Eye className="w-4 h-4 text-accent" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-anthrazit-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: IOT / PEGEL & WETTER */}
          {activeTab === 'iot' && (
            <div className="space-y-4">
              <TelemetryWidget
                sensors={activeCity === 'HH' ? HAMBURG_IOT_SENSORS : MOCK_IOT_SENSORS}
                weather={activeCity === 'HH' ? HAMBURG_WEATHER_TELEMETRY : MOCK_WEATHER_TELEMETRY}
                activeCity={activeCity}
              />
            </div>
          )}

          {/* TAB 3: CYBER ASSETS & RECON */}
          {activeTab === 'cyber' && (
            <div className="space-y-4">
              <CyberAssetsTable
                assets={activeCity === 'HH' ? HAMBURG_CYBER_ASSETS : MOCK_CYBER_ASSETS}
                activeCity={activeCity}
              />
            </div>
          )}

          {/* TAB 4: OVERPASS TURBO */}
          {activeTab === 'overpass' && (
            <div className="space-y-4">
              <OsintQueryHub
                onLoadElementsOnMap={onLoadOverpassElements}
                activeCity={activeCity}
                presets={activeCity === 'HH' ? HAMBURG_OVERPASS_PRESETS : MOCK_OVERPASS_PRESETS}
              />
            </div>
          )}

          {/* TAB 5: NODE DETAILS */}
          {activeTab === 'details' && selectedMarker && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-anthrazit-800">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-accent/15 text-accent border border-accent/30 font-bold uppercase">
                    {selectedMarker.type}
                  </span>
                  <h3 className="font-bold text-sm text-anthrazit-100 mt-1 truncate">{selectedMarker.name}</h3>
                </div>
                <button
                  onClick={onClearSelectedMarker}
                  className="p-1 bg-anthrazit-850 hover:bg-anthrazit-800 text-anthrazit-400 hover:text-anthrazit-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedMarker.type === 'Verkehrskamera' && (
                <button
                  onClick={() => onOpenWebcam?.(selectedMarker)}
                  className="w-full py-2.5 px-3 bg-accent hover:bg-accent-hover text-anthrazit-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-accent-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>📹 Live-Webcam Snapshot öffnen</span>
                </button>
              )}

              {selectedMarker.explanation && (
                <div className="p-3 bg-accent/10 border border-accent/30 text-anthrazit-200 space-y-1 font-sans">
                  <div className="text-accent font-mono font-bold text-[11px]">KNOTEN-ERKLÄRUNG</div>
                  <p className="text-[11px] leading-relaxed text-anthrazit-300">
                    {selectedMarker.explanation}
                  </p>
                </div>
              )}

              <div className="p-2.5 bg-anthrazit-900 border border-anthrazit-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-anthrazit-400">STATUS:</span>
                  <span className="text-accent font-bold uppercase">{selectedMarker.status || 'OK'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-anthrazit-400">LAT / LNG:</span>
                  <span className="text-anthrazit-200">{selectedMarker.lat}° N, {selectedMarker.lng}° E</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
