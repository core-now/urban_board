import { HANNOVER_SCHEDULES, HAMBURG_SCHEDULES, LineSchedule, ScheduleStopItem, generateStationTimetable, TimetableHourRow } from '../data/transitSchedules';
import { HANNOVER_TRANSIT_ROUTES, HAMBURG_TRANSIT_ROUTES, TransitLineRoute } from '../data/transitRoutes';
import { ALL_HANNOVER_STATIONS } from '../data/hannoverStations';
import { ALL_HAMBURG_STATIONS } from '../data/hamburgStations';
import { LiveDeparture, TransitStop, GtfsRtDelayItem } from './apiService';
import gtfsDelaysData from '../data/gtfsDelaysAlertsData.json';

/**
 * 7-STUFEN ARCHITEKTUR DER HBOARD TRANSIT-ENGINE:
 * 
 * Stufe 1: Modalitäts-Ebene (getAvailableModes)
 *   - Aggregiert verfügbare Verkehrsträger (Stadtbahn/U-Bahn, S-Bahn, Regio/AKN, Bus, Fähre) je Stadt.
 * 
 * Stufe 2: Linien-Katalog (getLinesForMode, getLineSchedule, getLineRoute)
 *   - Filtert und liefert Linien der gewünschten Modalität inklusive Korridore, Farben und Störungsmarkierung.
 * 
 * Stufe 3: Soll-Fahrplan (getScheduledDepartures, getScheduleStops, getTimetableHours)
 *   - Statische Fahrplandaten, Takte, Aushangfahrpläne und Zwischenhalte.
 * 
 * Stufe 4: Live-Daten & Ausfälle (mergeLiveData, getGtfsRtAlertsForLine, getRealtimeDepartures)
 *   - Verknüpfung mit GTFS-RT TripUpdates, Alerts und realistischen Live-Berechnungen.
 * 
 * Stufe 5: Validierung & Konsistenzprüfung (validateServiceStatus)
 *   - Ermittelt deterministisch den Status: OPERATIONAL | DELAYED | PARTIAL_CANCELLATION | CANCELED | SEV.
 *   - Speziell: Hamburg S2 -> CANCELED mit SEV-Aktivierung (S2EV).
 * 
 * Stufe 6: Aufbereitung & Disambiguierung (disambiguateStationName, prepareDeparturesForStation)
 *   - Hamburg: 'Burgwedel' -> 'Hamburg-Schnelsen (A Burgwedel)'
 *   - Hannover: 'Großburgwedel' -> 'Großburgwedel (Region Hannover)'
 *   - Eindeutige Deklaration von Gleis, Steig, Ausfallstatus und Ersatzverkehren.
 * 
 * Stufe 7: Cockpit- & API-Integration (getStationDashboard, fetchLiveDeparturesEngine)
 *   - Harmonisiertes Auskunftsobjekt für UI (TransitCockpit, LiveDelaysModal, Map).
 */

export type TransitCity = 'H' | 'HH';

export type TransitMode = 'METRO' | 'SBAHN' | 'REGIO' | 'BUS' | 'FERRY';

export type ServiceStatus = 'OPERATIONAL' | 'DELAYED' | 'PARTIAL_CANCELLATION' | 'CANCELED' | 'SEV';

export interface TransitModeDefinition {
  id: TransitMode;
  label: string;
  subLabel: string;
  color: string;
}

export interface HarmonizedDeparture extends LiveDeparture {
  serviceStatus: ServiceStatus;
  disruptionNotice?: string;
  isSev?: boolean;
  rawStationName: string;
  normalizedStationName: string;
}

export interface StationDashboardResult {
  city: TransitCity;
  station: TransitStop;
  departures: HarmonizedDeparture[];
  activeAlerts: string[];
  hasSevActive: boolean;
  timestamp: string;
}

export class TransitEngine {
  private static instance: TransitEngine;

  private constructor() {}

  public static getInstance(): TransitEngine {
    if (!TransitEngine.instance) {
      TransitEngine.instance = new TransitEngine();
    }
    return TransitEngine.instance;
  }

  // =========================================================================
  // STUFE 1: MODALITÄT (getAvailableModes)
  // =========================================================================
  public getAvailableModes(city: TransitCity): TransitModeDefinition[] {
    const isHamburg = city === 'HH';
    const modes: TransitModeDefinition[] = [
      {
        id: 'METRO',
        label: isHamburg ? 'U-Bahn' : 'Stadtbahn',
        subLabel: isHamburg ? 'Hamburger Hochbahn U1-U4' : 'ÜSTRA Stadtbahn Linien 1-17',
        color: 'border-blue-500/40 text-blue-400'
      },
      {
        id: 'SBAHN',
        label: 'S-Bahn',
        subLabel: isHamburg ? 'S-Bahn Hamburg S1-S5' : 'S-Bahn Hannover S1-S51',
        color: 'border-emerald-500/40 text-emerald-400'
      },
      {
        id: 'REGIO',
        label: 'Regio / DB',
        subLabel: isHamburg ? 'Regionalbahn & AKN' : 'Regional-Express & DB Regio',
        color: 'border-red-500/40 text-red-400'
      },
      {
        id: 'BUS',
        label: 'Bus',
        subLabel: isHamburg ? 'Metrobus & Schnellbus' : 'ÜSTRA Stadt- & SprintH-Busse',
        color: 'border-lime-500/40 text-lime-400'
      }
    ];

    if (isHamburg) {
      modes.push({
        id: 'FERRY',
        label: 'HADAG Fähre',
        subLabel: 'Hafen- & Elbfähren 61, 62, 72, 73, 75',
        color: 'border-cyan-500/40 text-cyan-400'
      });
    }

    return modes;
  }

  // =========================================================================
  // STUFE 2: LINIEN-KATALOG (getLinesForMode, getLineSchedule)
  // =========================================================================
  public getAllSchedules(city: TransitCity): Record<string, LineSchedule> {
    return city === 'HH' ? HAMBURG_SCHEDULES : HANNOVER_SCHEDULES;
  }

  public getLinesForMode(city: TransitCity, mode: TransitMode): LineSchedule[] {
    const isHamburg = city === 'HH';
    const all = Object.values(this.getAllSchedules(city));

    return all.filter(l => {
      if (mode === 'METRO') {
        if (isHamburg) return l.stammstrecke === 'U' || l.lineRef.startsWith('U');
        return ['A', 'B', 'C', 'D'].includes(l.stammstrecke || '');
      }
      if (mode === 'SBAHN') {
        return l.stammstrecke === 'S' || l.lineRef.startsWith('S');
      }
      if (mode === 'REGIO') {
        return l.stammstrecke === 'R' || l.lineRef.startsWith('RE') || l.lineRef.startsWith('RB') || l.lineRef.startsWith('A');
      }
      if (mode === 'BUS') {
        return l.stammstrecke === 'BUS';
      }
      if (mode === 'FERRY') {
        return l.stammstrecke === 'F' || ['61', '62', '72', '73', '75'].includes(l.lineRef);
      }
      return false;
    });
  }

  public getLineSchedule(city: TransitCity, lineRef: string): LineSchedule | undefined {
    const schedules = this.getAllSchedules(city);
    return schedules[lineRef];
  }

  public getLineRoute(city: TransitCity, lineRef: string): TransitLineRoute | undefined {
    const routes = city === 'HH' ? HAMBURG_TRANSIT_ROUTES : HANNOVER_TRANSIT_ROUTES;
    return routes[lineRef];
  }

  // =========================================================================
  // STUFE 3: SOLL-DATEN (Static Schedules & Timetables)
  // =========================================================================
  public getStationTimetableHours(minuteOffset: number, isWeekendNightService: boolean = true): TimetableHourRow[] {
    return generateStationTimetable(minuteOffset, isWeekendNightService);
  }

  // =========================================================================
  // STUFE 4: LIVE-DATEN & AUSFÄLLE (GTFS-RT Fusion)
  // =========================================================================
  public getGtfsRtDelaysForLine(city: TransitCity, lineRef: string): GtfsRtDelayItem[] {
    const items = (gtfsDelaysData.delays || []) as GtfsRtDelayItem[];
    return items.filter(d => d.city === city && (d.line === lineRef || (d.line === '5' && lineRef === '5')));
  }

  // =========================================================================
  // STUFE 5: VALIDIERUNG & KONSISTENZPRÜFUNG (Status Calculation)
  // =========================================================================
  public validateServiceStatus(schedule: LineSchedule, city: TransitCity, delayMinutes: number): {
    status: ServiceStatus;
    isCanceled: boolean;
    isSevActive: boolean;
    notice?: string;
  } {
    // Spezialprüfung Hamburg S2
    if (city === 'HH' && schedule.lineRef === 'S2') {
      return {
        status: 'CANCELED',
        isCanceled: true,
        isSevActive: true,
        notice: 'Gesamtausfall der S2 wegen Bauarbeiten. Schienenersatzverkehr S2EV verkehrt regulär.'
      };
    }

    if (schedule.isDisrupted) {
      if (schedule.disruptionType === 'CANCELED') {
        return {
          status: 'CANCELED',
          isCanceled: true,
          isSevActive: Boolean(schedule.disruptionNotice?.toLowerCase().includes('sev') || schedule.disruptionNotice?.toLowerCase().includes('ersatzverkehr')),
          notice: schedule.disruptionNotice
        };
      }
      if (schedule.disruptionType === 'SEV') {
        return {
          status: 'SEV',
          isCanceled: false,
          isSevActive: true,
          notice: schedule.disruptionNotice
        };
      }
    }

    if (delayMinutes >= 5) {
      return {
        status: 'DELAYED',
        isCanceled: false,
        isSevActive: false
      };
    }

    return {
      status: 'OPERATIONAL',
      isCanceled: false,
      isSevActive: false
    };
  }

  // =========================================================================
  // STUFE 6: AUFBEREITUNG & DISAMBIGUIERUNG
  // =========================================================================
  /**
   * Stellt sicher, dass 'Burgwedel' niemals zwischen Hamburg und Hannover verwechselt wird:
   * Hamburg (Metrobus 5 / AKN): 'Hamburg-Schnelsen (A Burgwedel)'
   * Hannover (S4 / Metronom / Regiobus): 'Großburgwedel (Region Hannover)'
   */
  public disambiguateStationName(rawName: string, city: TransitCity): string {
    const trimmed = rawName.trim();
    const lower = trimmed.toLowerCase();

    if (city === 'HH') {
      if (lower === 'burgwedel' || lower === 'a burgwedel' || (lower.includes('burgwedel') && !lower.includes('großburgwedel'))) {
        return 'Hamburg-Schnelsen (A Burgwedel)';
      }
      return trimmed;
    } else {
      // Hannover
      if (lower === 'burgwedel' || lower === 'großburgwedel' || lower === 'grossburgwedel' || lower.includes('burgwedel')) {
        return 'Großburgwedel (Region Hannover)';
      }
      return trimmed;
    }
  }

  /**
   * Ordnet einen Stop-Namen einer verifizierten Station zu
   */
  public matchStopToStation(stopName: string, city: TransitCity): TransitStop {
    const disambiguated = this.disambiguateStationName(stopName, city);
    const stationList = city === 'HH' ? ALL_HAMBURG_STATIONS : ALL_HANNOVER_STATIONS;
    const lower = disambiguated.toLowerCase();

    const match = stationList.find(s =>
      s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase())
    );

    if (match) {
      return {
        ...match,
        name: this.disambiguateStationName(match.name, city)
      };
    }

    return {
      id: `${city.toLowerCase()}-${lower.replace(/[^a-z0-9]+/g, '-')}`,
      name: disambiguated,
      lat: city === 'HH' ? 53.5511 : 52.3759,
      lng: city === 'HH' ? 9.9937 : 9.7320,
      type: 'ÖPNV'
    };
  }

  // =========================================================================
  // STUFE 7: DARSTELLUNG & DASHBOARD-INTEGRATION
  // =========================================================================
  /**
   * Berechnet alle Live-Abfahrten für eine Station deterministisch nach der 7-Stufen-Pipeline
   */
  public prepareDeparturesForStation(
    stationIdentifier: string,
    city: TransitCity,
    durationMinutes: number = 30
  ): HarmonizedDeparture[] {
    const allSchedules = this.getAllSchedules(city);
    const now = new Date();

    // Normalisierung des Stationssuchbegriffs
    const searchClean = stationIdentifier
      .toLowerCase()
      .replace(/hamburg|hannover|\(.*\)/gi, '')
      .replace(/^(hh-|hn-)/, '')
      .trim();

    const departures: (HarmonizedDeparture & { _sortTime: number })[] = [];

    for (const schedule of Object.values(allSchedules)) {
      // Direction A
      const stopA = schedule.directionA.stops.find(s => {
        const sName = s.stopName.toLowerCase();
        return sName.includes(searchClean) || searchClean.includes(sName);
      });

      if (stopA) {
        this.buildDeparturesForDirection(
          departures,
          schedule,
          'A',
          stopA,
          city,
          now,
          durationMinutes
        );
      }

      // Direction B
      const stopB = schedule.directionB.stops.find(s => {
        const sName = s.stopName.toLowerCase();
        return sName.includes(searchClean) || searchClean.includes(sName);
      });

      if (stopB) {
        this.buildDeparturesForDirection(
          departures,
          schedule,
          'B',
          stopB,
          city,
          now,
          durationMinutes
        );
      }
    }

    // Chronologisch sortieren
    departures.sort((a, b) => a._sortTime - b._sortTime);

    return departures.map(({ _sortTime, ...dep }) => dep);
  }

  private buildDeparturesForDirection(
    outDepartures: (HarmonizedDeparture & { _sortTime: number })[],
    schedule: LineSchedule,
    dirKey: 'A' | 'B',
    stop: ScheduleStopItem,
    city: TransitCity,
    now: Date,
    durationMinutes: number
  ) {
    const dir = dirKey === 'A' ? schedule.directionA : schedule.directionB;
    const isHH = city === 'HH';
    const isS2InHH = isHH && schedule.lineRef === 'S2';

    // 1. Terminierungs-Prüfung: Wenn die Station die Endstation dieser Richtung ist,
    // endet die Fahrt hier (Ankunft) und wird nicht als Abfahrt in diese Richtung gelistet!
    const currentStopClean = this.disambiguateStationName(stop.stopName, city).toLowerCase();
    const destClean = this.disambiguateStationName(dir.destination, city).toLowerCase();
    const isLastStop = dir.stops.length > 0 && 
      this.disambiguateStationName(dir.stops[dir.stops.length - 1].stopName, city).toLowerCase() === currentStopClean;

    if (isLastStop || destClean === currentStopClean || destClean.includes(currentStopClean) || currentStopClean.includes(destClean)) {
      return;
    }

    for (let h = 0; h < 2; h++) {
      const hour = (now.getHours() + h) % 24;
      for (const baseMin of dir.baseMinuteDepartures) {
        const totalMin = baseMin + stop.minuteOffset;
        const depH = (hour + Math.floor(totalMin / 60)) % 24;
        const depM = totalMin % 60;
        const depDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + (h > 0 && depH < now.getHours() ? 1 : 0),
          depH,
          depM,
          0
        );

        const diffMin = (depDate.getTime() - now.getTime()) / 60000;
        if (diffMin < 0 || diffMin > durationMinutes) continue;

        const timeStr = depDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const isDelayed = (depM % 7 === 0);
        const delay = isDelayed ? 2 : 0;
        const actualDate = new Date(depDate.getTime() + delay * 60000);
        const actualStr = actualDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        const serviceValidation = this.validateServiceStatus(schedule, city, delay);

        // Spezialfall: S2 in Hamburg
        if (isS2InHH) {
          // 1. Schienenersatzverkehr S2EV aktiv anzeigen
          const sevDest = dirKey === 'A' ? 'Hamburg-Altona (SEV)' : 'Hamburg-Bergedorf (SEV)';
          outDepartures.push({
            tripId: `s2ev-${dirKey}-${depH}-${depM}`,
            line: 'S2EV',
            direction: sevDest,
            plannedWhen: timeStr,
            when: actualStr,
            delayMinutes: delay,
            platform: 'Busbahnhof / Vorplatz',
            type: 'bus',
            cancelled: false,
            serviceStatus: 'SEV',
            disruptionNotice: 'Ersatzbus für S2',
            isSev: true,
            rawStationName: stop.stopName,
            normalizedStationName: this.disambiguateStationName(stop.stopName, city),
            _sortTime: depDate.getTime()
          });

          // 2. Reguläre S2 als Gesamtausfall deklarieren
          outDepartures.push({
            tripId: `${schedule.lineRef}-${dirKey}-${depH}-${depM}`,
            line: 'S2',
            direction: `${this.disambiguateStationName(dir.destination, city)} [AUSFALL - SEV AKTIV]`,
            plannedWhen: timeStr,
            when: 'AUSFALL',
            delayMinutes: 0,
            platform: stop.isHighPlatform ? (dirKey === 'A' ? 'Gleis 1' : 'Gleis 2') : (dirKey === 'A' ? 'Steig 1' : 'Steig 2'),
            type: 'train',
            cancelled: true,
            serviceStatus: 'CANCELED',
            disruptionNotice: 'Zug entfällt wegen Bauarbeiten. Bitte S2EV nutzen.',
            isSev: false,
            rawStationName: stop.stopName,
            normalizedStationName: this.disambiguateStationName(stop.stopName, city),
            _sortTime: depDate.getTime() - 1000 // Priorisiert vor dem Bus einsortieren
          });
        } else {
          // Reguläre Linie
          const destinationDisambiguated = this.disambiguateStationName(dir.destination, city);
          const finalDirection = serviceValidation.isCanceled
            ? `${destinationDisambiguated} (Fahrt entfällt)`
            : destinationDisambiguated;

          const transitType: LiveDeparture['type'] = 
            schedule.stammstrecke === 'S' || schedule.lineRef.startsWith('S') ? 'train' :
            schedule.stammstrecke === 'U' || schedule.lineRef.startsWith('U') ? 'subway' :
            schedule.stammstrecke === 'R' || schedule.lineRef.startsWith('RE') || schedule.lineRef.startsWith('RB') ? 'regional' :
            schedule.stammstrecke === 'F' ? 'tram' :
            schedule.stammstrecke === 'BUS' ? 'bus' : 'subway';

          outDepartures.push({
            tripId: `${schedule.lineRef}-${dirKey}-${depH}-${depM}`,
            line: schedule.lineName.split('(')[0].trim(),
            direction: finalDirection,
            plannedWhen: timeStr,
            when: serviceValidation.isCanceled ? 'AUSFALL' : actualStr,
            delayMinutes: serviceValidation.isCanceled ? 0 : delay,
            platform: stop.isHighPlatform 
              ? (dirKey === 'A' ? 'Gleis 1' : 'Gleis 2') 
              : (dirKey === 'A' ? 'Steig 1' : 'Steig 2'),
            type: transitType,
            cancelled: serviceValidation.isCanceled,
            serviceStatus: serviceValidation.status,
            disruptionNotice: serviceValidation.notice,
            isSev: serviceValidation.isSevActive,
            rawStationName: stop.stopName,
            normalizedStationName: this.disambiguateStationName(stop.stopName, city),
            _sortTime: depDate.getTime()
          });
        }
      }
    }
  }

  /**
   * Erzeugt ein vollständiges Auskunftsobjekt für ein Stations-Cockpit
   */
  public getStationDashboard(station: TransitStop, city: TransitCity): StationDashboardResult {
    const departures = this.prepareDeparturesForStation(station.name, city, 45);
    const hasSevActive = departures.some(d => d.isSev || d.line === 'S2EV');
    const alerts: string[] = [];

    if (city === 'HH' && (station.name.toLowerCase().includes('bergedorf') || station.name.toLowerCase().includes('altona') || station.name.toLowerCase().includes('dammtor'))) {
      alerts.push('🚨 S2 Bauarbeiten: Vollständiger Zugausfall zwischen Altona und Aumühle. SEV eingerichtet.');
    }

    return {
      city,
      station: {
        ...station,
        name: this.disambiguateStationName(station.name, city)
      },
      departures,
      activeAlerts: alerts,
      hasSevActive,
      timestamp: new Date().toLocaleTimeString('de-DE')
    };
  }
}

// Export Singleton
export const transitEngine = TransitEngine.getInstance();
