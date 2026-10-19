import React, { useState, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Header } from './components/Header';
import { OSINTMap } from './components/Map/OSINTMap';
import { TransitCockpit } from './components/TransitCockpit';
import { ToolsSensorsFlyout } from './components/ToolsSensorsFlyout';
import { CommandPalette } from './components/Modals/CommandPalette';
import { LinklistViewModal } from './components/Modals/LinklistViewModal';
import { GlossaryModal } from './components/Modals/GlossaryModal';
import { WebcamViewerModal } from './components/Modals/WebcamViewerModal';
import { AdminDashboardModal } from './components/Modals/AdminDashboardModal';
import { LiveDelaysModal } from './components/Modals/LiveDelaysModal';
import { 
  ThemeMode, 
  GeoLocation, 
  OverpassPreset,
  OverpassLiveElement 
} from './types';
import { TransitLineRoute } from './data/transitRoutes';
import { TransitStop } from './services/apiService';
import { ALL_HANNOVER_STATIONS } from './data/hannoverStations';
import { ALL_HAMBURG_STATIONS } from './data/hamburgStations';
import { 
  INITIAL_GEO_MARKERS, 
  HAMBURG_GEO_MARKERS,
  HANNOVER_COORDINATES,
  HAMBURG_COORDINATES,
  HANNOVER_DISTRICTS,
  HAMBURG_DISTRICTS
} from './data/mockData';
import { Train, Cpu, Compass } from 'lucide-react';

export const App: React.FC = () => {
  // Theme State (Dark Mode default)
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Active City: 'H' (Hannover) or 'HH' (Hamburg)
  const [activeCity, setActiveCity] = useState<'H' | 'HH'>('H');

  // Sektor/District Filter
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Alle Stadtbezirke');

  // Mobile View Tab: 'map' | 'transit'
  const [mobileTab, setMobileTab] = useState<'map' | 'transit'>('map');

  // Right Transit Cockpit State (Open by default on Desktop)
  const [isTransitCockpitOpen, setIsTransitCockpitOpen] = useState<boolean>(true);

  // Tools & Sensors Flyout State
  const [isToolsFlyoutOpen, setIsToolsFlyoutOpen] = useState<boolean>(false);

  // Selected Geo Marker (for node inspection / webcam)
  const [selectedMarker, setSelectedMarker] = useState<GeoLocation | null>(null);

  // Active Line Route displayed on Map (e.g. Stadtbahn 1, 4, 6, U1, U3, S4, etc.)
  const [activeRoute, setActiveRoute] = useState<TransitLineRoute | null>(null);

  // Active Transit Stop for Live Departures
  const [selectedTransitStop, setSelectedTransitStop] = useState<TransitStop | null>(null);

  // Overpass Live Elements rendered on Map
  const [overpassLiveElements, setOverpassLiveElements] = useState<OverpassLiveElement[]>([]);

  // Active Map Layers
  const [activeLayers, setActiveLayers] = useState({
    webcams: false,
    iotSensors: false,
    mobility: false,
    infra: false,
    gridOverlay: false,
  });

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isLinklistOpen, setIsLinklistOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isOpsAdminOpen, setIsOpsAdminOpen] = useState<boolean>(false);
  const [isLiveDelaysModalOpen, setIsLiveDelaysModalOpen] = useState<boolean>(false);
  const [activeWebcamModal, setActiveWebcamModal] = useState<GeoLocation | null>(null);

  // Leaflet Map Instance
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const currentDistricts = activeCity === 'HH' ? HAMBURG_DISTRICTS : HANNOVER_DISTRICTS;

  // Handle Clean City Switch (H <-> HH)
  const handleSelectCity = (city: 'H' | 'HH') => {
    setActiveCity(city);
    setSelectedDistrict('Alle Stadtbezirke');
    setSelectedMarker(null);
    setSelectedTransitStop(null);
    setActiveRoute(null);
    setOverpassLiveElements([]);
    if (mapInstance) {
      const coords = city === 'HH' ? HAMBURG_COORDINATES : HANNOVER_COORDINATES;
      mapInstance.flyTo(coords, 12, { animate: true, duration: 1.2 });
    }
  };

  // Handle Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter Markers according to City, District, and Layer Toggles
  const customMarkers = useMemo(() => [
    ...INITIAL_GEO_MARKERS,
    ...HAMBURG_GEO_MARKERS
  ], []);

  const filteredMarkers = useMemo(() => {
    return customMarkers.filter((marker) => {
      if (activeCity === 'H' && marker.lat >= 53.0) return false;
      if (activeCity === 'HH' && marker.lat < 53.0) return false;

      if (selectedDistrict !== 'Alle Stadtbezirke' && marker.district && marker.district !== selectedDistrict) {
        return false;
      }

      if (marker.category === 'traffic') {
        if (marker.type === 'Verkehrskamera' && !activeLayers.webcams) return false;
        if (marker.type === 'Mobility Hub' && !activeLayers.mobility) return false;
        if (marker.type === 'Haltestelle' && !activeLayers.mobility) return false;
      }
      if (marker.category === 'iot' && !activeLayers.iotSensors) return false;
      if (marker.category === 'security' && !activeLayers.infra) return false;

      return true;
    });
  }, [customMarkers, activeCity, selectedDistrict, activeLayers]);

  // Center City
  const handleCenterCity = () => {
    if (mapInstance) {
      const coords = activeCity === 'HH' ? HAMBURG_COORDINATES : HANNOVER_COORDINATES;
      mapInstance.flyTo(coords, 12, { duration: 1 });
      setSelectedMarker(null);
    }
  };

  // Fly to Station
  const handleFlyToStation = (lat: number, lng: number, _name?: string) => {
    if (mapInstance) {
      mapInstance.flyTo([lat, lng], 15, { animate: true, duration: 0.8 });
    }
  };

  // Click on Station on active Route Polyline on Map
  const handleSelectStationStopOnMap = (stopName: string, lat: number, lng: number, lineName: string) => {
    let stopObj: TransitStop;
    if (activeCity === 'HH') {
      const match = ALL_HAMBURG_STATIONS.find(s => 
        s.name.toLowerCase().includes(stopName.toLowerCase()) || 
        stopName.toLowerCase().includes(s.name.toLowerCase())
      );
      stopObj = match || {
        id: `hh-${stopName.toLowerCase().replace(/\s+/g, '-')}`,
        name: stopName,
        lat,
        lng,
        type: lineName
      };
    } else {
      const match = ALL_HANNOVER_STATIONS.find(s => 
        s.name.toLowerCase().includes(stopName.toLowerCase()) || 
        stopName.toLowerCase().includes(s.name.toLowerCase())
      );
      stopObj = match || {
        id: `hn-${stopName.toLowerCase().replace(/\s+/g, '-')}`,
        name: stopName,
        lat,
        lng,
        type: lineName
      };
    }
    setSelectedTransitStop(stopObj);
    setIsTransitCockpitOpen(true);
    handleFlyToStation(lat, lng, stopName);
  };

  // Select Map Marker
  const handleSelectMarker = (marker: GeoLocation | null) => {
    setSelectedMarker(marker);
    if (!marker) return;

    if (marker.type === 'Haltestelle' || marker.type === 'transit') {
      const stopObj: TransitStop = {
        id: marker.id,
        name: marker.name,
        lat: marker.lat,
        lng: marker.lng,
        type: marker.type
      };
      setSelectedTransitStop(stopObj);
      setIsTransitCockpitOpen(true);
    } else {
      setIsToolsFlyoutOpen(true);
    }
  };

  // Toggle Layer
  const handleToggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className={`h-[100dvh] w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark bg-anthrazit-950 text-anthrazit-100' : 'light bg-anthrazit-50 text-anthrazit-900'}`}>
      {/* 1. Schlanker Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activeCity={activeCity}
        onSelectCity={handleSelectCity}
        selectedDistrict={selectedDistrict}
        districts={currentDistricts}
        onSelectDistrict={setSelectedDistrict}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenLinklist={() => setIsLinklistOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenAdmin={() => setIsOpsAdminOpen(true)}
        onOpenLiveDelays={() => setIsLiveDelaysModalOpen(true)}
        onToggleToolsFlyout={() => setIsToolsFlyoutOpen(prev => !prev)}
        isToolsFlyoutOpen={isToolsFlyoutOpen}
        onToggleTransitCockpit={() => setIsTransitCockpitOpen(prev => !prev)}
        isTransitCockpitOpen={isTransitCockpitOpen}
        activeMarkerCount={filteredMarkers.length}
      />

      {/* 2. Hauptbereich: Vollbild-Map im Zentrum + Dediziertes Transit-Cockpit rechts */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Zentrum: OSINT Karte (Clean Hero View) */}
        <main className={`flex-1 relative h-full bg-anthrazit-950 ${mobileTab === 'map' ? 'flex' : 'hidden md:flex'}`}>
          <OSINTMap
            markers={filteredMarkers}
            theme={theme}
            selectedMarker={selectedMarker}
            onSelectMarker={handleSelectMarker}
            showGridOverlay={activeLayers.gridOverlay}
            overpassLiveElements={overpassLiveElements}
            onClearOverpassElements={() => setOverpassLiveElements([])}
            activeRoute={activeRoute}
            onClearRoute={() => setActiveRoute(null)}
            onOpenWebcam={(cam) => setActiveWebcamModal(cam)}
            onMapReady={(map) => setMapInstance(map)}
            onSelectStationStop={handleSelectStationStopOnMap}
          />

          {/* Floating Re-Open Button für das Transit-Cockpit falls geschlossen */}
          {!isTransitCockpitOpen && (
            <div className="absolute bottom-10 right-4 z-20 hidden sm:flex items-center">
              <button
                onClick={() => setIsTransitCockpitOpen(true)}
                className="px-3 py-2 bg-accent hover:bg-accent-hover text-anthrazit-950 font-mono font-bold text-xs flex items-center space-x-1.5 shadow-accent-sm cursor-pointer"
                title="Transit-Cockpit öffnen"
              >
                <Train className="w-3.5 h-3.5" />
                <span>Transit-Cockpit</span>
              </button>
            </div>
          )}
        </main>

        {/* Rechts: Dediziertes, schlankes ÖPNV Transit-Cockpit */}
        <div className={`${mobileTab === 'transit' ? 'w-full h-full' : isTransitCockpitOpen ? 'hidden md:flex' : 'hidden'}`}>
          <TransitCockpit
            activeCity={activeCity}
            isOpen={isTransitCockpitOpen || mobileTab === 'transit'}
            onClose={() => {
              setIsTransitCockpitOpen(false);
              setMobileTab('map');
            }}
            activeRoute={activeRoute}
            onSelectRoute={(route) => {
              setActiveRoute(route);
              if (route && route.coordinates && route.coordinates.length > 0 && mapInstance) {
                const bounds = L.latLngBounds(route.coordinates as L.LatLngTuple[]);
                mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
              }
            }}
            selectedTransitStop={selectedTransitStop}
            onSelectTransitStop={(stop) => setSelectedTransitStop(stop)}
            onFlyToStation={handleFlyToStation}
            onOpenLiveDelays={() => setIsLiveDelaysModalOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fokus auf Map + Transit) */}
      <nav className="md:hidden h-14 bg-anthrazit-950 border-t border-anthrazit-800 flex items-center justify-around px-2 z-30 shrink-0 font-mono text-xs">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 flex flex-col items-center justify-center space-y-1 min-h-[44px] cursor-pointer ${
            mobileTab === 'map' ? 'text-accent font-bold' : 'text-anthrazit-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px]">Karte</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('transit');
            setIsTransitCockpitOpen(true);
          }}
          className={`flex-1 py-2 flex flex-col items-center justify-center space-y-1 min-h-[44px] cursor-pointer ${
            mobileTab === 'transit' ? 'text-accent font-bold' : 'text-anthrazit-400'
          }`}
        >
          <Train className="w-4 h-4" />
          <span className="text-[10px]">ÖPNV Cockpit</span>
        </button>

        <button
          onClick={() => setIsToolsFlyoutOpen(true)}
          className="flex-1 py-2 flex flex-col items-center justify-center space-y-1 min-h-[44px] text-anthrazit-400 hover:text-accent cursor-pointer"
        >
          <Cpu className="w-4 h-4" />
          <span className="text-[10px]">Sensoren</span>
        </button>
      </nav>

      {/* 3. Aufgeräumtes "Tools & Sensoren"-Flyout */}
      <ToolsSensorsFlyout
        isOpen={isToolsFlyoutOpen}
        onClose={() => setIsToolsFlyoutOpen(false)}
        activeCity={activeCity}
        activeLayers={activeLayers}
        onToggleLayer={handleToggleLayer}
        onCenterCity={handleCenterCity}
        onLoadOverpassElements={(elements) => setOverpassLiveElements(elements)}
        selectedMarker={selectedMarker}
        onClearSelectedMarker={() => setSelectedMarker(null)}
        onOpenWebcam={(cam) => setActiveWebcamModal(cam)}
      />

      {/* 4. Modals */}
      <WebcamViewerModal
        webcam={activeWebcamModal}
        isOpen={Boolean(activeWebcamModal)}
        onClose={() => setActiveWebcamModal(null)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectMarker={handleSelectMarker}
        onSelectPreset={(_preset: OverpassPreset) => setIsToolsFlyoutOpen(true)}
        onOpenLinklist={() => setIsLinklistOpen(true)}
        onOpenAdmin={() => setIsOpsAdminOpen(true)}
        activeCity={activeCity}
      />

      <LinklistViewModal
        isOpen={isLinklistOpen}
        onClose={() => setIsLinklistOpen(false)}
        activeCity={activeCity}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <AdminDashboardModal
        isOpen={isOpsAdminOpen}
        onClose={() => setIsOpsAdminOpen(false)}
        activeCity={activeCity}
      />

      <LiveDelaysModal
        isOpen={isLiveDelaysModalOpen}
        onClose={() => setIsLiveDelaysModalOpen(false)}
        activeCity={activeCity}
        onSelectCity={handleSelectCity}
        onSelectLine={(_line) => {
          setIsTransitCockpitOpen(true);
        }}
      />
    </div>
  );
};

export default App;
