// Offizielle Fahrplandaten, statische Aushangfahrpläne (Soll-Zeiten) und Haltestellenfolgen der ÜSTRA / GVH Hannover

export interface ScheduleStopItem {
  stopName: string;
  minuteOffset: number; // Fahrzeit in Minuten ab Startstation
  isHighPlatform?: boolean; // Barrierefreier Hochbahnsteig
  notice?: string; // z.B. Baustellenhinweis
  transferLines?: string[]; // Umsteigemöglichkeiten (z. B. ['S-Bahn', '1', '2'])
}

// Typ für die stündlichen Soll-Abfahrtsminuten an einer Haltestelle
export interface TimetableHourRow {
  hour: number; // 4 bis 24 (0 bis 3)
  minutesWeekday: number[]; // Mo - Fr
  minutesSaturday: number[]; // Sa
  minutesSunday: number[]; // So & Feiertag
}

export interface LineSchedule {
  lineRef: string;
  lineName: string;
  stammstrecke: 'A' | 'B' | 'C' | 'D' | 'S' | 'U' | 'F' | 'R' | 'BUS';
  corridorName: string;
  color: string;
  directionA: {
    origin: string;
    destination: string;
    totalMinutes: number;
    baseMinuteDepartures: number[];
    stops: ScheduleStopItem[];
  };
  directionB: {
    origin: string;
    destination: string;
    totalMinutes: number;
    baseMinuteDepartures: number[];
    stops: ScheduleStopItem[];
  };
  frequency: {
    peak: string;     // z. B. "10 Min."
    offPeak: string;  // z. B. "15 Min."
    night: string;    // z. B. "60 Min. / NStB am Wochenende"
  };
  operatingHours: {
    firstTrain: string;
    lastTrain: string;
    nightService: boolean;
  };
  specialNotice?: string;
}

// Generator für realistische, exakte Soll-Aushangfahrpläne basierend auf Takt und Haltestellen-Offset
export function generateStationTimetable(minuteOffset: number, isWeekendNightService: boolean = true): TimetableHourRow[] {
  const rows: TimetableHourRow[] = [];

  for (let h = 4; h <= 28; h++) {
    const displayHour = h >= 24 ? h - 24 : h;

    // 1. Wochentags (Mo-Fr)
    let weekdayMins: number[] = [];
    if (h === 4) {
      weekdayMins = [(9 + minuteOffset) % 60, (39 + minuteOffset) % 60].filter(m => !isNaN(m)).sort((a,b)=>a-b);
    } else if (h === 5) {
      weekdayMins = [(5 + minuteOffset) % 60, (18 + minuteOffset) % 60, (33 + minuteOffset) % 60, (48 + minuteOffset) % 60].sort((a,b)=>a-b);
    } else if (h >= 6 && h <= 19) {
      const base = (2 + minuteOffset) % 10;
      weekdayMins = [base, base + 10, base + 20, base + 30, base + 40, base + 50].map(m => (m + 60) % 60).sort((a,b)=>a-b);
    } else if (h >= 20 && h <= 23) {
      const base = (5 + minuteOffset) % 15;
      weekdayMins = [base, base + 15, base + 30, base + 45].map(m => (m + 60) % 60).sort((a,b)=>a-b);
    } else if (h === 24 || h === 0) {
      weekdayMins = [(9 + minuteOffset) % 60, (39 + minuteOffset) % 60].sort((a,b)=>a-b);
    } else if (h === 25 || h === 1) {
      if (isWeekendNightService) weekdayMins = [(1 + minuteOffset) % 60];
    }

    // 2. Samstag
    let satMins: number[] = [];
    if (h === 4) {
      satMins = [(39 + minuteOffset) % 60];
    } else if (h === 5) {
      satMins = [(9 + minuteOffset) % 60, (39 + minuteOffset) % 60].sort((a,b)=>a-b);
    } else if (h >= 6 && h <= 8) {
      satMins = [(5 + minuteOffset) % 15, (5 + minuteOffset + 15) % 15, (5 + minuteOffset + 30) % 60, (5 + minuteOffset + 45) % 60].sort((a,b)=>a-b);
    } else if (h >= 9 && h <= 19) {
      const base = (2 + minuteOffset) % 10;
      satMins = [base, base + 10, base + 20, base + 30, base + 40, base + 50].map(m => (m + 60) % 60).sort((a,b)=>a-b);
    } else if (h >= 20 && h <= 23) {
      const base = (5 + minuteOffset) % 15;
      satMins = [base, base + 15, base + 30, base + 45].map(m => (m + 60) % 60).sort((a,b)=>a-b);
    } else if (h >= 24) {
      satMins = [(1 + minuteOffset) % 60];
    }

    // 3. Sonntag & Feiertag
    let sunMins: number[] = [];
    if (h >= 5 && h <= 8) {
      sunMins = [(9 + minuteOffset) % 60, (39 + minuteOffset) % 60].sort((a,b)=>a-b);
    } else if (h >= 9 && h <= 19) {
      const base = (5 + minuteOffset) % 15;
      sunMins = [base, base + 15, base + 30, base + 45].map(m => (m + 60) % 60).sort((a,b)=>a-b);
    } else if (h >= 20 && h <= 23) {
      const base = (5 + minuteOffset) % 15;
      sunMins = [base, base + 15, base + 30, base + 45].map(m => (m + 60) % 60).sort((a,b)=>a-b);
    } else if (h >= 24) {
      sunMins = [(1 + minuteOffset) % 60];
    }

    rows.push({
      hour: displayHour,
      minutesWeekday: Array.from(new Set(weekdayMins)),
      minutesSaturday: Array.from(new Set(satMins)),
      minutesSunday: Array.from(new Set(sunMins))
    });
  }

  return rows;
}

export const HANNOVER_SCHEDULES: Record<string, LineSchedule> = {
  // --- 🟡 C-STRECKE: LINIE 5 (OFFIZIELL: STÖCKEN ⇄ ANDERTEN) ---
  '5': {
    lineRef: '5',
    lineName: 'Stadtbahn 5',
    stammstrecke: 'C',
    corridorName: 'C-West / C-Ost (Stöcken – Herrenhausen – Steintor – Kröpcke – Aegi – Kleefeld – Anderten)',
    color: '#eab308',
    directionA: {
      origin: 'Stöcken',
      destination: 'Anderten',
      totalMinutes: 45,
      baseMinuteDepartures: [2, 12, 22, 32, 42, 52],
      stops: [
        { stopName: 'Stöcken', minuteOffset: 0, isHighPlatform: true, transferLines: ['Bus'] },
        { stopName: 'Stöckener Markt', minuteOffset: 1, isHighPlatform: true },
        { stopName: 'Freudenthalstraße', minuteOffset: 3, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Stadtfriedhof Stöcken', minuteOffset: 5, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Bahnhof Leinhausen', minuteOffset: 6, isHighPlatform: true, transferLines: ['S-Bahn', '4'] },
        { stopName: 'Herrenhäuser Markt', minuteOffset: 7, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Schaumburgstraße', minuteOffset: 9, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Herrenhäuser Gärten', minuteOffset: 10, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Appelstraße', minuteOffset: 11, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Schneiderbg./W.-Busch-Mus.', minuteOffset: 13, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Leibniz Universität', minuteOffset: 14, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Königsworther Platz', minuteOffset: 15, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Steintor', minuteOffset: 17, isHighPlatform: true, transferLines: ['4', '6', '10', '11', '17'] },
        { stopName: 'Kröpcke (Ankunft)', minuteOffset: 18, isHighPlatform: true, transferLines: ['A/B/C-Strecken'] },
        { stopName: 'Kröpcke (Abfahrt)', minuteOffset: 19, isHighPlatform: true, transferLines: ['A/B/C-Strecken'] },
        { stopName: 'Aegidientorplatz', minuteOffset: 21, isHighPlatform: true, transferLines: ['1', '2', '4', '6', '8', '11'] },
        { stopName: 'Marienstraße', minuteOffset: 22, isHighPlatform: true, transferLines: ['4', '6', '11', 'S-Bahn'] },
        { stopName: 'Braunschweiger Platz', minuteOffset: 23, isHighPlatform: true, transferLines: ['4', '6', '11'] },
        { stopName: 'Clausewitzstraße', minuteOffset: 25, isHighPlatform: true, transferLines: ['4', '11'] },
        { stopName: 'Kantplatz', minuteOffset: 27, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Uhlhornstraße', minuteOffset: 28, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Nackenberg', minuteOffset: 30, isHighPlatform: true, transferLines: ['4'] },
        { stopName: 'Annastift', minuteOffset: 31, isHighPlatform: true },
        { stopName: 'Bleekstraße', minuteOffset: 32, isHighPlatform: true, transferLines: ['6'] },
        { stopName: 'Saarbrückener Straße', minuteOffset: 33, isHighPlatform: true },
        { stopName: 'Großer Hillen', minuteOffset: 35, isHighPlatform: true },
        { stopName: 'Tiergarten', minuteOffset: 37, isHighPlatform: true },
        { stopName: 'Ostfeldstraße', minuteOffset: 38, isHighPlatform: true },
        { stopName: 'Königsberger Ring', minuteOffset: 39, isHighPlatform: true },
        { stopName: 'Anderten', minuteOffset: 41, isHighPlatform: true, transferLines: ['Bus'] }
      ]
    },
    directionB: {
      origin: 'Anderten',
      destination: 'Stöcken',
      totalMinutes: 45,
      baseMinuteDepartures: [0, 10, 20, 30, 40, 50],
      stops: [
        { stopName: 'Anderten', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Königsberger Ring', minuteOffset: 1, isHighPlatform: true },
        { stopName: 'Ostfeldstraße', minuteOffset: 2, isHighPlatform: true },
        { stopName: 'Tiergarten', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Großer Hillen', minuteOffset: 5, isHighPlatform: true },
        { stopName: 'Saarbrückener Straße', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Bleekstraße', minuteOffset: 8, isHighPlatform: true },
        { stopName: 'Annastift', minuteOffset: 9, isHighPlatform: true },
        { stopName: 'Nackenberg', minuteOffset: 10, isHighPlatform: true },
        { stopName: 'Uhlhornstraße', minuteOffset: 12, isHighPlatform: true },
        { stopName: 'Kantplatz', minuteOffset: 13, isHighPlatform: true },
        { stopName: 'Clausewitzstraße', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Braunschweiger Platz', minuteOffset: 17, isHighPlatform: true },
        { stopName: 'Marienstraße', minuteOffset: 18, isHighPlatform: true },
        { stopName: 'Aegidientorplatz', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Kröpcke (Ankunft)', minuteOffset: 21, isHighPlatform: true },
        { stopName: 'Kröpcke (Abfahrt)', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Steintor', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'Königsworther Platz', minuteOffset: 25, isHighPlatform: true },
        { stopName: 'Leibniz Universität', minuteOffset: 27, isHighPlatform: true },
        { stopName: 'Schneiderbg./W.-Busch-Mus.', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Appelstraße', minuteOffset: 29, isHighPlatform: true },
        { stopName: 'Herrenhäuser Gärten', minuteOffset: 30, isHighPlatform: true },
        { stopName: 'Schaumburgstraße', minuteOffset: 31, isHighPlatform: true },
        { stopName: 'Herrenhäuser Markt', minuteOffset: 33, isHighPlatform: true },
        { stopName: 'Bahnhof Leinhausen', minuteOffset: 35, isHighPlatform: true },
        { stopName: 'Stadtfriedhof Stöcken', minuteOffset: 36, isHighPlatform: true },
        { stopName: 'Freudenthalstraße', minuteOffset: 38, isHighPlatform: true },
        { stopName: 'Stöckener Markt', minuteOffset: 39, isHighPlatform: true },
        { stopName: 'Stöcken', minuteOffset: 41, isHighPlatform: true }
      ]
    },
    frequency: { peak: '10 Min.', offPeak: '15 Min. (ab 20:20)', night: '60 Min. (NachtSternverkehr Fr/Sa & Sa/So)' },
    operatingHours: { firstTrain: '04:09', lastTrain: '00:39 (Mo-Do) / 03:54 (Fr/Sa)', nightService: true }
  },

  // --- 🟡 C-STRECKE: LINIE 6 ---
  '6': {
    lineRef: '6',
    lineName: 'Stadtbahn 6',
    stammstrecke: 'C',
    corridorName: 'C-Nord / C-Ost (Nordhafen – Hainholz – Steintor – Kröpcke – Aegi – Bemerode – Messe/Ost)',
    color: '#f59e0b',
    specialNotice: 'Haltestelle Bahnhof Nordstadt entfällt wegen Bauarbeiten bis auf Weiteres.',
    directionA: {
      origin: 'Nordhafen',
      destination: 'Messe/Ost (EXPO-Plaza)',
      totalMinutes: 38,
      baseMinuteDepartures: [8, 18, 28, 38, 48, 58],
      stops: [
        { stopName: 'Nordhafen', minuteOffset: 0, isHighPlatform: true, transferLines: ['Bus'] },
        { stopName: 'Mecklenheidestraße', minuteOffset: 1, isHighPlatform: true },
        { stopName: 'Beneckeallee', minuteOffset: 2, isHighPlatform: true },
        { stopName: 'Friedenauer Straße', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Krepenstraße', minuteOffset: 4, isHighPlatform: true },
        { stopName: 'Hainhölzer Markt', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Fenskestraße', minuteOffset: 7, isHighPlatform: true, transferLines: ['Bus 121'] },
        { stopName: 'Bahnhof Nordstadt', minuteOffset: 9, isHighPlatform: false, notice: 'Entfällt wegen Bauarbeiten', transferLines: ['S-Bahn S1/S2/S4/S5'] },
        { stopName: 'An der Strangriede', minuteOffset: 11, isHighPlatform: true, transferLines: ['11'] },
        { stopName: 'Kopernikusstraße', minuteOffset: 12, isHighPlatform: true, transferLines: ['11'] },
        { stopName: 'Christuskirche', minuteOffset: 13, isHighPlatform: true, transferLines: ['11'] },
        { stopName: 'Steintor', minuteOffset: 15, isHighPlatform: true, transferLines: ['4', '5', '10', '11', '17'] },
        { stopName: 'Kröpcke (Ankunft)', minuteOffset: 16, isHighPlatform: true, transferLines: ['A/B/C-Strecken'] },
        { stopName: 'Kröpcke (Abfahrt)', minuteOffset: 17, isHighPlatform: true, transferLines: ['A/B/C-Strecken'] },
        { stopName: 'Aegidientorplatz', minuteOffset: 19, isHighPlatform: true, transferLines: ['1', '2', '4', '5', '8', '11'] },
        { stopName: 'Marienstraße', minuteOffset: 20, isHighPlatform: true, transferLines: ['4', '5', '11', 'S-Bahn'] },
        { stopName: 'Braunschweiger Platz', minuteOffset: 21, isHighPlatform: true, transferLines: ['4', '5', '11'] },
        { stopName: 'Freundallee', minuteOffset: 23, isHighPlatform: true },
        { stopName: 'Kerstingstraße', minuteOffset: 25, isHighPlatform: true },
        { stopName: 'Kinderkrankenhs. auf der Bult', minuteOffset: 26, isHighPlatform: true },
        { stopName: 'Zuschlagstraße', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Bünteweg/Ti.Hochschule', minuteOffset: 29, isHighPlatform: true },
        { stopName: 'August-Madsack-Straße', minuteOffset: 30, isHighPlatform: true },
        { stopName: 'Seelhorster Allee', minuteOffset: 31, isHighPlatform: true },
        { stopName: 'Emslandstraße', minuteOffset: 32, isHighPlatform: true },
        { stopName: 'Brabeckstraße', minuteOffset: 34, isHighPlatform: true },
        { stopName: 'Feldbuschwende', minuteOffset: 35, isHighPlatform: true },
        { stopName: 'Kronsberg', minuteOffset: 36, isHighPlatform: true },
        { stopName: 'Krügerskamp', minuteOffset: 37, isHighPlatform: true },
        { stopName: 'Stockholmer Allee', minuteOffset: 39, isHighPlatform: true },
        { stopName: 'Messe/Ost (EXPO-Plaza)', minuteOffset: 41, isHighPlatform: true, transferLines: ['Bus'] }
      ]
    },
    directionB: {
      origin: 'Messe/Ost (EXPO-Plaza)',
      destination: 'Nordhafen',
      totalMinutes: 38,
      baseMinuteDepartures: [1, 11, 21, 31, 41, 51],
      stops: [
        { stopName: 'Messe/Ost (EXPO-Plaza)', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Stockholmer Allee', minuteOffset: 1, isHighPlatform: true },
        { stopName: 'Krügerskamp', minuteOffset: 2, isHighPlatform: true },
        { stopName: 'Kronsberg', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Feldbuschwende', minuteOffset: 4, isHighPlatform: true },
        { stopName: 'Brabeckstraße', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Emslandstraße', minuteOffset: 8, isHighPlatform: true },
        { stopName: 'Seelhorster Allee', minuteOffset: 9, isHighPlatform: true },
        { stopName: 'August-Madsack-Straße', minuteOffset: 10, isHighPlatform: true },
        { stopName: 'Bünteweg/Ti.Hochschule', minuteOffset: 11, isHighPlatform: true },
        { stopName: 'Zuschlagstraße', minuteOffset: 12, isHighPlatform: true },
        { stopName: 'Kinderkrankenhs. auf der Bult', minuteOffset: 14, isHighPlatform: true },
        { stopName: 'Kerstingstraße', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Freundallee', minuteOffset: 17, isHighPlatform: true },
        { stopName: 'Braunschweiger Platz', minuteOffset: 19, isHighPlatform: true },
        { stopName: 'Marienstraße', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Aegidientorplatz', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Kröpcke (Ankunft)', minuteOffset: 23, isHighPlatform: true },
        { stopName: 'Kröpcke (Abfahrt)', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'Steintor', minuteOffset: 26, isHighPlatform: true },
        { stopName: 'Christuskirche', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Kopernikusstraße', minuteOffset: 29, isHighPlatform: true },
        { stopName: 'An der Strangriede', minuteOffset: 31, isHighPlatform: true },
        { stopName: 'Bahnhof Nordstadt', minuteOffset: 33, isHighPlatform: false, notice: 'Entfällt wegen Bauarbeiten' },
        { stopName: 'Fenskestraße', minuteOffset: 35, isHighPlatform: true },
        { stopName: 'Hainhölzer Markt', minuteOffset: 36, isHighPlatform: true },
        { stopName: 'Krepenstraße', minuteOffset: 38, isHighPlatform: true },
        { stopName: 'Friedenauer Straße', minuteOffset: 39, isHighPlatform: true },
        { stopName: 'Beneckeallee', minuteOffset: 40, isHighPlatform: true },
        { stopName: 'Mecklenheidestraße', minuteOffset: 41, isHighPlatform: true },
        { stopName: 'Nordhafen', minuteOffset: 43, isHighPlatform: true }
      ]
    },
    frequency: { peak: '10 Min.', offPeak: '15 Min. (ab 20:18)', night: '60 Min. (NachtSternverkehr Fr/Sa & Sa/So)' },
    operatingHours: { firstTrain: '04:09', lastTrain: '00:33 (Mo-Do) / 03:54 (Fr/Sa)', nightService: true }
  },

  // --- 🔴 A-STRECKE ---
  '3': {
    lineRef: '3',
    lineName: 'Stadtbahn 3',
    stammstrecke: 'A',
    corridorName: 'A-Strecke (Wettbergen – Waterloo – Hbf – Altwarmbüchen)',
    color: '#3b82f6',
    directionA: {
      origin: 'Wettbergen',
      destination: 'Altwarmbüchen',
      totalMinutes: 38,
      baseMinuteDepartures: [2, 12, 22, 32, 42, 52],
      stops: [
        { stopName: 'Wettbergen', minuteOffset: 0, isHighPlatform: true, transferLines: ['7', 'Bus'] },
        { stopName: 'Tresckowstraße', minuteOffset: 2, isHighPlatform: true, transferLines: ['7'] },
        { stopName: 'Wallensteinstraße', minuteOffset: 4, isHighPlatform: true, transferLines: ['7', '17'] },
        { stopName: 'Beekestraße', minuteOffset: 6, isHighPlatform: true, transferLines: ['7', '17'] },
        { stopName: 'Bahnhof Linden/Fischerhof', minuteOffset: 8, isHighPlatform: true, transferLines: ['S-Bahn', '7', '17'] },
        { stopName: 'Stadionbrücke', minuteOffset: 10, isHighPlatform: true, transferLines: ['7', '17'] },
        { stopName: 'Allerweg', minuteOffset: 12, isHighPlatform: true, transferLines: ['7', '13', '17'] },
        { stopName: 'Waterloo', minuteOffset: 14, isHighPlatform: true, transferLines: ['7', '9', '13'] },
        { stopName: 'Markthalle / Landtag', minuteOffset: 16, isHighPlatform: true, transferLines: ['7', '9', '13'] },
        { stopName: 'Kröpcke', minuteOffset: 18, isHighPlatform: true, transferLines: ['1', '2', '4', '5', '6', '7', '8', '9', '11', '13'] },
        { stopName: 'Hauptbahnhof', minuteOffset: 20, isHighPlatform: true, transferLines: ['Fernverkehr', 'S-Bahn', '1', '2', '7', '8', '9', '10', '13', '17'] },
        { stopName: 'Sedanstraße / Gerberstraße', minuteOffset: 22, isHighPlatform: true, transferLines: ['7', '9', '13'] },
        { stopName: 'Lister Platz', minuteOffset: 24, isHighPlatform: true, transferLines: ['7', '9', '13', 'Bus'] },
        { stopName: 'Lortzingstraße', minuteOffset: 26, isHighPlatform: true, transferLines: ['7', '9', '13'] },
        { stopName: 'Vier Grenzen', minuteOffset: 28, isHighPlatform: true, transferLines: ['7', '9', '13'] },
        { stopName: 'Pelikanstraße', minuteOffset: 30, isHighPlatform: true, transferLines: ['7', '9', '13'] },
        { stopName: 'Spannhagengarten', minuteOffset: 32, isHighPlatform: true, transferLines: ['7', '9', '13', 'Bus'] },
        { stopName: 'Noltemeyerbrücke', minuteOffset: 34, isHighPlatform: true, transferLines: ['7', 'Bus'] },
        { stopName: 'Paracelsusweg', minuteOffset: 35, isHighPlatform: true, transferLines: ['7'] },
        { stopName: 'Opelstraße', minuteOffset: 36, isHighPlatform: true },
        { stopName: 'Altwarmbüchen', minuteOffset: 38, isHighPlatform: true, transferLines: ['Bus'] }
      ]
    },
    directionB: {
      origin: 'Altwarmbüchen',
      destination: 'Wettbergen',
      totalMinutes: 38,
      baseMinuteDepartures: [5, 15, 25, 35, 45, 55],
      stops: [
        { stopName: 'Altwarmbüchen', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Opelstraße', minuteOffset: 2, isHighPlatform: true },
        { stopName: 'Paracelsusweg', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Noltemeyerbrücke', minuteOffset: 4, isHighPlatform: true },
        { stopName: 'Spannhagengarten', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Pelikanstraße', minuteOffset: 8, isHighPlatform: true },
        { stopName: 'Vier Grenzen', minuteOffset: 10, isHighPlatform: true },
        { stopName: 'Lortzingstraße', minuteOffset: 12, isHighPlatform: true },
        { stopName: 'Lister Platz', minuteOffset: 14, isHighPlatform: true },
        { stopName: 'Sedanstraße / Gerberstraße', minuteOffset: 16, isHighPlatform: true },
        { stopName: 'Hauptbahnhof', minuteOffset: 18, isHighPlatform: true },
        { stopName: 'Kröpcke', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Markthalle / Landtag', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Waterloo', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'Allerweg', minuteOffset: 26, isHighPlatform: true },
        { stopName: 'Stadionbrücke', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Bahnhof Linden/Fischerhof', minuteOffset: 30, isHighPlatform: true },
        { stopName: 'Beekestraße', minuteOffset: 32, isHighPlatform: true },
        { stopName: 'Wallensteinstraße', minuteOffset: 34, isHighPlatform: true },
        { stopName: 'Tresckowstraße', minuteOffset: 36, isHighPlatform: true },
        { stopName: 'Wettbergen', minuteOffset: 38, isHighPlatform: true }
      ]
    },
    frequency: { peak: '10 Min.', offPeak: '15 Min.', night: '30 Min. / NStB Fr+Sa' },
    operatingHours: { firstTrain: '04:12', lastTrain: '01:15', nightService: true }
  },

  // --- 🔵 B-STRECKE ---
  '1': {
    lineRef: '1',
    lineName: 'Stadtbahn 1',
    stammstrecke: 'B',
    corridorName: 'B-Strecke (Langenhagen – Hbf – Döhren – Sarstedt)',
    color: '#ff8000',
    directionA: {
      origin: 'Langenhagen',
      destination: 'Sarstedt',
      totalMinutes: 48,
      baseMinuteDepartures: [0, 10, 20, 30, 40, 50],
      stops: [
        { stopName: 'Langenhagen', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Langenhagen / Zentrum', minuteOffset: 2, isHighPlatform: true, transferLines: ['Bus'] },
        { stopName: 'Berliner Platz', minuteOffset: 4, isHighPlatform: true },
        { stopName: 'Alter Flughafen', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Wiesenau', minuteOffset: 8, isHighPlatform: true },
        { stopName: 'Kabelkamp', minuteOffset: 10, isHighPlatform: true },
        { stopName: 'Niedersachsenring', minuteOffset: 12, isHighPlatform: true, transferLines: ['2'] },
        { stopName: 'Dragonerstraße', minuteOffset: 14, isHighPlatform: true, transferLines: ['2'] },
        { stopName: 'Vahrenwalder Platz', minuteOffset: 16, isHighPlatform: true, transferLines: ['2'] },
        { stopName: 'Werderstraße', minuteOffset: 18, isHighPlatform: true, transferLines: ['2'] },
        { stopName: 'Hauptbahnhof', minuteOffset: 21, isHighPlatform: true, transferLines: ['Fernverkehr', 'S-Bahn', '2', '8', '18'] },
        { stopName: 'Kröpcke', minuteOffset: 23, isHighPlatform: true, transferLines: ['Alle Stadtbahn-Linien'] },
        { stopName: 'Aegidientorplatz', minuteOffset: 25, isHighPlatform: true, transferLines: ['4', '5', '6', '11'] },
        { stopName: 'Schlägerstraße', minuteOffset: 27, isHighPlatform: true, transferLines: ['2', '8'] },
        { stopName: 'Geibelstraße', minuteOffset: 29, isHighPlatform: true, transferLines: ['2', '8'] },
        { stopName: 'Altenbekener Damm', minuteOffset: 31, isHighPlatform: true, transferLines: ['2', '8'] },
        { stopName: 'Fiedelerstraße', minuteOffset: 33, isHighPlatform: true, transferLines: ['2', '8'] },
        { stopName: 'Döhren / Peiner Straße', minuteOffset: 35, isHighPlatform: true, transferLines: ['2', '8', 'Bus'] },
        { stopName: 'Bothmerstraße', minuteOffset: 37, isHighPlatform: true, transferLines: ['2', '8'] },
        { stopName: 'Wiehbergstraße', minuteOffset: 38, isHighPlatform: true, transferLines: ['2'] },
        { stopName: 'Laatzen / Birkenstraße', minuteOffset: 40, isHighPlatform: true, transferLines: ['2'] },
        { stopName: 'Laatzen / Zentrum', minuteOffset: 42, isHighPlatform: true, transferLines: ['2', 'Bus'] },
        { stopName: 'Rethen', minuteOffset: 45, isHighPlatform: true, transferLines: ['2'] },
        { stopName: 'Gleidingen', minuteOffset: 48, isHighPlatform: true },
        { stopName: 'Sarstedt', minuteOffset: 53, isHighPlatform: true, transferLines: ['Regionalbusse'] }
      ]
    },
    directionB: {
      origin: 'Sarstedt',
      destination: 'Langenhagen',
      totalMinutes: 48,
      baseMinuteDepartures: [3, 13, 23, 33, 43, 53],
      stops: [
        { stopName: 'Sarstedt', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Gleidingen', minuteOffset: 5, isHighPlatform: true },
        { stopName: 'Rethen', minuteOffset: 8, isHighPlatform: true },
        { stopName: 'Laatzen / Zentrum', minuteOffset: 11, isHighPlatform: true },
        { stopName: 'Laatzen / Birkenstraße', minuteOffset: 13, isHighPlatform: true },
        { stopName: 'Wiehbergstraße', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Bothmerstraße', minuteOffset: 16, isHighPlatform: true },
        { stopName: 'Döhren / Peiner Straße', minuteOffset: 18, isHighPlatform: true },
        { stopName: 'Fiedelerstraße', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Altenbekener Damm', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Geibelstraße', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'Schlägerstraße', minuteOffset: 26, isHighPlatform: true },
        { stopName: 'Aegidientorplatz', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Kröpcke', minuteOffset: 30, isHighPlatform: true },
        { stopName: 'Hauptbahnhof', minuteOffset: 32, isHighPlatform: true },
        { stopName: 'Werderstraße', minuteOffset: 35, isHighPlatform: true },
        { stopName: 'Vahrenwalder Platz', minuteOffset: 37, isHighPlatform: true },
        { stopName: 'Dragonerstraße', minuteOffset: 39, isHighPlatform: true },
        { stopName: 'Niedersachsenring', minuteOffset: 41, isHighPlatform: true },
        { stopName: 'Kabelkamp', minuteOffset: 43, isHighPlatform: true },
        { stopName: 'Wiesenau', minuteOffset: 45, isHighPlatform: true },
        { stopName: 'Alter Flughafen', minuteOffset: 47, isHighPlatform: true },
        { stopName: 'Berliner Platz', minuteOffset: 49, isHighPlatform: true },
        { stopName: 'Langenhagen / Zentrum', minuteOffset: 51, isHighPlatform: true },
        { stopName: 'Langenhagen', minuteOffset: 53, isHighPlatform: true }
      ]
    },
    frequency: { peak: '10 Min.', offPeak: '15 Min.', night: '30 Min. / NStB Fr+Sa' },
    operatingHours: { firstTrain: '04:05', lastTrain: '01:20', nightService: true }
  },

  // --- 🟢 D-STRECKE ---
  '10': {
    lineRef: '10',
    lineName: 'Stadtbahn 10',
    stammstrecke: 'D',
    corridorName: 'D-Strecke oberirdisch (Ahlem – Linden – Steintor – Hbf/ZOB)',
    color: '#10b981',
    directionA: {
      origin: 'Ahlem',
      destination: 'Hauptbahnhof / ZOB',
      totalMinutes: 20,
      baseMinuteDepartures: [2, 9, 17, 24, 32, 39, 47, 54],
      stops: [
        { stopName: 'Ahlem', minuteOffset: 0, isHighPlatform: true, transferLines: ['Bus 581', '700'] },
        { stopName: 'Ehrhartstraße', minuteOffset: 2, isHighPlatform: true },
        { stopName: 'Brunnenstraße', minuteOffset: 4, isHighPlatform: true },
        { stopName: 'Wunstorfer Straße', minuteOffset: 6, isHighPlatform: true, transferLines: ['Bus 120'] },
        { stopName: 'Harenberger Straße', minuteOffset: 7, isHighPlatform: true },
        { stopName: 'Leinaustraße', minuteOffset: 9, isHighPlatform: false, notice: 'Tiefbahnsteig (Kurve)' },
        { stopName: 'Am Küchengarten', minuteOffset: 11, isHighPlatform: true, transferLines: ['Bus 100/200'] },
        { stopName: 'Glocksee', minuteOffset: 13, isHighPlatform: true, transferLines: ['17'] },
        { stopName: 'Goetheplatz', minuteOffset: 14, isHighPlatform: true, transferLines: ['17'] },
        { stopName: 'Clevertor', minuteOffset: 16, isHighPlatform: true, transferLines: ['17'] },
        { stopName: 'Steintor', minuteOffset: 18, isHighPlatform: true, transferLines: ['4', '5', '6', '11', '17'] },
        { stopName: 'Hauptbahnhof / ZOB', minuteOffset: 20, isHighPlatform: true, transferLines: ['Fernverkehr', 'S-Bahn', 'ZOB Bus'] }
      ]
    },
    directionB: {
      origin: 'Hauptbahnhof / ZOB',
      destination: 'Ahlem',
      totalMinutes: 20,
      baseMinuteDepartures: [5, 12, 20, 27, 35, 42, 50, 57],
      stops: [
        { stopName: 'Hauptbahnhof / ZOB', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Steintor', minuteOffset: 2, isHighPlatform: true },
        { stopName: 'Clevertor', minuteOffset: 4, isHighPlatform: true },
        { stopName: 'Goetheplatz', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Glocksee', minuteOffset: 7, isHighPlatform: true },
        { stopName: 'Am Küchengarten', minuteOffset: 9, isHighPlatform: true },
        { stopName: 'Leinaustraße', minuteOffset: 11, isHighPlatform: false },
        { stopName: 'Harenberger Straße', minuteOffset: 13, isHighPlatform: true },
        { stopName: 'Wunstorfer Straße', minuteOffset: 14, isHighPlatform: true },
        { stopName: 'Brunnenstraße', minuteOffset: 16, isHighPlatform: true },
        { stopName: 'Ehrhartstraße', minuteOffset: 18, isHighPlatform: true },
        { stopName: 'Ahlem', minuteOffset: 20, isHighPlatform: true }
      ]
    },
    frequency: { peak: '7,5 Min.', offPeak: '10 Min. (abends 15 Min.)', night: '30 Min. / NStB Fr+Sa' },
    operatingHours: { firstTrain: '04:22', lastTrain: '00:48', nightService: true }
  },

  // --- 🚆 S-BAHN HANNOVER ---
  'S4': {
    lineRef: 'S4',
    lineName: 'S-Bahn S4 (Bennemühlen ⇄ Hbf ⇄ Hildesheim)',
    stammstrecke: 'S',
    corridorName: 'S-Bahn Stammstrecke Nord-Süd',
    color: '#06b6d4',
    directionA: {
      origin: 'Bennemühlen',
      destination: 'Hildesheim Hbf',
      totalMinutes: 52,
      baseMinuteDepartures: [6, 36],
      stops: [
        { stopName: 'Bennemühlen', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Mellendorf', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Bissendorf', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Langenhagen-Kaltenweide', minuteOffset: 10, isHighPlatform: true },
        { stopName: 'Langenhagen Pferdemarkt', minuteOffset: 14, isHighPlatform: true, transferLines: ['S5 (Airport)'] },
        { stopName: 'Langenhagen Mitte', minuteOffset: 16, isHighPlatform: true, transferLines: ['S5', 'Fernbus'] },
        { stopName: 'Hannover-Vinnhorst', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Hannover-Ledeburg', minuteOffset: 23, isHighPlatform: true },
        { stopName: 'Bahnhof Nordstadt', minuteOffset: 26, isHighPlatform: true, transferLines: ['6', '11'] },
        { stopName: 'Hannover Hbf', minuteOffset: 30, isHighPlatform: true, transferLines: ['Fernverkehr', 'Alle S-Bahnen', 'U-Bahn'] },
        { stopName: 'Hannover Bismarckstraße', minuteOffset: 34, isHighPlatform: true, transferLines: ['S1', 'S2', 'S5'] },
        { stopName: 'Hannover Messe/Laatzen', minuteOffset: 39, isHighPlatform: true, transferLines: ['Fernverkehr', 'S-Bahn'] },
        { stopName: 'Rethen (Leine)', minuteOffset: 43, isHighPlatform: true },
        { stopName: 'Sarstedt', minuteOffset: 47, isHighPlatform: true, transferLines: ['Stadtbahn 1'] },
        { stopName: 'Barnten', minuteOffset: 50, isHighPlatform: true },
        { stopName: 'Emmerke', minuteOffset: 54, isHighPlatform: true, transferLines: ['S3'] },
        { stopName: 'Hildesheim Hbf', minuteOffset: 59, isHighPlatform: true, transferLines: ['Fernverkehr', 'Regionalverkehr'] }
      ]
    },
    directionB: {
      origin: 'Hildesheim Hbf',
      destination: 'Bennemühlen',
      totalMinutes: 52,
      baseMinuteDepartures: [1, 31],
      stops: [
        { stopName: 'Hildesheim Hbf', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Emmerke', minuteOffset: 5, isHighPlatform: true },
        { stopName: 'Barnten', minuteOffset: 9, isHighPlatform: true },
        { stopName: 'Sarstedt', minuteOffset: 12, isHighPlatform: true },
        { stopName: 'Rethen (Leine)', minuteOffset: 16, isHighPlatform: true },
        { stopName: 'Hannover Messe/Laatzen', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Hannover Bismarckstraße', minuteOffset: 25, isHighPlatform: true },
        { stopName: 'Hannover Hbf', minuteOffset: 29, isHighPlatform: true },
        { stopName: 'Bahnhof Nordstadt', minuteOffset: 33, isHighPlatform: true },
        { stopName: 'Hannover-Ledeburg', minuteOffset: 36, isHighPlatform: true },
        { stopName: 'Hannover-Vinnhorst', minuteOffset: 39, isHighPlatform: true },
        { stopName: 'Langenhagen Mitte', minuteOffset: 43, isHighPlatform: true },
        { stopName: 'Langenhagen Pferdemarkt', minuteOffset: 45, isHighPlatform: true },
        { stopName: 'Langenhagen-Kaltenweide', minuteOffset: 49, isHighPlatform: true },
        { stopName: 'Bissendorf', minuteOffset: 53, isHighPlatform: true },
        { stopName: 'Mellendorf', minuteOffset: 56, isHighPlatform: true },
        { stopName: 'Bennemühlen', minuteOffset: 59, isHighPlatform: true }
      ]
    },
    frequency: { peak: '30 Min.', offPeak: '60 Min.', night: '60 Min. Fr/Sa' },
    operatingHours: { firstTrain: '04:30', lastTrain: '00:45', nightService: true }
  },

  // --- 🚆 REGIO / DB HANNOVER ---
  'RE60': {
    lineRef: 'RE60',
    lineName: 'Regional-Express RE60 (WestfalenBahn)',
    stammstrecke: 'R',
    corridorName: 'Braunschweig Hbf ⇄ Hannover Hbf ⇄ Minden ⇄ Rheine',
    color: '#ef4444',
    directionA: {
      origin: 'Braunschweig Hbf',
      destination: 'Rheine',
      totalMinutes: 110,
      baseMinuteDepartures: [18],
      stops: [
        { stopName: 'Braunschweig Hbf', minuteOffset: 0, isHighPlatform: true, transferLines: ['ICE', 'IC', 'Regio'] },
        { stopName: 'Peine', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Lehrte', minuteOffset: 28, isHighPlatform: true, transferLines: ['S3', 'S7', 'Regio'] },
        { stopName: 'Hannover Hbf', minuteOffset: 38, isHighPlatform: true, transferLines: ['Fernverkehr', 'S-Bahn', 'Stadtbahn'] },
        { stopName: 'Wunstorf', minuteOffset: 50, isHighPlatform: true, transferLines: ['S1', 'S2', 'RE70'] },
        { stopName: 'Haste', minuteOffset: 58, isHighPlatform: true, transferLines: ['S1'] },
        { stopName: 'Stadthagen', minuteOffset: 67, isHighPlatform: true },
        { stopName: 'Bückeburg', minuteOffset: 76, isHighPlatform: true },
        { stopName: 'Minden (Westf)', minuteOffset: 84, isHighPlatform: true, transferLines: ['RE6', 'S1'] },
        { stopName: 'Löhne (Westf)', minuteOffset: 95, isHighPlatform: true },
        { stopName: 'Osnabrück Hbf', minuteOffset: 120, isHighPlatform: true, transferLines: ['ICE', 'Regio'] },
        { stopName: 'Rheine', minuteOffset: 145, isHighPlatform: true }
      ]
    },
    directionB: {
      origin: 'Rheine',
      destination: 'Braunschweig Hbf',
      totalMinutes: 110,
      baseMinuteDepartures: [40],
      stops: [
        { stopName: 'Rheine', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Osnabrück Hbf', minuteOffset: 25, isHighPlatform: true },
        { stopName: 'Minden (Westf)', minuteOffset: 61, isHighPlatform: true },
        { stopName: 'Wunstorf', minuteOffset: 95, isHighPlatform: true },
        { stopName: 'Hannover Hbf', minuteOffset: 107, isHighPlatform: true },
        { stopName: 'Lehrte', minuteOffset: 117, isHighPlatform: true },
        { stopName: 'Peine', minuteOffset: 130, isHighPlatform: true },
        { stopName: 'Braunschweig Hbf', minuteOffset: 145, isHighPlatform: true }
      ]
    },
    frequency: { peak: '60 Min.', offPeak: '60 Min.', night: 'Einzeltakt' },
    operatingHours: { firstTrain: '05:18', lastTrain: '23:18', nightService: false }
  },

  // --- 🚌 BUS HANNOVER ---
  '100': {
    lineRef: '100',
    lineName: 'Ringbus 100 (Erlebnisbus Hannover)',
    stammstrecke: 'BUS',
    corridorName: 'Kröpcke ⇄ Lindener Marktplatz ⇄ Glocksee ⇄ Kröpcke',
    color: '#84cc16',
    directionA: {
      origin: 'August-Holweg-Platz',
      destination: 'Kröpcke',
      totalMinutes: 28,
      baseMinuteDepartures: [4, 14, 24, 34, 44, 54],
      stops: [
        { stopName: 'August-Holweg-Platz', minuteOffset: 0 },
        { stopName: 'Lindener Marktplatz', minuteOffset: 3, transferLines: ['9'] },
        { stopName: 'Am Küchengarten', minuteOffset: 6, transferLines: ['10'] },
        { stopName: 'Glocksee', minuteOffset: 9, transferLines: ['10'] },
        { stopName: 'Königsworther Platz', minuteOffset: 13, transferLines: ['4', '5'] },
        { stopName: 'Christuskirche', minuteOffset: 17, transferLines: ['6', '11'] },
        { stopName: 'Hauptbahnhof / Ernst-August-Platz', minuteOffset: 22, transferLines: ['S-Bahn', 'Fernverkehr'] },
        { stopName: 'Kröpcke', minuteOffset: 26, transferLines: ['Stadtbahn A/B/C'] }
      ]
    },
    directionB: {
      origin: 'Kröpcke',
      destination: 'August-Holweg-Platz',
      totalMinutes: 28,
      baseMinuteDepartures: [8, 18, 28, 38, 48, 58],
      stops: [
        { stopName: 'Kröpcke', minuteOffset: 0 },
        { stopName: 'Aegidientorplatz', minuteOffset: 4 },
        { stopName: 'Rathaus / Bleichenstraße', minuteOffset: 8 },
        { stopName: 'Waterlooplatz', minuteOffset: 12, transferLines: ['3', '7', '9'] },
        { stopName: 'Schwarzer Bär', minuteOffset: 16, transferLines: ['9', '17'] },
        { stopName: 'Lindener Marktplatz', minuteOffset: 20 },
        { stopName: 'August-Holweg-Platz', minuteOffset: 25 }
      ]
    },
    frequency: { peak: '10 Min.', offPeak: '15 Min.', night: '30 Min.' },
    operatingHours: { firstTrain: '05:04', lastTrain: '00:34', nightService: true }
  }
};

export const HAMBURG_SCHEDULES: Record<string, LineSchedule> = {
  'U1': {
    lineRef: 'U1',
    lineName: 'U-Bahn U1 (Nord-Ost-Diagonale)',
    stammstrecke: 'U',
    corridorName: 'Norderstedt ⇄ Ohlsdorf ⇄ Jungfernstieg ⇄ Wandsbek ⇄ Großhansdorf',
    color: '#0284c7',
    directionA: {
      origin: 'Norderstedt Mitte',
      destination: 'Großhansdorf',
      totalMinutes: 72,
      baseMinuteDepartures: [4, 14, 24, 34, 44, 54],
      stops: [
        { stopName: 'Norderstedt Mitte', minuteOffset: 0, transferLines: ['A2'] },
        { stopName: 'Fuhlsbüttel Nord', minuteOffset: 12 },
        { stopName: 'Ohlsdorf', minuteOffset: 18, isHighPlatform: true, transferLines: ['S1 (Airport)'] },
        { stopName: 'Kellinghusenstraße', minuteOffset: 26, isHighPlatform: true, transferLines: ['U3'] },
        { stopName: 'Hallerstraße', minuteOffset: 30 },
        { stopName: 'Stephansplatz', minuteOffset: 34, transferLines: ['Dammtor Fernverkehr'] },
        { stopName: 'Jungfernstieg', minuteOffset: 36, isHighPlatform: true, transferLines: ['U2', 'U4', 'S1', 'S3'] },
        { stopName: 'Hauptbahnhof Süd', minuteOffset: 39, isHighPlatform: true, transferLines: ['Fernverkehr', 'U2', 'U3', 'S-Bahn'] },
        { stopName: 'Wandsbek Markt', minuteOffset: 46, isHighPlatform: true, transferLines: ['Metrobusse'] },
        { stopName: 'Wandsbek-Gartenstadt', minuteOffset: 52, isHighPlatform: true, transferLines: ['U3'] },
        { stopName: 'Volksdorf', minuteOffset: 62, transferLines: ['U1 Ast Ohlstedt'] },
        { stopName: 'Großhansdorf', minuteOffset: 72 }
      ]
    },
    directionB: {
      origin: 'Großhansdorf',
      destination: 'Norderstedt Mitte',
      totalMinutes: 72,
      baseMinuteDepartures: [2, 12, 22, 32, 42, 52],
      stops: [
        { stopName: 'Großhansdorf', minuteOffset: 0 },
        { stopName: 'Volksdorf', minuteOffset: 10 },
        { stopName: 'Wandsbek-Gartenstadt', minuteOffset: 20 },
        { stopName: 'Wandsbek Markt', minuteOffset: 26 },
        { stopName: 'Hauptbahnhof Süd', minuteOffset: 33 },
        { stopName: 'Jungfernstieg', minuteOffset: 36 },
        { stopName: 'Kellinghusenstraße', minuteOffset: 46 },
        { stopName: 'Ohlsdorf', minuteOffset: 54 },
        { stopName: 'Norderstedt Mitte', minuteOffset: 72 }
      ]
    },
    frequency: { peak: '5 Min. (Kern) / 10 Min.', offPeak: '10 Min.', night: '20 Min. am Wochenende durchgehend' },
    operatingHours: { firstTrain: '04:10', lastTrain: '01:05', nightService: true }
  },
  'U2': {
    lineRef: 'U2',
    lineName: 'U-Bahn U2 (Eimsbüttel ⇄ Billstedt ⇄ Mümmelmannsberg)',
    stammstrecke: 'U',
    corridorName: 'Niendorf Nord ⇄ Schlump ⇄ Jungfernstieg ⇄ Hbf Nord ⇄ Berliner Tor ⇄ Mümmelmannsberg',
    color: '#dc2626',
    directionA: {
      origin: 'Niendorf Nord',
      destination: 'Mümmelmannsberg',
      totalMinutes: 46,
      baseMinuteDepartures: [1, 11, 21, 31, 41, 51],
      stops: [
        { stopName: 'Niendorf Nord', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Hagenbecks Tierpark', minuteOffset: 8, isHighPlatform: true },
        { stopName: 'Schlump', minuteOffset: 15, isHighPlatform: true, transferLines: ['U3'] },
        { stopName: 'Messehallen', minuteOffset: 18, isHighPlatform: true },
        { stopName: 'Gänsemarkt', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Jungfernstieg', minuteOffset: 22, isHighPlatform: true, transferLines: ['U1', 'U4', 'S1', 'S3'] },
        { stopName: 'Hauptbahnhof Nord', minuteOffset: 24, isHighPlatform: true, transferLines: ['Fernverkehr', 'U1', 'U3', 'S-Bahn'] },
        { stopName: 'Berliner Tor', minuteOffset: 27, isHighPlatform: true, transferLines: ['U3', 'U4', 'S1', 'S2'] },
        { stopName: 'Burgstraße', minuteOffset: 29, isHighPlatform: true },
        { stopName: 'Billstedt', minuteOffset: 38, isHighPlatform: true, transferLines: ['U4', 'Bus-ZOB'] },
        { stopName: 'Mümmelmannsberg', minuteOffset: 46, isHighPlatform: true }
      ]
    },
    directionB: {
      origin: 'Mümmelmannsberg',
      destination: 'Niendorf Nord',
      totalMinutes: 46,
      baseMinuteDepartures: [4, 14, 24, 34, 44, 54],
      stops: [
        { stopName: 'Mümmelmannsberg', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Billstedt', minuteOffset: 8, isHighPlatform: true },
        { stopName: 'Burgstraße', minuteOffset: 17, isHighPlatform: true },
        { stopName: 'Berliner Tor', minuteOffset: 19, isHighPlatform: true },
        { stopName: 'Hauptbahnhof Nord', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Jungfernstieg', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'Gänsemarkt', minuteOffset: 26, isHighPlatform: true },
        { stopName: 'Messehallen', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Schlump', minuteOffset: 31, isHighPlatform: true },
        { stopName: 'Hagenbecks Tierpark', minuteOffset: 38, isHighPlatform: true },
        { stopName: 'Niendorf Nord', minuteOffset: 46, isHighPlatform: true }
      ]
    },
    frequency: { peak: '5 Min.', offPeak: '10 Min.', night: '20 Min. 24/7 am Wochenende' },
    operatingHours: { firstTrain: '04:15', lastTrain: '01:00', nightService: true }
  },
  'U3': {
    lineRef: 'U3',
    lineName: 'U-Bahn U3 (Historischer Ring & Hafenviadukt)',
    stammstrecke: 'U',
    corridorName: 'Barmbek ⇄ Kellinghusenstr ⇄ Schlump ⇄ St. Pauli ⇄ Landungsbrücken ⇄ Rathaus ⇄ Hbf ⇄ Barmbek',
    color: '#eab308',
    directionA: {
      origin: 'Barmbek (Ring via Hafen)',
      destination: 'Barmbek (Endstation)',
      totalMinutes: 44,
      baseMinuteDepartures: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58],
      stops: [
        { stopName: 'Barmbek', minuteOffset: 0, isHighPlatform: true, transferLines: ['S1', 'S2'] },
        { stopName: 'Kellinghusenstraße', minuteOffset: 6, isHighPlatform: true, transferLines: ['U1'] },
        { stopName: 'Schlump', minuteOffset: 12, isHighPlatform: true, transferLines: ['U2'] },
        { stopName: 'Sternschanze', minuteOffset: 15, isHighPlatform: true, transferLines: ['S2', 'S5'] },
        { stopName: 'St. Pauli', minuteOffset: 18, isHighPlatform: true },
        { stopName: 'Landungsbrücken', minuteOffset: 20, isHighPlatform: true, transferLines: ['S1', 'S3', 'HADAG Fähren'] },
        { stopName: 'Baumwall (Elbphilharmonie)', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Rödingsmarkt', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'Rathaus', minuteOffset: 26, isHighPlatform: true, transferLines: ['Jungfernstieg Passage'] },
        { stopName: 'Hauptbahnhof Süd', minuteOffset: 29, isHighPlatform: true, transferLines: ['Fernverkehr', 'S-Bahn'] },
        { stopName: 'Berliner Tor', minuteOffset: 32, isHighPlatform: true, transferLines: ['U2', 'U4', 'S1', 'S2'] },
        { stopName: 'Mundsburg', minuteOffset: 37, isHighPlatform: true },
        { stopName: 'Barmbek', minuteOffset: 44, isHighPlatform: true }
      ]
    },
    directionB: {
      origin: 'Barmbek (Gegenrichtung)',
      destination: 'Barmbek (über Ring)',
      totalMinutes: 44,
      baseMinuteDepartures: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56],
      stops: [
        { stopName: 'Barmbek', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Mundsburg', minuteOffset: 7, isHighPlatform: true },
        { stopName: 'Berliner Tor', minuteOffset: 12, isHighPlatform: true },
        { stopName: 'Hauptbahnhof Süd', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Rathaus', minuteOffset: 18, isHighPlatform: true },
        { stopName: 'Rödingsmarkt', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Baumwall (Elbphilharmonie)', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Landungsbrücken', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'St. Pauli', minuteOffset: 26, isHighPlatform: true },
        { stopName: 'Sternschanze', minuteOffset: 29, isHighPlatform: true },
        { stopName: 'Schlump', minuteOffset: 32, isHighPlatform: true },
        { stopName: 'Kellinghusenstraße', minuteOffset: 38, isHighPlatform: true },
        { stopName: 'Barmbek', minuteOffset: 44, isHighPlatform: true }
      ]
    },
    frequency: { peak: '5 Min.', offPeak: '10 Min.', night: '20 Min. 24/7 am Wochenende' },
    operatingHours: { firstTrain: '04:15', lastTrain: '01:10', nightService: true }
  },
  'U4': {
    lineRef: 'U4',
    lineName: 'U-Bahn U4 (HafenCity ⇄ Billstedt)',
    stammstrecke: 'U',
    corridorName: 'Elbbrücken ⇄ HafenCity Univ. ⇄ Jungfernstieg ⇄ Hbf Nord ⇄ Berliner Tor ⇄ Billstedt',
    color: '#0284c7',
    directionA: {
      origin: 'Elbbrücken',
      destination: 'Billstedt',
      totalMinutes: 24,
      baseMinuteDepartures: [3, 13, 23, 33, 43, 53],
      stops: [
        { stopName: 'Elbbrücken', minuteOffset: 0, isHighPlatform: true, transferLines: ['S3', 'S5'] },
        { stopName: 'HafenCity Universität', minuteOffset: 2, isHighPlatform: true },
        { stopName: 'Überseequartier', minuteOffset: 4, isHighPlatform: true },
        { stopName: 'Jungfernstieg', minuteOffset: 7, isHighPlatform: true, transferLines: ['U1', 'U2', 'S1', 'S3'] },
        { stopName: 'Hauptbahnhof Nord', minuteOffset: 9, isHighPlatform: true, transferLines: ['Fernverkehr', 'U1', 'U3', 'S-Bahn'] },
        { stopName: 'Berliner Tor', minuteOffset: 12, isHighPlatform: true, transferLines: ['U2', 'U3', 'S1', 'S2'] },
        { stopName: 'Burgstraße', minuteOffset: 14, isHighPlatform: true },
        { stopName: 'Billstedt', minuteOffset: 24, isHighPlatform: true, transferLines: ['U2'] }
      ]
    },
    directionB: {
      origin: 'Billstedt',
      destination: 'Elbbrücken',
      totalMinutes: 24,
      baseMinuteDepartures: [6, 16, 26, 36, 46, 56],
      stops: [
        { stopName: 'Billstedt', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Burgstraße', minuteOffset: 10, isHighPlatform: true },
        { stopName: 'Berliner Tor', minuteOffset: 12, isHighPlatform: true },
        { stopName: 'Hauptbahnhof Nord', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Jungfernstieg', minuteOffset: 17, isHighPlatform: true },
        { stopName: 'Überseequartier', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'HafenCity Universität', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Elbbrücken', minuteOffset: 24, isHighPlatform: true, transferLines: ['S3', 'S5'] }
      ]
    },
    frequency: { peak: '10 Min.', offPeak: '10 Min.', night: '20 Min. 24/7 am Wochenende' },
    operatingHours: { firstTrain: '04:30', lastTrain: '00:50', nightService: true }
  },
  'S1': {
    lineRef: 'S1',
    lineName: 'S-Bahn S1 (Airport / Wedel ⇄ Poppenbüttel)',
    stammstrecke: 'S',
    corridorName: 'Wedel ⇄ Blankenese ⇄ Altona ⇄ City-Tunnel ⇄ Hbf ⇄ Ohlsdorf ⇄ Hamburg Airport / Poppenbüttel',
    color: '#10b981',
    directionA: {
      origin: 'Wedel',
      destination: 'Hamburg Airport / Poppenbüttel',
      totalMinutes: 68,
      baseMinuteDepartures: [2, 12, 22, 32, 42, 52],
      stops: [
        { stopName: 'Wedel', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Rissen', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Sülldorf', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Iserbrook', minuteOffset: 9, isHighPlatform: true },
        { stopName: 'Blankenese', minuteOffset: 14, isHighPlatform: true, transferLines: ['Treppenviertel Busse'] },
        { stopName: 'Hochkamp', minuteOffset: 17, isHighPlatform: true },
        { stopName: 'Klein Flottbek', minuteOffset: 20, isHighPlatform: true },
        { stopName: 'Othmarschen', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Bahrenfeld', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'Ottensen', minuteOffset: 26, isHighPlatform: true },
        { stopName: 'Hamburg-Altona', minuteOffset: 28, isHighPlatform: true, transferLines: ['Fernverkehr', 'S2', 'S3'] },
        { stopName: 'Königstraße', minuteOffset: 30, isHighPlatform: true },
        { stopName: 'Reeperbahn', minuteOffset: 31, isHighPlatform: true },
        { stopName: 'Landungsbrücken', minuteOffset: 34, isHighPlatform: true, transferLines: ['U3', 'Fähren'] },
        { stopName: 'Stadthausbrücke', minuteOffset: 36, isHighPlatform: true },
        { stopName: 'Jungfernstieg', minuteOffset: 37, isHighPlatform: true, transferLines: ['U1', 'U2', 'U4'] },
        { stopName: 'Hamburg Hbf', minuteOffset: 40, isHighPlatform: true, transferLines: ['Fernverkehr', 'Alle Linien'] },
        { stopName: 'Berliner Tor', minuteOffset: 43, isHighPlatform: true, transferLines: ['S2', 'U2', 'U4'] },
        { stopName: 'Landwehr', minuteOffset: 45, isHighPlatform: true },
        { stopName: 'Hasselbrook', minuteOffset: 47, isHighPlatform: true, transferLines: ['RB81'] },
        { stopName: 'Wandsbeker Chaussee', minuteOffset: 49, isHighPlatform: true, transferLines: ['U1'] },
        { stopName: 'Friedrichsberg', minuteOffset: 51, isHighPlatform: true },
        { stopName: 'Barmbek', minuteOffset: 53, isHighPlatform: true, transferLines: ['U3'] },
        { stopName: 'Alte Wöhr', minuteOffset: 55, isHighPlatform: true },
        { stopName: 'Rübenkamp', minuteOffset: 56, isHighPlatform: true },
        { stopName: 'Ohlsdorf', minuteOffset: 58, isHighPlatform: true, notice: 'Zugteilung: Vordere Wagen zum Airport, hintere nach Poppenbüttel' },
        { stopName: 'Hamburg Airport', minuteOffset: 63, isHighPlatform: true, transferLines: ['Flugverkehr (HAM)'] },
        { stopName: 'Poppenbüttel', minuteOffset: 68, isHighPlatform: true }
      ]
    },
    directionB: {
      origin: 'Hamburg Airport / Poppenbüttel',
      destination: 'Wedel',
      totalMinutes: 68,
      baseMinuteDepartures: [4, 14, 24, 34, 44, 54],
      stops: [
        { stopName: 'Poppenbüttel', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Hamburg Airport', minuteOffset: 5, isHighPlatform: true },
        { stopName: 'Ohlsdorf', minuteOffset: 10, isHighPlatform: true },
        { stopName: 'Rübenkamp', minuteOffset: 12, isHighPlatform: true },
        { stopName: 'Alte Wöhr', minuteOffset: 13, isHighPlatform: true },
        { stopName: 'Barmbek', minuteOffset: 15, isHighPlatform: true, transferLines: ['U3'] },
        { stopName: 'Friedrichsberg', minuteOffset: 17, isHighPlatform: true },
        { stopName: 'Wandsbeker Chaussee', minuteOffset: 19, isHighPlatform: true, transferLines: ['U1'] },
        { stopName: 'Hasselbrook', minuteOffset: 21, isHighPlatform: true },
        { stopName: 'Landwehr', minuteOffset: 23, isHighPlatform: true },
        { stopName: 'Berliner Tor', minuteOffset: 25, isHighPlatform: true, transferLines: ['S2', 'U2', 'U4'] },
        { stopName: 'Hamburg Hbf', minuteOffset: 28, isHighPlatform: true, transferLines: ['Alle Linien'] },
        { stopName: 'Jungfernstieg', minuteOffset: 31, isHighPlatform: true, transferLines: ['U1', 'U2', 'U4'] },
        { stopName: 'Stadthausbrücke', minuteOffset: 32, isHighPlatform: true },
        { stopName: 'Landungsbrücken', minuteOffset: 34, isHighPlatform: true, transferLines: ['U3', 'Fähren'] },
        { stopName: 'Reeperbahn', minuteOffset: 37, isHighPlatform: true },
        { stopName: 'Königstraße', minuteOffset: 38, isHighPlatform: true },
        { stopName: 'Hamburg-Altona', minuteOffset: 40, isHighPlatform: true, transferLines: ['Fernverkehr', 'S2', 'S3'] },
        { stopName: 'Ottensen', minuteOffset: 42, isHighPlatform: true },
        { stopName: 'Bahrenfeld', minuteOffset: 44, isHighPlatform: true },
        { stopName: 'Othmarschen', minuteOffset: 46, isHighPlatform: true },
        { stopName: 'Klein Flottbek', minuteOffset: 48, isHighPlatform: true },
        { stopName: 'Hochkamp', minuteOffset: 51, isHighPlatform: true },
        { stopName: 'Blankenese', minuteOffset: 54, isHighPlatform: true },
        { stopName: 'Iserbrook', minuteOffset: 59, isHighPlatform: true },
        { stopName: 'Sülldorf', minuteOffset: 62, isHighPlatform: true },
        { stopName: 'Rissen', minuteOffset: 65, isHighPlatform: true },
        { stopName: 'Wedel', minuteOffset: 68, isHighPlatform: true }
      ]
    },
    frequency: { peak: '10 Min.', offPeak: '10 Min.', night: '20 Min. 24/7 am Wochenende' },
    operatingHours: { firstTrain: '04:00', lastTrain: '01:15', nightService: true }
  },
  'S2': {
    lineRef: 'S2',
    lineName: 'S-Bahn S2 (Verbindungsbahn & Bergedorf)',
    stammstrecke: 'S',
    corridorName: 'Altona ⇄ Dammtor ⇄ Hamburg Hbf ⇄ Berliner Tor ⇄ Bergedorf ⇄ Aumühle',
    color: '#b91c1c',
    directionA: {
      origin: 'Altona',
      destination: 'Aumühle',
      totalMinutes: 47,
      baseMinuteDepartures: [4, 14, 24, 34, 44, 54],
      stops: [
        { stopName: 'Hamburg-Altona', minuteOffset: 0, isHighPlatform: true, transferLines: ['Fernverkehr', 'S1', 'S3'] },
        { stopName: 'Holstenstraße', minuteOffset: 3, isHighPlatform: true, transferLines: ['S5'] },
        { stopName: 'Sternschanze', minuteOffset: 6, isHighPlatform: true, transferLines: ['U3', 'S5'] },
        { stopName: 'Dammtor', minuteOffset: 8, isHighPlatform: true, transferLines: ['Fernverkehr', 'S5'] },
        { stopName: 'Hamburg Hbf', minuteOffset: 12, isHighPlatform: true, transferLines: ['Alle S-/U-Bahnen'] },
        { stopName: 'Berliner Tor', minuteOffset: 15, isHighPlatform: true, transferLines: ['U2', 'U3', 'U4', 'S1'] },
        { stopName: 'Rothenburgsort', minuteOffset: 19, isHighPlatform: true },
        { stopName: 'Tiefstack', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Billwerder-Moorfleet', minuteOffset: 25, isHighPlatform: true },
        { stopName: 'Mittlerer Landweg', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Allermöhe', minuteOffset: 31, isHighPlatform: true },
        { stopName: 'Nettelnburg', minuteOffset: 34, isHighPlatform: true },
        { stopName: 'Hamburg-Bergedorf', minuteOffset: 37, isHighPlatform: true, transferLines: ['Regionalverkehr'] },
        { stopName: 'Reinbek', minuteOffset: 41, isHighPlatform: true },
        { stopName: 'Wohltorf', minuteOffset: 44, isHighPlatform: true },
        { stopName: 'Aumühle', minuteOffset: 47, isHighPlatform: true }
      ]
    },
    directionB: {
      origin: 'Aumühle',
      destination: 'Altona',
      totalMinutes: 47,
      baseMinuteDepartures: [2, 12, 22, 32, 42, 52],
      stops: [
        { stopName: 'Aumühle', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Wohltorf', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Reinbek', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Hamburg-Bergedorf', minuteOffset: 10, isHighPlatform: true, transferLines: ['Regionalverkehr'] },
        { stopName: 'Nettelnburg', minuteOffset: 13, isHighPlatform: true },
        { stopName: 'Allermöhe', minuteOffset: 16, isHighPlatform: true },
        { stopName: 'Mittlerer Landweg', minuteOffset: 19, isHighPlatform: true },
        { stopName: 'Billwerder-Moorfleet', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Tiefstack', minuteOffset: 25, isHighPlatform: true },
        { stopName: 'Rothenburgsort', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Berliner Tor', minuteOffset: 32, isHighPlatform: true, transferLines: ['U2', 'U3', 'U4', 'S1'] },
        { stopName: 'Hamburg Hbf', minuteOffset: 35, isHighPlatform: true, transferLines: ['Alle S-/U-Bahnen'] },
        { stopName: 'Dammtor', minuteOffset: 39, isHighPlatform: true, transferLines: ['Fernverkehr', 'S5'] },
        { stopName: 'Sternschanze', minuteOffset: 41, isHighPlatform: true, transferLines: ['U3', 'S5'] },
        { stopName: 'Holstenstraße', minuteOffset: 44, isHighPlatform: true, transferLines: ['S5'] },
        { stopName: 'Hamburg-Altona', minuteOffset: 47, isHighPlatform: true, transferLines: ['Fernverkehr', 'S1', 'S3'] }
      ]
    },
    frequency: { peak: '5-10 Min.', offPeak: '10-20 Min.', night: '20 Min. Fr/Sa & Sa/So' },
    operatingHours: { firstTrain: '04:20', lastTrain: '01:05', nightService: true }
  },
  'S3': {
    lineRef: 'S3',
    lineName: 'S-Bahn S3 (Pinneberg ⇄ Harburg ⇄ Neugraben)',
    stammstrecke: 'S',
    corridorName: 'Pinneberg ⇄ Altona ⇄ City-Tunnel ⇄ Hbf ⇄ Elbbrücken ⇄ Harburg ⇄ Neugraben',
    color: '#8b5cf6',
    directionA: {
      origin: 'Pinneberg',
      destination: 'Neugraben',
      totalMinutes: 61,
      baseMinuteDepartures: [8, 18, 28, 38, 48, 58],
      stops: [
        { stopName: 'Pinneberg', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Thesdorf', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Halstenbek', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Krupunder', minuteOffset: 9, isHighPlatform: true },
        { stopName: 'Elbgaustraße', minuteOffset: 12, isHighPlatform: true, transferLines: ['S5'] },
        { stopName: 'Eidelstedt', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Stellingen', minuteOffset: 17, isHighPlatform: true },
        { stopName: 'Langenfelde', minuteOffset: 19, isHighPlatform: true },
        { stopName: 'Diebsteich', minuteOffset: 21, isHighPlatform: true },
        { stopName: 'Hamburg-Altona', minuteOffset: 24, isHighPlatform: true, transferLines: ['Fernverkehr', 'S1', 'S2'] },
        { stopName: 'Königstraße', minuteOffset: 26, isHighPlatform: true },
        { stopName: 'Reeperbahn', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Landungsbrücken', minuteOffset: 30, isHighPlatform: true, transferLines: ['U3', 'Fähren'] },
        { stopName: 'Stadthausbrücke', minuteOffset: 32, isHighPlatform: true },
        { stopName: 'Jungfernstieg', minuteOffset: 33, isHighPlatform: true, transferLines: ['U1', 'U2', 'U4'] },
        { stopName: 'Hamburg Hbf', minuteOffset: 36, isHighPlatform: true, transferLines: ['Alle Linien'] },
        { stopName: 'Hammerbrook', minuteOffset: 39, isHighPlatform: true },
        { stopName: 'Elbbrücken', minuteOffset: 41, isHighPlatform: true, transferLines: ['U4'] },
        { stopName: 'Veddel', minuteOffset: 44, isHighPlatform: true },
        { stopName: 'Wilhelmsburg', minuteOffset: 47, isHighPlatform: true },
        { stopName: 'Hamburg-Harburg', minuteOffset: 52, isHighPlatform: true, transferLines: ['Fernverkehr'] },
        { stopName: 'Harburg Rathaus', minuteOffset: 54, isHighPlatform: true },
        { stopName: 'Heimfeld', minuteOffset: 56, isHighPlatform: true },
        { stopName: 'Neuwiedenthal', minuteOffset: 58, isHighPlatform: true },
        { stopName: 'Neugraben', minuteOffset: 61, isHighPlatform: true }
      ]
    },
    directionB: {
      origin: 'Neugraben',
      destination: 'Pinneberg',
      totalMinutes: 61,
      baseMinuteDepartures: [2, 12, 22, 32, 42, 52],
      stops: [
        { stopName: 'Neugraben', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Neuwiedenthal', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Heimfeld', minuteOffset: 5, isHighPlatform: true },
        { stopName: 'Harburg Rathaus', minuteOffset: 7, isHighPlatform: true },
        { stopName: 'Hamburg-Harburg', minuteOffset: 9, isHighPlatform: true, transferLines: ['Fernverkehr'] },
        { stopName: 'Wilhelmsburg', minuteOffset: 14, isHighPlatform: true },
        { stopName: 'Veddel', minuteOffset: 17, isHighPlatform: true },
        { stopName: 'Elbbrücken', minuteOffset: 20, isHighPlatform: true, transferLines: ['U4'] },
        { stopName: 'Hammerbrook', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Hamburg Hbf', minuteOffset: 25, isHighPlatform: true, transferLines: ['Alle Linien'] },
        { stopName: 'Jungfernstieg', minuteOffset: 28, isHighPlatform: true, transferLines: ['U1', 'U2', 'U4'] },
        { stopName: 'Stadthausbrücke', minuteOffset: 29, isHighPlatform: true },
        { stopName: 'Landungsbrücken', minuteOffset: 31, isHighPlatform: true, transferLines: ['U3', 'Fähren'] },
        { stopName: 'Reeperbahn', minuteOffset: 33, isHighPlatform: true },
        { stopName: 'Königstraße', minuteOffset: 35, isHighPlatform: true },
        { stopName: 'Hamburg-Altona', minuteOffset: 37, isHighPlatform: true, transferLines: ['Fernverkehr', 'S1', 'S2'] },
        { stopName: 'Diebsteich', minuteOffset: 40, isHighPlatform: true },
        { stopName: 'Langenfelde', minuteOffset: 42, isHighPlatform: true },
        { stopName: 'Stellingen', minuteOffset: 44, isHighPlatform: true },
        { stopName: 'Eidelstedt', minuteOffset: 46, isHighPlatform: true },
        { stopName: 'Elbgaustraße', minuteOffset: 49, isHighPlatform: true, transferLines: ['S5'] },
        { stopName: 'Krupunder', minuteOffset: 52, isHighPlatform: true },
        { stopName: 'Halstenbek', minuteOffset: 55, isHighPlatform: true },
        { stopName: 'Thesdorf', minuteOffset: 58, isHighPlatform: true },
        { stopName: 'Pinneberg', minuteOffset: 61, isHighPlatform: true }
      ]
    },
    frequency: { peak: '10 Min.', offPeak: '10 Min.', night: '20 Min. 24/7 am Wochenende' },
    operatingHours: { firstTrain: '04:10', lastTrain: '01:25', nightService: true }
  },
  'S5': {
    lineRef: 'S5',
    lineName: 'S-Bahn S5 (Elbgaustr. ⇄ Dammtor ⇄ Harburg ⇄ Stade)',
    stammstrecke: 'S',
    corridorName: 'Elbgaustraße ⇄ Dammtor ⇄ Hbf ⇄ Harburg ⇄ Buxtehude ⇄ Stade',
    color: '#059669',
    directionA: {
      origin: 'Elbgaustraße',
      destination: 'Stade',
      totalMinutes: 74,
      baseMinuteDepartures: [5, 25, 45],
      stops: [
        { stopName: 'Elbgaustraße', minuteOffset: 0, isHighPlatform: true, transferLines: ['S3'] },
        { stopName: 'Eidelstedt', minuteOffset: 3, isHighPlatform: true },
        { stopName: 'Stellingen', minuteOffset: 5, isHighPlatform: true },
        { stopName: 'Langenfelde', minuteOffset: 7, isHighPlatform: true },
        { stopName: 'Diebsteich', minuteOffset: 9, isHighPlatform: true },
        { stopName: 'Holstenstraße', minuteOffset: 11, isHighPlatform: true, transferLines: ['S2'] },
        { stopName: 'Sternschanze', minuteOffset: 13, isHighPlatform: true, transferLines: ['U3', 'S2'] },
        { stopName: 'Dammtor', minuteOffset: 15, isHighPlatform: true, transferLines: ['Fernverkehr', 'S2'] },
        { stopName: 'Hamburg Hbf', minuteOffset: 18, isHighPlatform: true, transferLines: ['Alle S-/U-Bahnen'] },
        { stopName: 'Hammerbrook', minuteOffset: 21, isHighPlatform: true },
        { stopName: 'Elbbrücken', minuteOffset: 24, isHighPlatform: true, transferLines: ['U4'] },
        { stopName: 'Veddel', minuteOffset: 27, isHighPlatform: true },
        { stopName: 'Wilhelmsburg', minuteOffset: 30, isHighPlatform: true },
        { stopName: 'Hamburg-Harburg', minuteOffset: 35, isHighPlatform: true, transferLines: ['Fernverkehr'] },
        { stopName: 'Harburg Rathaus', minuteOffset: 37, isHighPlatform: true },
        { stopName: 'Neugraben', minuteOffset: 43, isHighPlatform: true },
        { stopName: 'Fischbek', minuteOffset: 46, isHighPlatform: true },
        { stopName: 'Neu Wulmstorf', minuteOffset: 50, isHighPlatform: true },
        { stopName: 'Buxtehude', minuteOffset: 55, isHighPlatform: true, transferLines: ['EVB nach Bremervörde'] },
        { stopName: 'Neukloster', minuteOffset: 59, isHighPlatform: true },
        { stopName: 'Horneburg', minuteOffset: 63, isHighPlatform: true },
        { stopName: 'Dollern', minuteOffset: 67, isHighPlatform: true },
        { stopName: 'Agathenburg', minuteOffset: 70, isHighPlatform: true },
        { stopName: 'Stade', minuteOffset: 74, isHighPlatform: true, transferLines: ['Start Unterelbe'] }
      ]
    },
    directionB: {
      origin: 'Stade',
      destination: 'Elbgaustraße',
      totalMinutes: 74,
      baseMinuteDepartures: [10, 30, 50],
      stops: [
        { stopName: 'Stade', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Agathenburg', minuteOffset: 4, isHighPlatform: true },
        { stopName: 'Dollern', minuteOffset: 7, isHighPlatform: true },
        { stopName: 'Horneburg', minuteOffset: 11, isHighPlatform: true },
        { stopName: 'Neukloster', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Buxtehude', minuteOffset: 19, isHighPlatform: true, transferLines: ['EVB nach Bremervörde'] },
        { stopName: 'Neu Wulmstorf', minuteOffset: 24, isHighPlatform: true },
        { stopName: 'Fischbek', minuteOffset: 28, isHighPlatform: true },
        { stopName: 'Neugraben', minuteOffset: 31, isHighPlatform: true },
        { stopName: 'Harburg Rathaus', minuteOffset: 37, isHighPlatform: true },
        { stopName: 'Hamburg-Harburg', minuteOffset: 39, isHighPlatform: true, transferLines: ['Fernverkehr'] },
        { stopName: 'Wilhelmsburg', minuteOffset: 44, isHighPlatform: true },
        { stopName: 'Veddel', minuteOffset: 47, isHighPlatform: true },
        { stopName: 'Elbbrücken', minuteOffset: 50, isHighPlatform: true, transferLines: ['U4'] },
        { stopName: 'Hammerbrook', minuteOffset: 53, isHighPlatform: true },
        { stopName: 'Hamburg Hbf', minuteOffset: 56, isHighPlatform: true, transferLines: ['Alle S-/U-Bahnen'] },
        { stopName: 'Dammtor', minuteOffset: 59, isHighPlatform: true, transferLines: ['Fernverkehr', 'S2'] },
        { stopName: 'Sternschanze', minuteOffset: 61, isHighPlatform: true, transferLines: ['U3', 'S2'] },
        { stopName: 'Holstenstraße', minuteOffset: 63, isHighPlatform: true, transferLines: ['S2'] },
        { stopName: 'Diebsteich', minuteOffset: 65, isHighPlatform: true },
        { stopName: 'Langenfelde', minuteOffset: 67, isHighPlatform: true },
        { stopName: 'Stellingen', minuteOffset: 69, isHighPlatform: true },
        { stopName: 'Eidelstedt', minuteOffset: 71, isHighPlatform: true },
        { stopName: 'Elbgaustraße', minuteOffset: 74, isHighPlatform: true, transferLines: ['S3'] }
      ]
    },
    frequency: { peak: '20 Min. (bis Stade) / 10 Min. (Kern)', offPeak: '20 Min.', night: '60 Min. Fr/Sa' },
    operatingHours: { firstTrain: '04:25', lastTrain: '00:55', nightService: true }
  },
  '61': {
    lineRef: '61',
    lineName: 'HADAG Fähre 61 (Landungsbrücken ⇄ Neuhof)',
    stammstrecke: 'F',
    corridorName: 'St. Pauli Landungsbrücken ⇄ Altona Fischmarkt ⇄ Dockland ⇄ Neuhof',
    color: '#0284c7',
    directionA: {
      origin: 'Landungsbrücken (Brücke 2)',
      destination: 'Neuhof (Köhlbrand)',
      totalMinutes: 22,
      baseMinuteDepartures: [5, 25, 45],
      stops: [
        { stopName: 'Landungsbrücken (Brücke 2)', minuteOffset: 0, isHighPlatform: true, transferLines: ['U3', 'S1', 'S3'] },
        { stopName: 'Altona Fischmarkt', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Dockland', minuteOffset: 11, isHighPlatform: true },
        { stopName: 'Neuhof', minuteOffset: 22, isHighPlatform: true }
      ]
    },
    directionB: {
      origin: 'Neuhof',
      destination: 'Landungsbrücken (Brücke 2)',
      totalMinutes: 22,
      baseMinuteDepartures: [10, 30, 50],
      stops: [
        { stopName: 'Neuhof', minuteOffset: 0 },
        { stopName: 'Dockland', minuteOffset: 11 },
        { stopName: 'Altona Fischmarkt', minuteOffset: 16 },
        { stopName: 'Landungsbrücken (Brücke 2)', minuteOffset: 22 }
      ]
    },
    frequency: { peak: '20 Min.', offPeak: '30 Min.', night: 'Kein Spätverkehr' },
    operatingHours: { firstTrain: '05:45', lastTrain: '20:15', nightService: false }
  },
  '62': {
    lineRef: '62',
    lineName: 'HADAG Fähre 62 (Hafen-Längslinie)',
    stammstrecke: 'F',
    corridorName: 'St. Pauli Landungsbrücken (Brücke 3) ⇄ Altona ⇄ Övelgönne ⇄ Finkenwerder',
    color: '#06b6d4',
    directionA: {
      origin: 'Landungsbrücken Brücke 3',
      destination: 'Finkenwerder (Kutterhafen / Airbus)',
      totalMinutes: 30,
      baseMinuteDepartures: [0, 15, 30, 45],
      stops: [
        { stopName: 'Landungsbrücken (Brücke 3)', minuteOffset: 0, isHighPlatform: true, transferLines: ['U3', 'S1', 'S3'] },
        { stopName: 'Altona (Fischmarkt)', minuteOffset: 6, isHighPlatform: true },
        { stopName: 'Dockland (Fischereihafen)', minuteOffset: 11, isHighPlatform: true },
        { stopName: 'Övelgönne (Museumshafen)', minuteOffset: 15, isHighPlatform: true },
        { stopName: 'Bubendey-Ufer', minuteOffset: 23, isHighPlatform: true },
        { stopName: 'Finkenwerder', minuteOffset: 30, isHighPlatform: true, transferLines: ['Fähre 64 (Teufelsbrück)', 'Busse'] }
      ]
    },
    directionB: {
      origin: 'Finkenwerder',
      destination: 'Landungsbrücken Brücke 3',
      totalMinutes: 30,
      baseMinuteDepartures: [0, 15, 30, 45],
      stops: [
        { stopName: 'Finkenwerder', minuteOffset: 0 },
        { stopName: 'Bubendey-Ufer', minuteOffset: 7 },
        { stopName: 'Övelgönne', minuteOffset: 15 },
        { stopName: 'Dockland', minuteOffset: 19 },
        { stopName: 'Altona (Fischmarkt)', minuteOffset: 24 },
        { stopName: 'Landungsbrücken (Brücke 3)', minuteOffset: 30 }
      ]
    },
    frequency: { peak: '15 Min.', offPeak: '15-30 Min.', night: '60 Min. (bis 23:45 Uhr)' },
    operatingHours: { firstTrain: '05:30', lastTrain: '23:45', nightService: false }
  },
  '72': {
    lineRef: '72',
    lineName: 'HADAG Fähre 72 (Elbphilharmonie Shuttle)',
    stammstrecke: 'F',
    corridorName: 'St. Pauli Landungsbrücken (Brücke 1) ⇄ Elbphilharmonie',
    color: '#f59e0b',
    directionA: {
      origin: 'Landungsbrücken (Brücke 1)',
      destination: 'Elbphilharmonie',
      totalMinutes: 10,
      baseMinuteDepartures: [0, 20, 40],
      stops: [
        { stopName: 'Landungsbrücken (Brücke 1)', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Arningstraße', minuteOffset: 5, isHighPlatform: true },
        { stopName: 'Elbphilharmonie', minuteOffset: 10, isHighPlatform: true }
      ]
    },
    directionB: {
      origin: 'Elbphilharmonie',
      destination: 'Landungsbrücken (Brücke 1)',
      totalMinutes: 10,
      baseMinuteDepartures: [10, 30, 50],
      stops: [
        { stopName: 'Elbphilharmonie', minuteOffset: 0 },
        { stopName: 'Landungsbrücken (Brücke 1)', minuteOffset: 10 }
      ]
    },
    frequency: { peak: '20 Min.', offPeak: '20 Min.', night: 'Bis 23:30 Uhr bei Konzertbetrieb' },
    operatingHours: { firstTrain: '08:00', lastTrain: '23:30', nightService: false }
  },

  // --- 🚆 REGIO / DB HAMBURG ---
  'RE1': {
    lineRef: 'RE1',
    lineName: 'Hanse-Express RE1 (DB Regio)',
    stammstrecke: 'R',
    corridorName: 'Hamburg Hbf ⇄ Bergedorf ⇄ Büchen ⇄ Schwerin ⇄ Rostock Hbf',
    color: '#ef4444',
    directionA: {
      origin: 'Hamburg Hbf',
      destination: 'Rostock Hbf',
      totalMinutes: 125,
      baseMinuteDepartures: [21],
      stops: [
        { stopName: 'Hamburg Hbf', minuteOffset: 0, isHighPlatform: true, transferLines: ['ICE', 'S-Bahn', 'U-Bahn'] },
        { stopName: 'Hamburg-Bergedorf', minuteOffset: 11, isHighPlatform: true, transferLines: ['S2'] },
        { stopName: 'Schwarzenbek', minuteOffset: 22, isHighPlatform: true },
        { stopName: 'Müssen', minuteOffset: 29, isHighPlatform: true },
        { stopName: 'Büchen', minuteOffset: 36, isHighPlatform: true, transferLines: ['RE83'] },
        { stopName: 'Boizenburg (Elbe)', minuteOffset: 48, isHighPlatform: true },
        { stopName: 'Brahlstorf', minuteOffset: 57, isHighPlatform: true },
        { stopName: 'Hagenow Land', minuteOffset: 69, isHighPlatform: true },
        { stopName: 'Schwerin Süd', minuteOffset: 84, isHighPlatform: true },
        { stopName: 'Schwerin Hbf', minuteOffset: 92, isHighPlatform: true, transferLines: ['ICE', 'RE4'] },
        { stopName: 'Bad Kleinen', minuteOffset: 105, isHighPlatform: true },
        { stopName: 'Bützow', minuteOffset: 116, isHighPlatform: true },
        { stopName: 'Rostock Hbf', minuteOffset: 135, isHighPlatform: true, transferLines: ['Fernverkehr', 'S-Bahn'] }
      ]
    },
    directionB: {
      origin: 'Rostock Hbf',
      destination: 'Hamburg Hbf',
      totalMinutes: 125,
      baseMinuteDepartures: [0],
      stops: [
        { stopName: 'Rostock Hbf', minuteOffset: 0, isHighPlatform: true },
        { stopName: 'Bützow', minuteOffset: 19, isHighPlatform: true },
        { stopName: 'Bad Kleinen', minuteOffset: 30, isHighPlatform: true },
        { stopName: 'Schwerin Hbf', minuteOffset: 43, isHighPlatform: true },
        { stopName: 'Schwerin Süd', minuteOffset: 51, isHighPlatform: true },
        { stopName: 'Hagenow Land', minuteOffset: 66, isHighPlatform: true },
        { stopName: 'Büchen', minuteOffset: 98, isHighPlatform: true },
        { stopName: 'Hamburg-Bergedorf', minuteOffset: 114, isHighPlatform: true },
        { stopName: 'Hamburg Hbf', minuteOffset: 125, isHighPlatform: true }
      ]
    },
    frequency: { peak: '60 Min. (HVZ 30 Min.)', offPeak: '60 Min.', night: '120 Min.' },
    operatingHours: { firstTrain: '04:45', lastTrain: '00:30', nightService: false }
  },

  // --- 🚌 METROBUS HAMBURG ---
  '5': {
    lineRef: '5',
    lineName: 'Metrobus 5 (Europas meistgenutzte Buslinie)',
    stammstrecke: 'BUS',
    corridorName: 'Hauptbahnhof / ZOB ⇄ Dammtor ⇄ Uni ⇄ Hoheluft ⇄ Niendorf Markt ⇄ Burgwedel',
    color: '#84cc16',
    directionA: {
      origin: 'Hauptbahnhof / ZOB',
      destination: 'Burgwedel',
      totalMinutes: 44,
      baseMinuteDepartures: [2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57],
      stops: [
        { stopName: 'Hauptbahnhof / ZOB', minuteOffset: 0, transferLines: ['U-Bahn', 'S-Bahn', 'Fernverkehr'] },
        { stopName: 'Gerhart-Hauptmann-Platz', minuteOffset: 2 },
        { stopName: 'Jungfernstieg', minuteOffset: 5, transferLines: ['U1', 'U2', 'U4', 'S1', 'S3'] },
        { stopName: 'Gänsemarkt (Oper)', minuteOffset: 7, transferLines: ['U2'] },
        { stopName: 'Dammtor Bahnhof', minuteOffset: 10, transferLines: ['S2', 'S5', 'Fernverkehr'] },
        { stopName: 'Staatsbibliothek / Uni Hamburg', minuteOffset: 13 },
        { stopName: 'Grindelhof', minuteOffset: 15 },
        { stopName: 'Bezirksamt Eimsbüttel', minuteOffset: 18 },
        { stopName: 'Hoheluftbrücke', minuteOffset: 21, transferLines: ['U3'] },
        { stopName: 'Gärtnerstraße', minuteOffset: 25, transferLines: ['Metrobus 20', '25'] },
        { stopName: 'Nedderfeld', minuteOffset: 31 },
        { stopName: 'Niendorf Markt', minuteOffset: 38, transferLines: ['U2'] },
        { stopName: 'Burgwedel', minuteOffset: 44, transferLines: ['A1 AKN'] }
      ]
    },
    directionB: {
      origin: 'Burgwedel',
      destination: 'Hauptbahnhof / ZOB',
      totalMinutes: 44,
      baseMinuteDepartures: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56],
      stops: [
        { stopName: 'Burgwedel', minuteOffset: 0 },
        { stopName: 'Niendorf Markt', minuteOffset: 6, transferLines: ['U2'] },
        { stopName: 'Nedderfeld', minuteOffset: 13 },
        { stopName: 'Gärtnerstraße', minuteOffset: 19 },
        { stopName: 'Hoheluftbrücke', minuteOffset: 23, transferLines: ['U3'] },
        { stopName: 'Bezirksamt Eimsbüttel', minuteOffset: 26 },
        { stopName: 'Grindelhof', minuteOffset: 29 },
        { stopName: 'Dammtor Bahnhof', minuteOffset: 34, transferLines: ['S2', 'S5'] },
        { stopName: 'Gänsemarkt', minuteOffset: 37 },
        { stopName: 'Jungfernstieg', minuteOffset: 39 },
        { stopName: 'Hauptbahnhof / ZOB', minuteOffset: 44 }
      ]
    },
    frequency: { peak: '3-5 Min.', offPeak: '5 Min. (Takt 5)', night: '20 Min. durchgehend (Nachtbus)' },
    operatingHours: { firstTrain: '24/7', lastTrain: '24/7', nightService: true }
  }
};
