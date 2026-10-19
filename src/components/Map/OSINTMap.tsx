import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoLocation, ThemeMode, OverpassLiveElement, MapTileProvider } from '../../types';
import { TransitLineRoute } from '../../data/transitRoutes';
import { HANNOVER_COORDINATES } from '../../data/mockData';
import { Layers, Map as MapIcon, X, GitBranch } from 'lucide-react';

interface OSINTMapProps {
  markers: GeoLocation[];
  theme: ThemeMode;
  selectedMarker: GeoLocation | null;
  onSelectMarker: (marker: GeoLocation | null) => void;
  showGridOverlay: boolean;
  overpassLiveElements?: OverpassLiveElement[];
  onClearOverpassElements?: () => void;
  activeRoute?: TransitLineRoute | null;
  onClearRoute?: () => void;
  onOpenWebcam?: (marker: GeoLocation) => void;
  onMapReady?: (mapInstance: L.Map) => void;
  onSelectStationStop?: (stopName: string, lat: number, lng: number, lineName: string) => void;
  allRoutes?: Record<string, TransitLineRoute>;
  activeCity?: 'H' | 'HH';
  onSelectLineRoute?: (route: TransitLineRoute) => void;
  hoveredLineRef?: string | null;
}

export const OSINTMap: React.FC<OSINTMapProps> = ({
  markers,
  theme,
  selectedMarker,
  onSelectMarker,
  showGridOverlay,
  overpassLiveElements = [],
  onClearOverpassElements,
  activeRoute = null,
  onClearRoute,
  onOpenWebcam,
  onMapReady,
  onSelectStationStop,
  allRoutes = {},
  activeCity: _activeCity = 'H',
  onSelectLineRoute,
  hoveredLineRef = null
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const overpassLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const networkLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hoveredPreviewLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [showAllLines, setShowAllLines] = useState<boolean>(false);

  const [activeTileProvider, setActiveTileProvider] = useState<MapTileProvider>(
    theme === 'dark' ? 'esri-dark' : 'esri-light'
  );
  const [showTileMenu, setShowTileMenu] = useState(false);

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: HANNOVER_COORDINATES[0],
    lng: HANNOVER_COORDINATES[1],
    zoom: 13
  });

  useEffect(() => {
    (window as any).__triggerSelectStationStop = (stopNameEncoded: string, lat: number, lng: number, lineNameEncoded: string) => {
      const stopName = decodeURIComponent(stopNameEncoded);
      const lineName = decodeURIComponent(lineNameEncoded);
      onSelectStationStop?.(stopName, lat, lng, lineName);
    };
    (window as any).__triggerSelectMarker = (markerId: string) => {
      const match = markers.find(m => m.id === markerId);
      if (match) onSelectMarker(match);
    };
    return () => {
      delete (window as any).__triggerSelectStationStop;
      delete (window as any).__triggerSelectMarker;
    };
  }, [markers, onSelectStationStop, onSelectMarker]);

  const getTileConfig = (provider: MapTileProvider) => {
    switch (provider) {
      case 'esri-dark':
        return {
          base: '/tiles/esri-dark/{z}/{y}/{x}',
          labels: '/tiles/esri-dark-labels/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16
        };
      case 'esri-light':
        return {
          base: '/tiles/esri-light/{z}/{y}/{x}',
          labels: '/tiles/esri-light-labels/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16
        };
      case 'esri-sat':
        return {
          base: '/tiles/esri-sat/{z}/{y}/{x}',
          labels: '/tiles/esri-sat-labels/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
          maxZoom: 19
        };
      case 'osm-standard':
      default:
        return {
          base: '/tiles/osm/{z}/{x}/{y}.png',
          labels: null,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        };
    }
  };

  const createMarkerIcon = (marker: GeoLocation, isSelected: boolean) => {
    let strokeColor = '#ff8000';
    const bgColor = '#16191e';
    let badgeIcon = '⬡';

    if (marker.category === 'traffic') {
      strokeColor = '#ff8000';
      badgeIcon = marker.type === 'Haltestelle' ? '🚏' : '📹';
    } else if (marker.category === 'iot') {
      strokeColor = '#38bdf8';
      badgeIcon = '💧';
    } else if (marker.category === 'security') {
      strokeColor = '#f59e0b';
      badgeIcon = '⚡';
    } else if (marker.category === 'cyber') {
      strokeColor = '#e2e8f0';
      badgeIcon = '🌐';
    }

    const html = `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${bgColor};
        border: ${isSelected ? '2px solid #ffffff' : `1.5px solid ${strokeColor}`};
        border-radius: 4px;
        box-shadow: ${isSelected ? '0 0 14px #ff8000' : '0 2px 8px rgba(0,0,0,0.7)'};
        cursor: pointer;
        font-family: monospace;
        font-size: 14px;
        transition: transform 0.15s ease;
      ">
        <span>${badgeIcon}</span>
        ${marker.type === 'Verkehrskamera' ? `
          <span style="
            position: absolute;
            top: -3px;
            right: -3px;
            width: 8px;
            height: 8px;
            background: #ff8000;
            border-radius: 50%;
            border: 1px solid #16191e;
          "></span>
        ` : ''}
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-osint-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });
  };

  const createOverpassMarkerIcon = (el: OverpassLiveElement) => {
    let iconSymbol = '⚡';
    if (el.tags?.['man_made'] === 'surveillance') iconSymbol = '📹';
    else if (el.tags?.amenity === 'hospital' || el.tags?.amenity === 'fire_station') iconSymbol = '🚨';
    else if (el.tags?.['man_made'] === 'mast' || el.tags?.['man_made'] === 'tower') iconSymbol = '📡';

    return L.divIcon({
      html: `
        <div style="
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ff8000;
          color: #0f1114;
          font-weight: bold;
          font-size: 13px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px rgba(255, 128, 0, 0.9);
          cursor: pointer;
        ">
          ${iconSymbol}
        </div>
      `,
      className: 'overpass-live-marker',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14]
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: HANNOVER_COORDINATES,
      zoom: 13,
      minZoom: 9,
      maxZoom: 19,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const initialProvider = theme === 'dark' ? 'esri-dark' : 'esri-light';
    const config = getTileConfig(initialProvider);

    const baseTileLayer = L.tileLayer(config.base, {
      attribution: config.attribution,
      maxZoom: config.maxZoom
    }).addTo(map);
    baseTileLayerRef.current = baseTileLayer;

    if (config.labels) {
      const labelTileLayer = L.tileLayer(config.labels, {
        maxZoom: config.maxZoom,
        zIndex: 5
      }).addTo(map);
      labelTileLayerRef.current = labelTileLayer;
    }

    const markerGroup = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = markerGroup;

    const overpassGroup = L.layerGroup().addTo(map);
    overpassLayerGroupRef.current = overpassGroup;

    const networkGroup = L.layerGroup().addTo(map);
    networkLayerGroupRef.current = networkGroup;

    const hoveredPreviewGroup = L.layerGroup().addTo(map);
    hoveredPreviewLayerGroupRef.current = hoveredPreviewGroup;

    const routeGroup = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = routeGroup;

    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5)),
        zoom: map.getZoom()
      });
    });

    mapInstanceRef.current = map;
    if (onMapReady) onMapReady(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;

    const config = getTileConfig(activeTileProvider);
    baseTileLayerRef.current.setUrl(config.base);

    if (labelTileLayerRef.current) {
      if (config.labels) {
        labelTileLayerRef.current.setUrl(config.labels);
      } else {
        mapInstanceRef.current.removeLayer(labelTileLayerRef.current);
        labelTileLayerRef.current = null;
      }
    } else if (config.labels) {
      const newLabelLayer = L.tileLayer(config.labels, {
        maxZoom: config.maxZoom,
        zIndex: 5
      }).addTo(mapInstanceRef.current);
      labelTileLayerRef.current = newLabelLayer;
    }
  }, [activeTileProvider]);

  useEffect(() => {
    if (theme === 'dark' && activeTileProvider === 'esri-light') {
      setActiveTileProvider('esri-dark');
    } else if (theme === 'light' && activeTileProvider === 'esri-dark') {
      setActiveTileProvider('esri-light');
    }
  }, [theme]);

  // Render All Network Lines in their Authentic Colors
  useEffect(() => {
    if (!mapInstanceRef.current || !networkLayerGroupRef.current) return;

    networkLayerGroupRef.current.clearLayers();

    if (!showAllLines) return;

    const routesList = Object.values(allRoutes);
    if (routesList.length === 0) return;

    routesList.forEach((route) => {
      if (!route.coordinates || route.coordinates.length < 2) return;

      const isCurrentActive = activeRoute?.ref === route.ref;
      const latLngs = route.coordinates.map(c => [c[0], c[1]] as [number, number]);
      const lineColor = route.color || '#ff8000';

      // Base line for the route
      const polyline = L.polyline(latLngs, {
        color: lineColor,
        weight: isCurrentActive ? 4 : 2.5,
        opacity: isCurrentActive ? 0.35 : 0.75,
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.bindTooltip(`
        <div style="font-family: monospace; font-size: 11px; padding: 2px 4px;">
          <strong style="color: ${lineColor}; font-weight: 800;">${route.name}</strong><br/>
          <span style="color: #cbd5e1; font-size: 10px;">${route.from} ➔ ${route.to}</span>
        </div>
      `, {
        sticky: true,
        direction: 'top',
        className: 'osint-route-tooltip'
      });

      polyline.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectLineRoute) {
          onSelectLineRoute(route);
        }
      });

      // Hover-Effekt: Linie hervorheben
      polyline.on('mouseover', () => {
        polyline.setStyle({
          weight: 4.5,
          opacity: 1
        });
        polyline.bringToFront();
      });

      polyline.on('mouseout', () => {
        polyline.setStyle({
          weight: isCurrentActive ? 4 : 2.5,
          opacity: isCurrentActive ? 0.35 : 0.75
        });
      });

      networkLayerGroupRef.current?.addLayer(polyline);
    });
  }, [allRoutes, showAllLines, activeRoute, onSelectLineRoute]);

  // Render Hovered Line Preview from Cockpit Guided Stepper
  useEffect(() => {
    if (!mapInstanceRef.current || !hoveredPreviewLayerGroupRef.current) return;

    hoveredPreviewLayerGroupRef.current.clearLayers();

    if (!hoveredLineRef) return;

    const route = allRoutes[hoveredLineRef];
    if (!route || !route.coordinates || route.coordinates.length < 2) return;

    // Don't render preview if it's already the active route
    if (activeRoute?.ref === route.ref) return;

    const latLngs = route.coordinates.map(c => [c[0], c[1]] as [number, number]);
    const lineColor = route.color || '#ff8000';

    // Outer Glow
    const glowLine = L.polyline(latLngs, {
      color: '#ffffff',
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    });

    // Core Highlight Line
    const coreLine = L.polyline(latLngs, {
      color: lineColor,
      weight: 5,
      opacity: 1,
      dashArray: '6, 4',
      lineCap: 'round',
      lineJoin: 'round',
    });

    hoveredPreviewLayerGroupRef.current.addLayer(glowLine);
    hoveredPreviewLayerGroupRef.current.addLayer(coreLine);

    // Add start and end station markers
    if (latLngs.length > 0) {
      const startMarker = L.circleMarker(latLngs[0], {
        radius: 6,
        fillColor: lineColor,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      });
      startMarker.bindTooltip(`<strong>${route.name}</strong>: ${route.from}`, {
        direction: 'top',
        className: 'osint-route-tooltip'
      });
      hoveredPreviewLayerGroupRef.current.addLayer(startMarker);

      const endMarker = L.circleMarker(latLngs[latLngs.length - 1], {
        radius: 6,
        fillColor: lineColor,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      });
      endMarker.bindTooltip(`<strong>${route.name}</strong>: ${route.to}`, {
        direction: 'top',
        className: 'osint-route-tooltip'
      });
      hoveredPreviewLayerGroupRef.current.addLayer(endMarker);
    }
  }, [hoveredLineRef, allRoutes, activeRoute]);
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerGroupRef.current) return;

    routeLayerGroupRef.current.clearLayers();

    if (!activeRoute || activeRoute.coordinates.length < 2) return;

    const latLngs = activeRoute.coordinates.map(c => [c[0], c[1]] as [number, number]);

    // Outer Border
    const outerLine = L.polyline(latLngs, {
      color: '#ffffff',
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    });

    // Inner Line
    const innerLine = L.polyline(latLngs, {
      color: '#ff8000',
      weight: 4,
      opacity: 1,
      dashArray: '8, 6',
      lineCap: 'round',
      lineJoin: 'round'
    });

    routeLayerGroupRef.current.addLayer(outerLine);
    routeLayerGroupRef.current.addLayer(innerLine);

    latLngs.forEach((coord, idx) => {
      const stopName = activeRoute.stops[idx] || `Halt #${idx + 1}`;
      const stopMarker = L.circleMarker(coord, {
        radius: 6,
        fillColor: '#ff8000',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      });

      stopMarker.bindTooltip(`<strong>${activeRoute.name}</strong>: ${stopName}`, {
        direction: 'top',
        className: 'osint-route-tooltip'
      });

      const popupHtml = `
        <div style="min-width: 220px; font-family: monospace; padding: 2px;">
          <div style="border-bottom: 1px solid #3c4552; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; background: #ff8000; color: #0f1114; font-weight: 700;">
                ${activeRoute.name}
              </span>
              <span style="font-size: 9px; color: #8b949e; text-transform: uppercase;">Linien-Halt</span>
            </div>
            <h4 style="font-weight: 700; font-size: 13px; margin: 4px 0 0 0; color: #f0f6fc;">${stopName}</h4>
          </div>
          <button onclick="window.__triggerSelectStationStop('${encodeURIComponent(stopName).replace(/'/g, "\\'")}', ${coord[0]}, ${coord[1]}, '${encodeURIComponent(activeRoute.name).replace(/'/g, "\\'")}')" style="width: 100%; padding: 6px 10px; border-radius: 4px; background: #ff8000; color: #0f1114; font-weight: 700; font-size: 11px; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 5px;">
            ⏱️ Echtzeit-Abfahrten aufrufen
          </button>
        </div>
      `;

      stopMarker.bindPopup(popupHtml);

      stopMarker.on('click', () => {
        if (onSelectStationStop) {
          onSelectStationStop(stopName, coord[0], coord[1], activeRoute.name);
        }
      });

      routeLayerGroupRef.current?.addLayer(stopMarker);
    });

    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 14,
      animate: true,
      duration: 1
    });
  }, [activeRoute]);

  // Update Core Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayerGroupRef.current) return;

    markerLayerGroupRef.current.clearLayers();

    markers.forEach((marker) => {
      const isSelected = selectedMarker?.id === marker.id;
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: createMarkerIcon(marker, isSelected)
      });

      let detailsHtml = '';
      if (marker.details) {
        detailsHtml = Object.entries(marker.details)
          .map(([k, v]) => `
            <div style="display:flex; justify-content:space-between; margin-bottom: 2px; font-size: 11px; font-family: monospace;">
              <span style="color: #8b949e;">${k}:</span>
              <span style="color: #e6edf3; font-weight: 600;">${v}</span>
            </div>
          `)
          .join('');
      }

      const isWebcam = marker.type === 'Verkehrskamera';

      const popupHtml = `
        <div style="min-width: 240px; font-family: inherit;">
          <div style="border-bottom: 1px solid #3c4552; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 2px;">
              <span style="font-size: 9px; font-family: monospace; padding: 2px 4px; border-radius: 2px; background: rgba(255,128,0,0.15); color: #ff8000; font-weight: 700; border: 1px solid rgba(255,128,0,0.3);">
                ${marker.type.toUpperCase()}
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #8b949e;">${marker.timestamp || 'LIVE'}</span>
            </div>
            <h4 style="font-weight: 700; font-size: 12px; margin: 4px 0 0 0; color: #f0f6fc;">${marker.name}</h4>
            <span style="font-size: 10px; color: #8b949e;">Bezirk: ${marker.district || 'Hannover'}</span>
          </div>

          ${marker.explanation ? `
            <div style="background: rgba(255,128,0,0.08); border-left: 2px solid #ff8000; padding: 5px 7px; margin-bottom: 8px; font-size: 11px; color: #d5d9df; font-family: sans-serif; line-height: 1.3;">
              <strong style="color: #ff8000; display: block; font-size: 10px; font-family: monospace;">ℹ️ ERKLÄRUNG:</strong>
              ${marker.explanation}
            </div>
          ` : ''}

          <div style="margin-bottom: 8px;">
            ${detailsHtml}
          </div>

          ${isWebcam ? `
            <button id="btn-webcam-${marker.id}" style="width: 100%; padding: 6px 10px; border-radius: 4px; background: #ff8000; color: #0f1114; font-weight: 700; font-size: 11px; cursor: pointer; border: none; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
              📹 Live-Webcam Snapshot öffnen
            </button>
          ` : ''}

          ${marker.type === 'transit' ? `
            <button onclick="window.__triggerSelectMarker('${marker.id}')" style="width: 100%; padding: 6px 10px; border-radius: 4px; background: #ff8000; color: #0f1114; font-weight: 700; font-size: 11px; cursor: pointer; border: none; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
              ⏱️ Echtzeit-Abfahrten aufrufen
            </button>
          ` : ''}

          <div style="font-size: 10px; font-family: monospace; color: #8b949e; border-top: 1px dashed #30363d; padding-top: 4px; display: flex; justify-content: space-between;">
            <span>LAT: ${marker.lat.toFixed(4)}</span>
            <span>LNG: ${marker.lng.toFixed(4)}</span>
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupHtml);
      leafletMarker.on('click', () => {
        onSelectMarker(marker);
      });

      leafletMarker.on('popupopen', () => {
        if (isWebcam && onOpenWebcam) {
          const btn = document.getElementById(`btn-webcam-${marker.id}`);
          if (btn) {
            btn.onclick = () => onOpenWebcam(marker);
          }
        }
      });

      markerLayerGroupRef.current?.addLayer(leafletMarker);
    });
  }, [markers, selectedMarker]);

  // Update Overpass Live Query Elements (Nodes & Ways)
  useEffect(() => {
    if (!mapInstanceRef.current || !overpassLayerGroupRef.current) return;

    overpassLayerGroupRef.current.clearLayers();

    if (!overpassLiveElements || overpassLiveElements.length === 0) return;

    const latLngBounds: [number, number][] = [];

    overpassLiveElements.forEach((el) => {
      // Support both node (lat, lon) and way center (center.lat, center.lon)
      const lat = el.lat || (el as any).center?.lat;
      const lng = el.lon || (el as any).center?.lon;
      if (!lat || !lng) return;

      latLngBounds.push([lat, lng]);

      const marker = L.marker([lat, lng], {
        icon: createOverpassMarkerIcon(el)
      });

      const tagsHtml = Object.entries(el.tags || {})
        .slice(0, 8)
        .map(([k, v]) => `
          <div style="display:flex; justify-content:space-between; margin-bottom: 2px; font-size: 10px; font-family: monospace;">
            <span style="color: #8b949e;">${k}:</span>
            <span style="color: #e6edf3; font-weight: 600;">${v}</span>
          </div>
        `)
        .join('');

      const titleName = el.tags?.name || el.tags?.['surveillance:type'] || el.tags?.power || el.tags?.amenity || 'OSM Element #' + el.id;

      const popupHtml = `
        <div style="min-width: 240px; font-family: inherit;">
          <div style="border-bottom: 1px solid #3c4552; padding-bottom: 4px; margin-bottom: 6px;">
            <span style="font-size: 9px; font-family: monospace; padding: 2px 4px; border-radius: 2px; background: rgba(255,128,0,0.2); color: #ff8000; font-weight: 700;">
              OVERPASS LIVE OSM ELEMENT
            </span>
            <h4 style="font-weight: 700; font-size: 12px; margin: 4px 0 0 0; color: #f0f6fc;">
              ${titleName}
            </h4>
          </div>
          <div style="margin-bottom: 6px;">
            ${tagsHtml}
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #8b949e; border-top: 1px dashed #30363d; padding-top: 4px;">
            <span>LAT: ${lat.toFixed(4)} | LNG: ${lng.toFixed(4)}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      overpassLayerGroupRef.current?.addLayer(marker);
    });

    // Auto-fit map bounds so user immediately sees the query results on the map!
    if (latLngBounds.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(latLngBounds);
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
        duration: 1
      });
    }
  }, [overpassLiveElements]);

  useEffect(() => {
    if (selectedMarker && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedMarker.lat, selectedMarker.lng], 15, {
        duration: 1.2
      });
    }
  }, [selectedMarker]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {showGridOverlay && <div className="absolute inset-0 map-grid-overlay z-20 pointer-events-none" />}

      {/* Floating Active Route Banner */}
      {activeRoute && (
        <div className="absolute top-3 left-3 z-30 font-mono text-xs max-w-sm rounded bg-anthrazit-950/95 border border-accent text-anthrazit-100 shadow-2xl p-2.5 backdrop-blur flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-accent text-anthrazit-950 font-bold font-mono text-[11px] shrink-0">
              {activeRoute.name}
            </span>
            <div className="truncate">
              <span className="font-bold block truncate text-[11px]">
                {activeRoute.from} ➔ {activeRoute.to}
              </span>
              <span className="text-[10px] text-anthrazit-400">
                {activeRoute.stops.length} Stationen im Linienverlauf
              </span>
            </div>
          </div>
          {onClearRoute && (
            <button
              onClick={onClearRoute}
              className="p-1 rounded hover:bg-anthrazit-800 text-anthrazit-400 hover:text-accent cursor-pointer shrink-0"
              title="Linie ausblenden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Floating Overpass Live Layer Banner */}
      {overpassLiveElements && overpassLiveElements.length > 0 && (
        <div className="absolute top-14 left-3 z-30 font-mono text-xs max-w-sm rounded bg-anthrazit-950/95 border border-accent text-anthrazit-100 shadow-2xl p-2.5 backdrop-blur flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-accent text-anthrazit-950 font-bold font-mono text-[11px] shrink-0">
              OVERPASS
            </span>
            <div className="truncate">
              <span className="font-bold block truncate text-[11px]">
                {overpassLiveElements.length} OSM-Knoten aktiv
              </span>
              <span className="text-[10px] text-anthrazit-400">
                Live aus OpenStreetMap geladen
              </span>
            </div>
          </div>
          {onClearOverpassElements && (
            <button
              onClick={onClearOverpassElements}
              className="p-1 rounded hover:bg-anthrazit-800 text-anthrazit-400 hover:text-accent cursor-pointer shrink-0"
              title="Overpass-Knoten von der Karte entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Top Right Controls: Network Lines Toggle & Tile Switcher */}
      <div className="absolute top-3 right-3 z-30 font-mono text-xs flex items-center space-x-2">
        {/* Toggle All Network Lines */}
        <button
          onClick={() => setShowAllLines(!showAllLines)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 bg-anthrazit-900/90 hover:bg-anthrazit-850 border text-xs shadow-panel backdrop-blur cursor-pointer transition-colors ${
            showAllLines 
              ? 'border-accent text-accent font-bold' 
              : 'border-anthrazit-700 text-anthrazit-400 hover:text-anthrazit-200'
          }`}
          title="Gesamtes Liniennetz mit offiziellen Linienfarben ein-/ausblenden"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>{showAllLines ? 'Netzplan: AN' : 'Netzplan: AUS'}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowTileMenu(!showTileMenu)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-anthrazit-900/90 hover:bg-anthrazit-850 border border-anthrazit-700 text-anthrazit-200 shadow-panel backdrop-blur cursor-pointer"
            title="Karten-Stil wählen"
          >
            <MapIcon className="w-3.5 h-3.5 text-accent" />
            <span className="capitalize">{activeTileProvider.replace('-', ' ')}</span>
            <Layers className="w-3 h-3 text-anthrazit-400 ml-1" />
          </button>

          {showTileMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-anthrazit-900 border border-anthrazit-700 shadow-2xl p-1 space-y-1">
              {[
                { id: 'esri-dark', name: 'Esri Dark Canvas', desc: 'OSINT Anthrazit (Standard)' },
                { id: 'esri-light', name: 'Esri Light Canvas', desc: 'Hell & Analytisch' },
                { id: 'osm-standard', name: 'OpenStreetMap', desc: 'Standard Vektorkarte' },
                { id: 'esri-sat', name: 'Esri World Satellite', desc: 'Echtfarben Luftbild' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => {
                    setActiveTileProvider(prov.id as MapTileProvider);
                    setShowTileMenu(false);
                  }}
                  className={`w-full flex flex-col text-left px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                    activeTileProvider === prov.id
                      ? 'bg-accent/15 text-accent font-bold border border-accent/30'
                      : 'text-anthrazit-300 hover:bg-anthrazit-850 hover:text-anthrazit-100'
                  }`}
                >
                  <span className="font-semibold">{prov.name}</span>
                  <span className="text-[10px] text-anthrazit-400">{prov.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Coordinate Bar */}
      <div className="absolute bottom-2 left-3 z-20 bg-anthrazit-900/90 dark:bg-anthrazit-950/90 backdrop-blur border border-anthrazit-800 text-[11px] font-mono text-anthrazit-300 px-3 py-1.5 rounded flex items-center space-x-3 shadow-panel">
        <div className="flex items-center space-x-1">
          <span className="text-accent font-bold">LAT:</span>
          <span>{cursorCoords.lat}° N</span>
        </div>
        <span className="text-anthrazit-700">|</span>
        <div className="flex items-center space-x-1">
          <span className="text-accent font-bold">LNG:</span>
          <span>{cursorCoords.lng}° E</span>
        </div>
        <span className="text-anthrazit-700">|</span>
        <div className="flex items-center space-x-1">
          <span className="text-anthrazit-400">ZOOM:</span>
          <span className="text-anthrazit-100">{cursorCoords.zoom}x</span>
        </div>
        {activeRoute && (
          <>
            <span className="text-anthrazit-700">|</span>
            <div className="flex items-center space-x-1 text-accent font-bold">
              <span>Linie {activeRoute.ref} aktiv</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
