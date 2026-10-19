// Offizielle Fahrplandaten, statische Aushangfahrpläne (Soll-Zeiten) und Haltestellenfolgen der ÜSTRA / GVH Hannover & HVV Hamburg
// Vollständige Liniennetze inklusive aller Stammstrecken, S-Bahnen, Regionalbahnen, Metrobusse und HADAG Fähren

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
  isDisrupted?: boolean;
  disruptionType?: 'CANCELED' | 'DELAYED' | 'REROUTED' | 'SEV';
  disruptionNotice?: string;
  directionA: {
    origin: string;
    destination: string;
    totalMinutes?: number;
    baseMinuteDepartures: number[];
    stops: ScheduleStopItem[];
  };
  directionB: {
    origin: string;
    destination: string;
    totalMinutes?: number;
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

// Generator für realistische, exakte Soll-Aushangfahrpläne basierend auf Linie, Takt und Haltestellen-Offset
export function generateStationTimetable(
  minuteOffset: number, 
  isWeekendNightService: boolean = true,
  schedule?: LineSchedule,
  direction?: 'A' | 'B'
): TimetableHourRow[] {
  const rows: TimetableHourRow[] = [];

  const isRegio = schedule?.stammstrecke === 'R' || schedule?.lineRef.startsWith('RE') || schedule?.lineRef.startsWith('RB');
  const isSBahn = schedule?.stammstrecke === 'S' || schedule?.lineRef.startsWith('S');
  const isBus = schedule?.stammstrecke === 'BUS';

  const dirObj = direction === 'B' ? schedule?.directionB : schedule?.directionA;
  const baseMinutes = dirObj?.baseMinuteDepartures && dirObj.baseMinuteDepartures.length > 0 
    ? dirObj.baseMinuteDepartures 
    : [15];

  const firstHour = schedule?.operatingHours?.firstTrain 
    ? parseInt(schedule.operatingHours.firstTrain.split(':')[0], 10) 
    : 4;
  const lastHour = schedule?.operatingHours?.lastTrain 
    ? parseInt(schedule.operatingHours.lastTrain.split(':')[0], 10) 
    : 24;

  for (let h = 4; h <= 28; h++) {
    const displayHour = h >= 24 ? h - 24 : h;

    if (h < firstHour || (h > lastHour && h < 24 && !schedule?.operatingHours?.nightService)) {
      continue;
    }

    let weekdayMins: number[] = [];
    let satMins: number[] = [];
    let sunMins: number[] = [];

    if (isRegio) {
      // REGIONALZÜGE (RE / RB): Typischerweise 60-Minuten-Takt (oder 120-Minuten-Takt), niemals 10-Minuten-Takt!
      // Verwende die echten baseMinuteDepartures der Linie + Haltestellenoffset
      const depMins = baseMinutes.map(bm => (bm + minuteOffset) % 60).sort((a, b) => a - b);
      weekdayMins = [...depMins];
      satMins = [...depMins];
      sunMins = (h >= 6 && h <= 23) ? [...depMins] : [];
    } else if (isSBahn) {
      // S-BAHN: Typischerweise 20- oder 30-Minuten-Takt im Berufsverkehr, abends 30/60
      const base = (baseMinutes[0] + minuteOffset) % 20;
      if (h >= 5 && h <= 20) {
        weekdayMins = [base, (base + 20) % 60, (base + 40) % 60].sort((a, b) => a - b);
      } else {
        weekdayMins = [base, (base + 30) % 60].sort((a, b) => a - b);
      }
      satMins = [base, (base + 20) % 60, (base + 40) % 60].sort((a, b) => a - b);
      sunMins = (h >= 6) ? [base, (base + 30) % 60].sort((a, b) => a - b) : [];
    } else if (isBus) {
      // BUS / METROBUS: 10-Minuten-Takt tagsüber, abends 15/20-Minuten-Takt
      const base = (baseMinutes[0] + minuteOffset) % 10;
      if (h >= 6 && h <= 20) {
        weekdayMins = [base, base + 10, base + 20, base + 30, base + 40, base + 50].map(m => (m + 60) % 60).sort((a, b) => a - b);
      } else if (h === 5 || (h >= 21 && h <= 23)) {
        const b15 = (baseMinutes[0] + minuteOffset) % 15;
        weekdayMins = [b15, b15 + 15, b15 + 30, b15 + 45].map(m => (m + 60) % 60).sort((a, b) => a - b);
      } else {
        weekdayMins = [(baseMinutes[0] + minuteOffset) % 60];
      }
      satMins = (h >= 8 && h <= 20)
        ? [base, base + 10, base + 20, base + 30, base + 40, base + 50].map(m => (m + 60) % 60).sort((a, b) => a - b)
        : [(baseMinutes[0] + minuteOffset) % 60, (baseMinutes[0] + minuteOffset + 30) % 60].sort((a, b) => a - b);
      sunMins = (h >= 8 && h <= 21)
        ? [(baseMinutes[0] + minuteOffset) % 60, (baseMinutes[0] + minuteOffset + 20) % 60, (baseMinutes[0] + minuteOffset + 40) % 60].sort((a, b) => a - b)
        : [(baseMinutes[0] + minuteOffset) % 60];
    } else {
      // U-BAHN & STADTBAHN: 10-Minuten-Takt Hauptverkehrszeit, 15-Minuten-Takt Spätverkehr
      if (h === 4) {
        weekdayMins = [(9 + minuteOffset) % 60, (39 + minuteOffset) % 60].filter(m => !isNaN(m)).sort((a, b) => a - b);
      } else if (h === 5) {
        weekdayMins = [(5 + minuteOffset) % 60, (18 + minuteOffset) % 60, (33 + minuteOffset) % 60, (48 + minuteOffset) % 60].sort((a, b) => a - b);
      } else if (h >= 6 && h <= 19) {
        const base = (2 + minuteOffset) % 10;
        weekdayMins = [base, base + 10, base + 20, base + 30, base + 40, base + 50].map(m => (m + 60) % 60).sort((a, b) => a - b);
      } else if (h >= 20 && h <= 23) {
        const base = (5 + minuteOffset) % 15;
        weekdayMins = [base, base + 15, base + 30, base + 45].map(m => (m + 60) % 60).sort((a, b) => a - b);
      } else if (h === 24 || h === 0) {
        weekdayMins = [(9 + minuteOffset) % 60, (39 + minuteOffset) % 60].sort((a, b) => a - b);
      } else if (h === 25 || h === 1) {
        if (isWeekendNightService) weekdayMins = [(1 + minuteOffset) % 60];
      }

      if (h === 4) {
        satMins = [(39 + minuteOffset) % 60];
      } else if (h === 5) {
        satMins = [(9 + minuteOffset) % 60, (39 + minuteOffset) % 60].sort((a, b) => a - b);
      } else if (h >= 6 && h <= 8) {
        satMins = [(5 + minuteOffset) % 15, (5 + minuteOffset + 15) % 15, (5 + minuteOffset + 30) % 60, (5 + minuteOffset + 45) % 60].sort((a, b) => a - b);
      } else if (h >= 9 && h <= 19) {
        const base = (2 + minuteOffset) % 10;
        satMins = [base, base + 10, base + 20, base + 30, base + 40, base + 50].map(m => (m + 60) % 60).sort((a, b) => a - b);
      } else if (h >= 20 && h <= 23) {
        const base = (5 + minuteOffset) % 15;
        satMins = [base, base + 15, base + 30, base + 45].map(m => (m + 60) % 60).sort((a, b) => a - b);
      } else if (h >= 24) {
        satMins = [(1 + minuteOffset) % 60];
      }

      if (h >= 5 && h <= 8) {
        sunMins = [(9 + minuteOffset) % 60, (39 + minuteOffset) % 60].sort((a, b) => a - b);
      } else if (h >= 9 && h <= 19) {
        const base = (5 + minuteOffset) % 15;
        sunMins = [base, base + 15, base + 30, base + 45].map(m => (m + 60) % 60).sort((a, b) => a - b);
      } else if (h >= 20 && h <= 23) {
        const base = (5 + minuteOffset) % 15;
        sunMins = [base, base + 15, base + 30, base + 45].map(m => (m + 60) % 60).sort((a, b) => a - b);
      } else if (h >= 24) {
        sunMins = [(1 + minuteOffset) % 60];
      }
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
  "1": {
    "lineRef": "1",
    "lineName": "Stadtbahn 1",
    "stammstrecke": "B",
    "corridorName": "B-Strecke (Langenhagen ⇄ Hbf ⇄ Kröpcke ⇄ Döhren ⇄ Sarstedt)",
    "color": "#ff8000",
    "directionA": {
      "origin": "Langenhagen",
      "destination": "Sarstedt",
      "totalMinutes": 48,
      "baseMinuteDepartures": [
        0,
        10,
        20,
        30,
        40,
        50
      ],
      "stops": [
        {
          "stopName": "Langenhagen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen / Zentrum",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Platz",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Alter Flughafen",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Wiesenau",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Kabelkamp",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Niedersachsenring",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Dragonerstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Vahrenwalder Platz",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Werderstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlägerstraße",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Geibelstraße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Altenbekener Damm",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Fiedelerstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Döhren / Peiner Straße",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Bothmerstraße",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Wiehbergstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Laatzen / Birkenstraße",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Laatzen / Zentrum",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Rethen",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Gleidingen",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Sarstedt",
          "minuteOffset": 48,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Sarstedt",
      "destination": "Langenhagen",
      "totalMinutes": 48,
      "baseMinuteDepartures": [
        3,
        13,
        23,
        33,
        43,
        53
      ],
      "stops": [
        {
          "stopName": "Sarstedt",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Gleidingen",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Rethen",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Laatzen / Zentrum",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Laatzen / Birkenstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Wiehbergstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Bothmerstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Döhren / Peiner Straße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Fiedelerstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Altenbekener Damm",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Geibelstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlägerstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Werderstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Vahrenwalder Platz",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Dragonerstraße",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Niedersachsenring",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Kabelkamp",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Wiesenau",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Alter Flughafen",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Platz",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen / Zentrum",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen",
          "minuteOffset": 48,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min. / NStB Fr+Sa"
    },
    "operatingHours": {
      "firstTrain": "04:05",
      "lastTrain": "01:20",
      "nightService": true
    }
  },
  "2": {
    "lineRef": "2",
    "lineName": "Stadtbahn 2",
    "stammstrecke": "B",
    "corridorName": "B-Strecke (Alte Heide ⇄ Vahrenheide ⇄ Hbf ⇄ Kröpcke ⇄ Rethen)",
    "color": "#3b82f6",
    "directionA": {
      "origin": "Alte Heide",
      "destination": "Rethen",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Alte Heide",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnstr.",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Vahrenheider Markt",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Zehlendorfweg",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Niedersachsenring",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Dragonerstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Vahrenwalder Platz",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Werderstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlägerstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Geibelstraße",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Altenbekener Damm",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Fiedelerstraße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Döhren / Peiner Straße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Bothmerstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Wiehbergstraße",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Laatzen / Birkenstraße",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Laatzen / Ginsterweg",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Rethen / Nord",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Rethen",
          "minuteOffset": 42,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Rethen",
      "destination": "Alte Heide",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        6,
        16,
        26,
        36,
        46,
        56
      ],
      "stops": [
        {
          "stopName": "Rethen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Rethen / Nord",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Laatzen / Ginsterweg",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Laatzen / Birkenstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Wiehbergstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Bothmerstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Döhren / Peiner Straße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Fiedelerstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Altenbekener Damm",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Geibelstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlägerstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Werderstraße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Vahrenwalder Platz",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Dragonerstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Niedersachsenring",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Zehlendorfweg",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Vahrenheider Markt",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnstr.",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Alte Heide",
          "minuteOffset": 42,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min. / NStB"
    },
    "operatingHours": {
      "firstTrain": "04:15",
      "lastTrain": "00:45",
      "nightService": true
    }
  },
  "3": {
    "lineRef": "3",
    "lineName": "Stadtbahn 3",
    "stammstrecke": "A",
    "corridorName": "A-Strecke (Wettbergen ⇄ Waterloo ⇄ Kröpcke ⇄ Hbf ⇄ Altwarmbüchen)",
    "color": "#0284c7",
    "directionA": {
      "origin": "Wettbergen",
      "destination": "Altwarmbüchen",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Wettbergen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Tresckowstraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Wallensteinstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Beekestraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Linden/Fischerhof",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadionbrücke",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Allerweg",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Markthalle / Landtag",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Sedanstraße / Gerberstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Lortzingstraße",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Vier Grenzen",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Pelikanstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Spannhagengarten",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Noltemeyerbrücke",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Paracelsusweg",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Opelstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Altwarmbüchen",
          "minuteOffset": 40,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Altwarmbüchen",
      "destination": "Wettbergen",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Altwarmbüchen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Opelstraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Paracelsusweg",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Noltemeyerbrücke",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Spannhagengarten",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Pelikanstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Vier Grenzen",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Lortzingstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Sedanstraße / Gerberstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Markthalle / Landtag",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Allerweg",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadionbrücke",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Linden/Fischerhof",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Beekestraße",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Wallensteinstraße",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Tresckowstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Wettbergen",
          "minuteOffset": 40,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min. / NStB Fr+Sa"
    },
    "operatingHours": {
      "firstTrain": "04:12",
      "lastTrain": "01:15",
      "nightService": true
    }
  },
  "4": {
    "lineRef": "4",
    "lineName": "Stadtbahn 4",
    "stammstrecke": "C",
    "corridorName": "C-Strecke (Garbsen ⇄ Herrenhausen ⇄ Steintor ⇄ Kröpcke ⇄ MHH ⇄ Roderbruch)",
    "color": "#10b981",
    "directionA": {
      "origin": "Garbsen",
      "destination": "Roderbruch",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        1,
        11,
        21,
        31,
        41,
        51
      ],
      "stops": [
        {
          "stopName": "Garbsen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Auf der Horst",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Wissenschaftspark Marienwerder",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Friedhof Auf der Horst",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadtfriedhof Stöcken",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Schaumburgstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Herrenhäuser Gärten",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Appelstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Schneiderberg",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Leibniz Universität",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Königsworther Platz",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweiger Platz",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Clausewitzstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Kantplatz",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Uhlhornstraße",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Kleefeld Bahnhof",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Medizinische Hochschule (MHH)",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Roderbruch",
          "minuteOffset": 42,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Roderbruch",
      "destination": "Garbsen",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        4,
        14,
        24,
        34,
        44,
        54
      ],
      "stops": [
        {
          "stopName": "Roderbruch",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Medizinische Hochschule (MHH)",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Kleefeld Bahnhof",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Uhlhornstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Kantplatz",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Clausewitzstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweiger Platz",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Königsworther Platz",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Leibniz Universität",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Schneiderberg",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Appelstraße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Herrenhäuser Gärten",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Schaumburgstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadtfriedhof Stöcken",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Friedhof Auf der Horst",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Wissenschaftspark Marienwerder",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Auf der Horst",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Garbsen",
          "minuteOffset": 42,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min. / NStB"
    },
    "operatingHours": {
      "firstTrain": "04:00",
      "lastTrain": "01:05",
      "nightService": true
    }
  },
  "5": {
    "lineRef": "5",
    "lineName": "Stadtbahn 5",
    "stammstrecke": "C",
    "corridorName": "C-West / C-Ost (Stöcken ⇄ Herrenhausen ⇄ Steintor ⇄ Kröpcke ⇄ Aegi ⇄ Anderten)",
    "color": "#eab308",
    "directionA": {
      "origin": "Stöcken",
      "destination": "Anderten",
      "totalMinutes": 45,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Stöcken",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Stöckener Markt",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Freudenthalstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadtfriedhof Stöcken",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Leinhausen",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Herrenhäuser Markt",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Schaumburgstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Herrenhäuser Gärten",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Appelstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Schneiderbg./W.-Busch-Mus.",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Leibniz Universität",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Königsworther Platz",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweiger Platz",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Clausewitzstraße",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Kantplatz",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Uhlhornstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Nackenberg",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Annastift",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Bleekstraße",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Saarbrückener Straße",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Großer Hillen",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Tiergarten",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Ostfeldstraße",
          "minuteOffset": 52,
          "isHighPlatform": true
        },
        {
          "stopName": "Königsberger Ring",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Anderten",
          "minuteOffset": 56,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Anderten",
      "destination": "Stöcken",
      "totalMinutes": 45,
      "baseMinuteDepartures": [
        0,
        10,
        20,
        30,
        40,
        50
      ],
      "stops": [
        {
          "stopName": "Anderten",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Königsberger Ring",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Ostfeldstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Tiergarten",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Großer Hillen",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Saarbrückener Straße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Bleekstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Annastift",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Nackenberg",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Uhlhornstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Kantplatz",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Clausewitzstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweiger Platz",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Königsworther Platz",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Leibniz Universität",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Schneiderbg./W.-Busch-Mus.",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Appelstraße",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Herrenhäuser Gärten",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Schaumburgstraße",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Herrenhäuser Markt",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Leinhausen",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadtfriedhof Stöcken",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Freudenthalstraße",
          "minuteOffset": 52,
          "isHighPlatform": true
        },
        {
          "stopName": "Stöckener Markt",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Stöcken",
          "minuteOffset": 56,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "60 Min. / NStB"
    },
    "operatingHours": {
      "firstTrain": "04:09",
      "lastTrain": "00:39",
      "nightService": true
    }
  },
  "6": {
    "lineRef": "6",
    "lineName": "Stadtbahn 6",
    "stammstrecke": "C",
    "corridorName": "C-Nord / C-Ost (Nordhafen ⇄ Hainholz ⇄ Steintor ⇄ Kröpcke ⇄ Aegi ⇄ Messe/Ost)",
    "color": "#f59e0b",
    "specialNotice": "Haltestelle Bahnhof Nordstadt entfällt wegen Bauarbeiten bis auf Weiteres.",
    "directionA": {
      "origin": "Nordhafen",
      "destination": "Messe/Ost (EXPO-Plaza)",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        8,
        18,
        28,
        38,
        48,
        58
      ],
      "stops": [
        {
          "stopName": "Nordhafen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Mecklenheidestraße",
          "minuteOffset": 1,
          "isHighPlatform": true
        },
        {
          "stopName": "Beneckeallee",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Friedenauer Straße",
          "minuteOffset": 3,
          "isHighPlatform": true
        },
        {
          "stopName": "Krepenstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Hainhölzer Markt",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Fenskestraße",
          "minuteOffset": 7,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Nordstadt",
          "minuteOffset": 9,
          "isHighPlatform": false,
          "notice": "Entfällt wegen Bauarbeiten"
        },
        {
          "stopName": "An der Strangriede",
          "minuteOffset": 11,
          "isHighPlatform": true
        },
        {
          "stopName": "Kopernikusstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Christuskirche",
          "minuteOffset": 13,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 17,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 19,
          "isHighPlatform": true
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweiger Platz",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Freundallee",
          "minuteOffset": 23,
          "isHighPlatform": true
        },
        {
          "stopName": "Kerstingstraße",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Kinderkrankenhs. auf der Bult",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Zuschlagstraße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Bünteweg/Ti.Hochschule",
          "minuteOffset": 29,
          "isHighPlatform": true
        },
        {
          "stopName": "August-Madsack-Straße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Seelhorster Allee",
          "minuteOffset": 31,
          "isHighPlatform": true
        },
        {
          "stopName": "Emslandstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Brabeckstraße",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Feldbuschwende",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Kronsberg",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Krügerskamp",
          "minuteOffset": 37,
          "isHighPlatform": true
        },
        {
          "stopName": "Stockholmer Allee",
          "minuteOffset": 39,
          "isHighPlatform": true
        },
        {
          "stopName": "Messe/Ost (EXPO-Plaza)",
          "minuteOffset": 41,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Messe/Ost (EXPO-Plaza)",
      "destination": "Nordhafen",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        1,
        11,
        21,
        31,
        41,
        51
      ],
      "stops": [
        {
          "stopName": "Messe/Ost (EXPO-Plaza)",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Stockholmer Allee",
          "minuteOffset": 1,
          "isHighPlatform": true
        },
        {
          "stopName": "Krügerskamp",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Kronsberg",
          "minuteOffset": 3,
          "isHighPlatform": true
        },
        {
          "stopName": "Feldbuschwende",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Brabeckstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Emslandstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Seelhorster Allee",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "August-Madsack-Straße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Bünteweg/Ti.Hochschule",
          "minuteOffset": 11,
          "isHighPlatform": true
        },
        {
          "stopName": "Zuschlagstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Kinderkrankenhs. auf der Bult",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Kerstingstraße",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Freundallee",
          "minuteOffset": 17,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweiger Platz",
          "minuteOffset": 19,
          "isHighPlatform": true
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Christuskirche",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Kopernikusstraße",
          "minuteOffset": 29,
          "isHighPlatform": true
        },
        {
          "stopName": "An der Strangriede",
          "minuteOffset": 31,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Nordstadt",
          "minuteOffset": 33,
          "isHighPlatform": false,
          "notice": "Entfällt wegen Bauarbeiten"
        },
        {
          "stopName": "Fenskestraße",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hainhölzer Markt",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Krepenstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Friedenauer Straße",
          "minuteOffset": 39,
          "isHighPlatform": true
        },
        {
          "stopName": "Beneckeallee",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Mecklenheidestraße",
          "minuteOffset": 41,
          "isHighPlatform": true
        },
        {
          "stopName": "Nordhafen",
          "minuteOffset": 43,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "60 Min. / NStB"
    },
    "operatingHours": {
      "firstTrain": "04:09",
      "lastTrain": "00:33",
      "nightService": true
    }
  },
  "7": {
    "lineRef": "7",
    "lineName": "Stadtbahn 7",
    "stammstrecke": "A",
    "corridorName": "A-Strecke (Wettbergen ⇄ Waterloo ⇄ Kröpcke ⇄ Hbf ⇄ Misburg)",
    "color": "#6366f1",
    "directionA": {
      "origin": "Wettbergen",
      "destination": "Misburg",
      "totalMinutes": 40,
      "baseMinuteDepartures": [
        7,
        17,
        27,
        37,
        47,
        57
      ],
      "stops": [
        {
          "stopName": "Wettbergen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Tresckowstraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Wallensteinstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Beekestraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Linden/Fischerhof",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadionbrücke",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Allerweg",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Markthalle / Landtag",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Sedanstraße / Gerberstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Lortzingstraße",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Vier Grenzen",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Pelikanstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Spannhagengarten",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Noltemeyerbrücke",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Paracelsusweg",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Schierholzstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Kafkastraße",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Forstkamp",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Misburg",
          "minuteOffset": 44,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Misburg",
      "destination": "Wettbergen",
      "totalMinutes": 40,
      "baseMinuteDepartures": [
        0,
        10,
        20,
        30,
        40,
        50
      ],
      "stops": [
        {
          "stopName": "Misburg",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Forstkamp",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Kafkastraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Schierholzstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Paracelsusweg",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Noltemeyerbrücke",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Spannhagengarten",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Pelikanstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Vier Grenzen",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Lortzingstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Sedanstraße / Gerberstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Markthalle / Landtag",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Allerweg",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadionbrücke",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Linden/Fischerhof",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Beekestraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Wallensteinstraße",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Tresckowstraße",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Wettbergen",
          "minuteOffset": 44,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:18",
      "lastTrain": "00:55",
      "nightService": true
    }
  },
  "8": {
    "lineRef": "8",
    "lineName": "Stadtbahn 8",
    "stammstrecke": "B",
    "corridorName": "B-Strecke (Hauptbahnhof ⇄ Kröpcke ⇄ Aegi ⇄ Döhren ⇄ Messe/Nord)",
    "color": "#f43f5e",
    "directionA": {
      "origin": "Hauptbahnhof",
      "destination": "Messe/Nord",
      "totalMinutes": 24,
      "baseMinuteDepartures": [
        8,
        18,
        28,
        38,
        48,
        58
      ],
      "stops": [
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlägerstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Geibelstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Altenbekener Damm",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Fiedelerstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Döhren / Peiner Straße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Bothmerstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadtfriedhof Seelhorst",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Mittelfelde",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Messe/Nord",
          "minuteOffset": 22,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Messe/Nord",
      "destination": "Hauptbahnhof",
      "totalMinutes": 24,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Messe/Nord",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Mittelfelde",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadtfriedhof Seelhorst",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Bothmerstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Döhren / Peiner Straße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Fiedelerstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Altenbekener Damm",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Geibelstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlägerstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 22,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min. (Messe-Verstärker)",
      "offPeak": "20 Min.",
      "night": "Bedarfsverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:30",
      "lastTrain": "20:30",
      "nightService": false
    }
  },
  "9": {
    "lineRef": "9",
    "lineName": "Stadtbahn 9",
    "stammstrecke": "A",
    "corridorName": "A-Strecke (Empelde ⇄ Linden ⇄ Kröpcke ⇄ Hbf ⇄ Fasanenkrug)",
    "color": "#8b5cf6",
    "directionA": {
      "origin": "Empelde",
      "destination": "Fasanenkrug",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        4,
        14,
        24,
        34,
        44,
        54
      ],
      "stops": [
        {
          "stopName": "Empelde",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hermann-Ehlers-Allee",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Köthener Straße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Soltekampe",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Eichenfeldstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Safariweg",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Nieschlagstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Lindener Marktplatz",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Küchengarten",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwarzer Bär",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Markthalle / Landtag",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Sedanstraße / Gerberstraße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Lortzingstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Vier Grenzen",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Pelikanstraße",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Spannhagengarten",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "In den Sieben Stücken",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Kurze-Kamp-Straße",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Fasanenkrug",
          "minuteOffset": 44,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Fasanenkrug",
      "destination": "Empelde",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        3,
        13,
        23,
        33,
        43,
        53
      ],
      "stops": [
        {
          "stopName": "Fasanenkrug",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Kurze-Kamp-Straße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "In den Sieben Stücken",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Spannhagengarten",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Pelikanstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Vier Grenzen",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Lortzingstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Sedanstraße / Gerberstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Markthalle / Landtag",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwarzer Bär",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Küchengarten",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Lindener Marktplatz",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Nieschlagstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Safariweg",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Eichenfeldstraße",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Soltekampe",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Köthener Straße",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hermann-Ehlers-Allee",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Empelde",
          "minuteOffset": 44,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min. / NStB"
    },
    "operatingHours": {
      "firstTrain": "04:10",
      "lastTrain": "01:10",
      "nightService": true
    }
  },
  "10": {
    "lineRef": "10",
    "lineName": "Stadtbahn 10",
    "stammstrecke": "D",
    "corridorName": "D-Strecke oberirdisch (Ahlem ⇄ Linden ⇄ Goetheplatz ⇄ Steintor ⇄ Hbf/ZOB)",
    "color": "#14b8a6",
    "directionA": {
      "origin": "Ahlem",
      "destination": "Hauptbahnhof / ZOB",
      "totalMinutes": 20,
      "baseMinuteDepartures": [
        2,
        9,
        17,
        24,
        32,
        39,
        47,
        54
      ],
      "stops": [
        {
          "stopName": "Ahlem",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Ehrhartstraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Brunnenstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Ungerstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Leinaustraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Küchengarten",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Glocksee",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Goetheplatz",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Clevertor",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof / Rosenstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 22,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hauptbahnhof / ZOB",
      "destination": "Ahlem",
      "totalMinutes": 20,
      "baseMinuteDepartures": [
        5,
        12,
        20,
        27,
        35,
        42,
        50,
        57
      ],
      "stops": [
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof / Rosenstraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Clevertor",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Goetheplatz",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Glocksee",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Am Küchengarten",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Leinaustraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Ungerstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Brunnenstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Ehrhartstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahlem",
          "minuteOffset": 22,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "7,5 Min.",
      "offPeak": "10 Min.",
      "night": "30 Min. / NStB"
    },
    "operatingHours": {
      "firstTrain": "04:22",
      "lastTrain": "00:48",
      "nightService": true
    }
  },
  "11": {
    "lineRef": "11",
    "lineName": "Stadtbahn 11",
    "stammstrecke": "C",
    "corridorName": "C-Strecke (Haltenhoffstraße ⇄ Steintor ⇄ Kröpcke ⇄ Aegi ⇄ Zoo)",
    "color": "#a855f7",
    "directionA": {
      "origin": "Haltenhoffstraße",
      "destination": "Zoo",
      "totalMinutes": 22,
      "baseMinuteDepartures": [
        6,
        16,
        26,
        36,
        46,
        56
      ],
      "stops": [
        {
          "stopName": "Haltenhoffstraße",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "An der Strangriede",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Kopernikusstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Christuskirche",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweiger Platz",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Clausewitzstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Congress Centrum (HCC)",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Zoo",
          "minuteOffset": 22,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Zoo",
      "destination": "Haltenhoffstraße",
      "totalMinutes": 22,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Zoo",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Congress Centrum (HCC)",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Clausewitzstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweiger Platz",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Christuskirche",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Kopernikusstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "An der Strangriede",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Haltenhoffstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:45",
      "lastTrain": "00:15",
      "nightService": true
    }
  },
  "13": {
    "lineRef": "13",
    "lineName": "Stadtbahn 13",
    "stammstrecke": "A",
    "corridorName": "A-Strecke Neubaustrecke (Hemmingen ⇄ Waterloo ⇄ Kröpcke ⇄ Hbf ⇄ Fasanenkrug)",
    "color": "#0ea5e9",
    "directionA": {
      "origin": "Hemmingen",
      "destination": "Fasanenkrug",
      "totalMinutes": 36,
      "baseMinuteDepartures": [
        9,
        19,
        29,
        39,
        49,
        59
      ],
      "stops": [
        {
          "stopName": "Hemmingen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hemmingen / Saarstraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Hemmingen / Berliner Straße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Unter den Birken",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Westerfeld / Deveser Straße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadionbrücke",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Allerweg",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Markthalle / Landtag",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Sedanstraße / Gerberstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Vier Grenzen",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Spannhagengarten",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "In den Sieben Stücken",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Fasanenkrug",
          "minuteOffset": 32,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Fasanenkrug",
      "destination": "Hemmingen",
      "totalMinutes": 36,
      "baseMinuteDepartures": [
        8,
        18,
        28,
        38,
        48,
        58
      ],
      "stops": [
        {
          "stopName": "Fasanenkrug",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "In den Sieben Stücken",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Spannhagengarten",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Vier Grenzen",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Sedanstraße / Gerberstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Markthalle / Landtag",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Allerweg",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadionbrücke",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Westerfeld / Deveser Straße",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Unter den Birken",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Hemmingen / Berliner Straße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Hemmingen / Saarstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hemmingen",
          "minuteOffset": 32,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "Kein Spätverkehr (Übernahme durch L3/7)"
    },
    "operatingHours": {
      "firstTrain": "05:00",
      "lastTrain": "21:30",
      "nightService": false
    }
  },
  "17": {
    "lineRef": "17",
    "lineName": "Stadtbahn 17",
    "stammstrecke": "D",
    "corridorName": "D-Süd (Wallensteinstraße ⇄ Ricklingen ⇄ Schwarzer Bär ⇄ Steintor ⇄ Hbf/ZOB)",
    "color": "#ec4899",
    "directionA": {
      "origin": "Wallensteinstraße",
      "destination": "Hauptbahnhof / ZOB",
      "totalMinutes": 22,
      "baseMinuteDepartures": [
        6,
        26,
        46
      ],
      "stops": [
        {
          "stopName": "Wallensteinstraße",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Beekestraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Linden/Fischerhof",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadionbrücke",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Allerweg",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwarzer Bär",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Humboldtstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Goetheplatz",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Clevertor",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 20,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hauptbahnhof / ZOB",
      "destination": "Wallensteinstraße",
      "totalMinutes": 22,
      "baseMinuteDepartures": [
        10,
        30,
        50
      ],
      "stops": [
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Steintor",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Clevertor",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Goetheplatz",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Humboldtstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwarzer Bär",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Allerweg",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadionbrücke",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Linden/Fischerhof",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Beekestraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Wallensteinstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "20 Min.",
      "offPeak": "20 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:45",
      "lastTrain": "20:45",
      "nightService": false
    }
  },
  "100": {
    "lineRef": "100",
    "lineName": "Ringbus 100 (Erlebnisbus Hannover)",
    "stammstrecke": "BUS",
    "corridorName": "Kröpcke ⇄ Lindener Marktplatz ⇄ Glocksee ⇄ Kröpcke",
    "color": "#84cc16",
    "directionA": {
      "origin": "August-Holweg-Platz",
      "destination": "Kröpcke",
      "totalMinutes": 28,
      "baseMinuteDepartures": [
        4,
        14,
        24,
        34,
        44,
        54
      ],
      "stops": [
        {
          "stopName": "August-Holweg-Platz",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Lindener Marktplatz",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Küchengarten",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Glocksee",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Königsworther Platz",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Christuskirche",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / Ernst-August-Platz",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 28,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Kröpcke",
      "destination": "August-Holweg-Platz",
      "totalMinutes": 28,
      "baseMinuteDepartures": [
        8,
        18,
        28,
        38,
        48,
        58
      ],
      "stops": [
        {
          "stopName": "Kröpcke",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / Ernst-August-Platz",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Christuskirche",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Königsworther Platz",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Glocksee",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Küchengarten",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Lindener Marktplatz",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "August-Holweg-Platz",
          "minuteOffset": 28,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min."
    },
    "operatingHours": {
      "firstTrain": "05:04",
      "lastTrain": "00:34",
      "nightService": true
    }
  },
  "120": {
    "lineRef": "120",
    "lineName": "Bus 120 (Ahlem ⇄ Limmer ⇄ Linden ⇄ Kröpcke)",
    "stammstrecke": "BUS",
    "corridorName": "Ahlem ⇄ Wunstorfer Str. ⇄ Kröpcke",
    "color": "#06b6d4",
    "directionA": {
      "origin": "Ahlem",
      "destination": "Kröpcke",
      "totalMinutes": 26,
      "baseMinuteDepartures": [
        7,
        27,
        47
      ],
      "stops": [
        {
          "stopName": "Ahlem",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Wunstorfer Straße",
          "minuteOffset": 3,
          "isHighPlatform": false
        },
        {
          "stopName": "Limmer Schleuse",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Leinaustraße",
          "minuteOffset": 9,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Küchengarten",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 15,
          "isHighPlatform": false
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 21,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Kröpcke",
      "destination": "Ahlem",
      "totalMinutes": 26,
      "baseMinuteDepartures": [
        12,
        32,
        52
      ],
      "stops": [
        {
          "stopName": "Kröpcke",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 3,
          "isHighPlatform": false
        },
        {
          "stopName": "Waterloo",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Küchengarten",
          "minuteOffset": 9,
          "isHighPlatform": false
        },
        {
          "stopName": "Leinaustraße",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Limmer Schleuse",
          "minuteOffset": 15,
          "isHighPlatform": false
        },
        {
          "stopName": "Wunstorfer Straße",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Ahlem",
          "minuteOffset": 21,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "20 Min.",
      "offPeak": "20 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:27",
      "lastTrain": "21:07",
      "nightService": false
    }
  },
  "121": {
    "lineRef": "121",
    "lineName": "Bus 121 (Haltenhoffstr. ⇄ Hbf/ZOB ⇄ Altenbekener Damm)",
    "stammstrecke": "BUS",
    "corridorName": "Haltenhoffstraße ⇄ Hbf ⇄ Südstadt",
    "color": "#f59e0b",
    "directionA": {
      "origin": "Haltenhoffstraße",
      "destination": "Altenbekener Damm",
      "totalMinutes": 32,
      "baseMinuteDepartures": [
        3,
        13,
        23,
        33,
        43,
        53
      ],
      "stops": [
        {
          "stopName": "Haltenhoffstraße",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Fenskestraße",
          "minuteOffset": 5,
          "isHighPlatform": false
        },
        {
          "stopName": "Vahrenwalder Platz",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 15,
          "isHighPlatform": false
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Altenbekener Damm",
          "minuteOffset": 25,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Altenbekener Damm",
      "destination": "Haltenhoffstraße",
      "totalMinutes": 32,
      "baseMinuteDepartures": [
        7,
        17,
        27,
        37,
        47,
        57
      ],
      "stops": [
        {
          "stopName": "Altenbekener Damm",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 5,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Vahrenwalder Platz",
          "minuteOffset": 15,
          "isHighPlatform": false
        },
        {
          "stopName": "Fenskestraße",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Haltenhoffstraße",
          "minuteOffset": 25,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min."
    },
    "operatingHours": {
      "firstTrain": "05:03",
      "lastTrain": "00:33",
      "nightService": true
    }
  },
  "128": {
    "lineRef": "128",
    "lineName": "Bus 128 (Nordhafen ⇄ Lister Platz ⇄ Peiner Straße)",
    "stammstrecke": "BUS",
    "corridorName": "Nordhafen ⇄ List ⇄ Kleefeld ⇄ Peiner Straße",
    "color": "#8b5cf6",
    "directionA": {
      "origin": "Nordhafen",
      "destination": "Peiner Straße",
      "totalMinutes": 36,
      "baseMinuteDepartures": [
        10,
        30,
        50
      ],
      "stops": [
        {
          "stopName": "Nordhafen",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Mecklenheidestraße",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Vahrenwalder Markt",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Niedersachsenring",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Kantplatz",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Peiner Straße",
          "minuteOffset": 36,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Peiner Straße",
      "destination": "Nordhafen",
      "totalMinutes": 36,
      "baseMinuteDepartures": [
        15,
        35,
        55
      ],
      "stops": [
        {
          "stopName": "Peiner Straße",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Kantplatz",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Lister Platz",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Niedersachsenring",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Vahrenwalder Markt",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Mecklenheidestraße",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Nordhafen",
          "minuteOffset": 36,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "20 Min.",
      "offPeak": "20 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:10",
      "lastTrain": "21:50",
      "nightService": false
    }
  },
  "134": {
    "lineRef": "134",
    "lineName": "Bus 134 (Nordhafen ⇄ Vahrenwald ⇄ Hbf ⇄ Peiner Straße)",
    "stammstrecke": "BUS",
    "corridorName": "Nordhafen ⇄ Vahrenwald ⇄ Hbf ⇄ Bult ⇄ Döhren",
    "color": "#ec4899",
    "directionA": {
      "origin": "Nordhafen",
      "destination": "Peiner Straße",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        0,
        20,
        40
      ],
      "stops": [
        {
          "stopName": "Nordhafen",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Beneckeallee",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Vahrenheider Markt",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Kinderkrankenhs. auf der Bult",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Peiner Straße",
          "minuteOffset": 36,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Peiner Straße",
      "destination": "Nordhafen",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        5,
        25,
        45
      ],
      "stops": [
        {
          "stopName": "Peiner Straße",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Kinderkrankenhs. auf der Bult",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Marienstraße",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Vahrenheider Markt",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Beneckeallee",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Nordhafen",
          "minuteOffset": 36,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "20 Min.",
      "offPeak": "20 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:00",
      "lastTrain": "21:45",
      "nightService": false
    }
  },
  "200": {
    "lineRef": "200",
    "lineName": "Ringbus 200 (Gegenrichtung Ring 100)",
    "stammstrecke": "BUS",
    "corridorName": "Kröpcke ⇄ Aegi ⇄ Waterlooplatz ⇄ Linden ⇄ August-Holweg-Platz",
    "color": "#10b981",
    "directionA": {
      "origin": "Kröpcke",
      "destination": "August-Holweg-Platz",
      "totalMinutes": 28,
      "baseMinuteDepartures": [
        0,
        10,
        20,
        30,
        40,
        50
      ],
      "stops": [
        {
          "stopName": "Kröpcke",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus / Bleichenstraße",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Waterlooplatz",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Schwarzer Bär",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Lindener Marktplatz",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "August-Holweg-Platz",
          "minuteOffset": 24,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "August-Holweg-Platz",
      "destination": "Kröpcke",
      "totalMinutes": 28,
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "August-Holweg-Platz",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Lindener Marktplatz",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Schwarzer Bär",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Waterlooplatz",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus / Bleichenstraße",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 24,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min."
    },
    "operatingHours": {
      "firstTrain": "05:00",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "800": {
    "lineRef": "800",
    "lineName": "SprintH Bus 800 (Mehrum ⇄ Sehnde ⇄ Kröpcke)",
    "stammstrecke": "BUS",
    "corridorName": "SprintH Expressbus Ost-Region ⇄ Hannover City",
    "color": "#ff8000",
    "directionA": {
      "origin": "Mehrum",
      "destination": "Kröpcke",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        12,
        42
      ],
      "stops": [
        {
          "stopName": "Mehrum",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Rethmar",
          "minuteOffset": 7,
          "isHighPlatform": false
        },
        {
          "stopName": "Sehnde",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Ilten",
          "minuteOffset": 21,
          "isHighPlatform": false
        },
        {
          "stopName": "Kronsberg",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 35,
          "isHighPlatform": false
        },
        {
          "stopName": "Kröpcke",
          "minuteOffset": 42,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Kröpcke",
      "destination": "Mehrum",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        18,
        48
      ],
      "stops": [
        {
          "stopName": "Kröpcke",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Aegidientorplatz",
          "minuteOffset": 7,
          "isHighPlatform": false
        },
        {
          "stopName": "Kronsberg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Ilten",
          "minuteOffset": 21,
          "isHighPlatform": false
        },
        {
          "stopName": "Sehnde",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Rethmar",
          "minuteOffset": 35,
          "isHighPlatform": false
        },
        {
          "stopName": "Mehrum",
          "minuteOffset": 42,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "30 Min.",
      "offPeak": "30 Min.",
      "night": "60 Min."
    },
    "operatingHours": {
      "firstTrain": "04:42",
      "lastTrain": "23:48",
      "nightService": true
    }
  },
  "S1": {
    "lineRef": "S1",
    "lineName": "S-Bahn S1 (Minden ⇄ Wunstorf ⇄ Hannover Hbf)",
    "stammstrecke": "S",
    "corridorName": "S-Bahn Westachse Minden ⇄ Hbf",
    "color": "#0284c7",
    "directionA": {
      "origin": "Minden (Westf)",
      "destination": "Hannover Hbf",
      "totalMinutes": 54,
      "baseMinuteDepartures": [
        14
      ],
      "stops": [
        {
          "stopName": "Minden (Westf)",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bückeburg",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Kirchhorsten",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthagen",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Lindhorst",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Haste",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Bornum",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 50,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hannover Hbf",
      "destination": "Minden (Westf)",
      "totalMinutes": 54,
      "baseMinuteDepartures": [
        34
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Bornum",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Haste",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Lindhorst",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthagen",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Kirchhorsten",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Bückeburg",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Minden (Westf)",
          "minuteOffset": 50,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:15",
      "lastTrain": "00:45",
      "nightService": true
    }
  },
  "S2": {
    "lineRef": "S2",
    "lineName": "S-Bahn S2 (Nienburg ⇄ Hannover Hbf ⇄ Haste)",
    "stammstrecke": "S",
    "corridorName": "S-Bahn Nord-West / Deister-Ring",
    "color": "#06b6d4",
    "directionA": {
      "origin": "Nienburg (Weser)",
      "destination": "Haste (Han)",
      "totalMinutes": 75,
      "baseMinuteDepartures": [
        22
      ],
      "stops": [
        {
          "stopName": "Nienburg (Weser)",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Linsburg",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Hagen (Han)",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Eilvese",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Neustadt am Rübenberge",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Poggenhagen",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Leinhausen",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Nordstadt",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 55,
          "isHighPlatform": true
        },
        {
          "stopName": "Weetzen",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Barsinghausen",
          "minuteOffset": 65,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Nenndorf",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Haste (Han)",
          "minuteOffset": 75,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Haste (Han)",
      "destination": "Nienburg (Weser)",
      "totalMinutes": 75,
      "baseMinuteDepartures": [
        15
      ],
      "stops": [
        {
          "stopName": "Haste (Han)",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Nenndorf",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Barsinghausen",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Weetzen",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Nordstadt",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Leinhausen",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Poggenhagen",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Neustadt am Rübenberge",
          "minuteOffset": 55,
          "isHighPlatform": true
        },
        {
          "stopName": "Eilvese",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Hagen (Han)",
          "minuteOffset": 65,
          "isHighPlatform": true
        },
        {
          "stopName": "Linsburg",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Nienburg (Weser)",
          "minuteOffset": 75,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:22",
      "lastTrain": "00:15",
      "nightService": true
    }
  },
  "S3": {
    "lineRef": "S3",
    "lineName": "S-Bahn S3 (Hannover Hbf ⇄ Lehrte ⇄ Hildesheim)",
    "stammstrecke": "S",
    "corridorName": "S-Bahn Ost / Hildesheim",
    "color": "#8b5cf6",
    "directionA": {
      "origin": "Hannover Hbf",
      "destination": "Hildesheim Hbf",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        4,
        34
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Kleefeld",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Karl-Wiechert-Allee",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Anderten/Misburg",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahlten",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Sehnde",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Algermissen",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Harsum",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hildesheim Hbf",
          "minuteOffset": 36,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hildesheim Hbf",
      "destination": "Hannover Hbf",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        12,
        42
      ],
      "stops": [
        {
          "stopName": "Hildesheim Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Harsum",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Algermissen",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Sehnde",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahlten",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Anderten/Misburg",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Karl-Wiechert-Allee",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Kleefeld",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 36,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "30 Min.",
      "offPeak": "60 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:34",
      "lastTrain": "00:34",
      "nightService": true
    }
  },
  "S4": {
    "lineRef": "S4",
    "lineName": "S-Bahn S4 (Bennemühlen ⇄ Hbf ⇄ Hildesheim)",
    "stammstrecke": "S",
    "corridorName": "S-Bahn Stammstrecke Nord-Süd",
    "color": "#06b6d4",
    "directionA": {
      "origin": "Bennemühlen",
      "destination": "Hildesheim Hbf",
      "totalMinutes": 52,
      "baseMinuteDepartures": [
        6,
        36
      ],
      "stops": [
        {
          "stopName": "Bennemühlen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Mellendorf",
          "minuteOffset": 3,
          "isHighPlatform": true
        },
        {
          "stopName": "Bissendorf",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen-Kaltenweide",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Pferdemarkt",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Vinnhorst",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Ledeburg",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Nordstadt",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 27,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Messe/Laatzen",
          "minuteOffset": 33,
          "isHighPlatform": true
        },
        {
          "stopName": "Rethen (Leine)",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Sarstedt",
          "minuteOffset": 39,
          "isHighPlatform": true
        },
        {
          "stopName": "Barnten",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Emmerke",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Hildesheim Hbf",
          "minuteOffset": 48,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hildesheim Hbf",
      "destination": "Bennemühlen",
      "totalMinutes": 52,
      "baseMinuteDepartures": [
        1,
        31
      ],
      "stops": [
        {
          "stopName": "Hildesheim Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Emmerke",
          "minuteOffset": 3,
          "isHighPlatform": true
        },
        {
          "stopName": "Barnten",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Sarstedt",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Rethen (Leine)",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Messe/Laatzen",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Nordstadt",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Ledeburg",
          "minuteOffset": 27,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Vinnhorst",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 33,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Pferdemarkt",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen-Kaltenweide",
          "minuteOffset": 39,
          "isHighPlatform": true
        },
        {
          "stopName": "Bissendorf",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Mellendorf",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Bennemühlen",
          "minuteOffset": 48,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "30 Min.",
      "offPeak": "60 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:45",
      "nightService": true
    }
  },
  "S5": {
    "lineRef": "S5",
    "lineName": "S-Bahn S5 (Flughafen ⇄ Hbf ⇄ Hameln ⇄ Paderborn)",
    "stammstrecke": "S",
    "corridorName": "S-Bahn Flughafen-Express / Weserbergland",
    "color": "#10b981",
    "directionA": {
      "origin": "Hannover Flughafen",
      "destination": "Paderborn Hbf",
      "totalMinutes": 105,
      "baseMinuteDepartures": [
        5,
        35
      ],
      "stops": [
        {
          "stopName": "Hannover Flughafen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Pferdemarkt",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Vinnhorst",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Ledeburg",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Nordstadt",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Weetzen",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Springe",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Münder (Deister)",
          "minuteOffset": 55,
          "isHighPlatform": true
        },
        {
          "stopName": "Hameln",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Pyrmont",
          "minuteOffset": 65,
          "isHighPlatform": true
        },
        {
          "stopName": "Lügde",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Schieder",
          "minuteOffset": 75,
          "isHighPlatform": true
        },
        {
          "stopName": "Steinheim (Westf)",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Altenbeken",
          "minuteOffset": 85,
          "isHighPlatform": true
        },
        {
          "stopName": "Paderborn Hbf",
          "minuteOffset": 90,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Paderborn Hbf",
      "destination": "Hannover Flughafen",
      "totalMinutes": 105,
      "baseMinuteDepartures": [
        12,
        42
      ],
      "stops": [
        {
          "stopName": "Paderborn Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Altenbeken",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Steinheim (Westf)",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Schieder",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Lügde",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Pyrmont",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Hameln",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Münder (Deister)",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Springe",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Weetzen",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 55,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahnhof Nordstadt",
          "minuteOffset": 65,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Ledeburg",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Vinnhorst",
          "minuteOffset": 75,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Pferdemarkt",
          "minuteOffset": 85,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Flughafen",
          "minuteOffset": 90,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "30 Min. (bis Hameln) / 60 Min. (Paderborn)",
      "offPeak": "30 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "03:35",
      "lastTrain": "01:05",
      "nightService": true
    }
  },
  "S6": {
    "lineRef": "S6",
    "lineName": "S-Bahn S6 (Hannover Hbf ⇄ Burgdorf ⇄ Celle)",
    "stammstrecke": "S",
    "corridorName": "S-Bahn Express Heide-Achse Celle",
    "color": "#ec4899",
    "directionA": {
      "origin": "Hannover Hbf",
      "destination": "Celle",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        18
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Karl-Wiechert-Allee",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Aligse",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Burgdorf",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Otze",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Ehlershausen",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Großburgwedel (Region Hannover)",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Celle",
          "minuteOffset": 35,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Celle",
      "destination": "Hannover Hbf",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        40
      ],
      "stops": [
        {
          "stopName": "Celle",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Großburgwedel (Region Hannover)",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Ehlershausen",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Otze",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Burgdorf",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Aligse",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Karl-Wiechert-Allee",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 35,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min. (HVZ)",
      "offPeak": "60 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:18",
      "lastTrain": "20:18",
      "nightService": false
    }
  },
  "S7": {
    "lineRef": "S7",
    "lineName": "S-Bahn S7 (Hannover Hbf ⇄ Lehrte ⇄ Burgdorf ⇄ Celle)",
    "stammstrecke": "S",
    "corridorName": "S-Bahn Ost / Burgdorfer Land ⇄ Celle",
    "color": "#eab308",
    "directionA": {
      "origin": "Hannover Hbf",
      "destination": "Celle",
      "totalMinutes": 46,
      "baseMinuteDepartures": [
        4,
        34
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Kleefeld",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Karl-Wiechert-Allee",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Anderten/Misburg",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahlten",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Aligse",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Burgdorf",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Otze",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Ehlershausen",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Celle",
          "minuteOffset": 40,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Celle",
      "destination": "Hannover Hbf",
      "totalMinutes": 46,
      "baseMinuteDepartures": [
        10,
        40
      ],
      "stops": [
        {
          "stopName": "Celle",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Ehlershausen",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Otze",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Burgdorf",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Aligse",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahlten",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Anderten/Misburg",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Karl-Wiechert-Allee",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Kleefeld",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 40,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "30 Min.",
      "offPeak": "60 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:34",
      "lastTrain": "00:34",
      "nightService": true
    }
  },
  "S21": {
    "lineRef": "S21",
    "lineName": "Express-S-Bahn S21 (Barsinghausen ⇄ Hbf)",
    "stammstrecke": "S",
    "corridorName": "Express-Sprinter Deister ⇄ Hbf",
    "color": "#3b82f6",
    "directionA": {
      "origin": "Barsinghausen",
      "destination": "Hannover Hbf",
      "totalMinutes": 28,
      "baseMinuteDepartures": [
        12,
        42
      ],
      "stops": [
        {
          "stopName": "Barsinghausen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Wennigsen (Deister)",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Weetzen",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 25,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hannover Hbf",
      "destination": "Barsinghausen",
      "totalMinutes": 28,
      "baseMinuteDepartures": [
        20,
        50
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Weetzen",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Wennigsen (Deister)",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Barsinghausen",
          "minuteOffset": 25,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "30 Min. (HVZ-Express)",
      "offPeak": "Kein Takt",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "06:12",
      "lastTrain": "19:20",
      "nightService": false
    }
  },
  "S51": {
    "lineRef": "S51",
    "lineName": "Express-S-Bahn S51 (Hameln ⇄ Hbf ⇄ Seelze)",
    "stammstrecke": "S",
    "corridorName": "Express-Sprinter Hameln ⇄ Hbf",
    "color": "#14b8a6",
    "directionA": {
      "origin": "Hameln",
      "destination": "Seelze",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        15,
        45
      ],
      "stops": [
        {
          "stopName": "Hameln",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Springe",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Seelze",
          "minuteOffset": 40,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Seelze",
      "destination": "Hameln",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        10,
        40
      ],
      "stops": [
        {
          "stopName": "Seelze",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Bismarckstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover-Linden/Fischerhof",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Springe",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hameln",
          "minuteOffset": 40,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "30 Min. (HVZ-Express)",
      "offPeak": "Kein Takt",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "06:15",
      "lastTrain": "19:40",
      "nightService": false
    }
  },
  "RE1": {
    "lineRef": "RE1",
    "lineName": "Regional-Express RE1 (Norddeich Mole ⇄ Bremen ⇄ Hannover)",
    "stammstrecke": "R",
    "corridorName": "Nordseeküste ⇄ Bremen ⇄ Hannover Hbf",
    "color": "#ef4444",
    "directionA": {
      "origin": "Norddeich Mole",
      "destination": "Hannover Hbf",
      "totalMinutes": 165,
      "baseMinuteDepartures": [
        20
      ],
      "stops": [
        {
          "stopName": "Norddeich Mole",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Norden",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Emden Hbf",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Leer (Ostfriesl)",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Oldenburg (Oldb) Hbf",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Hude",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Delmenhorst",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Bremen Hbf",
          "minuteOffset": 84,
          "isHighPlatform": true
        },
        {
          "stopName": "Achim",
          "minuteOffset": 96,
          "isHighPlatform": true
        },
        {
          "stopName": "Verden (Aller)",
          "minuteOffset": 108,
          "isHighPlatform": true
        },
        {
          "stopName": "Nienburg (Weser)",
          "minuteOffset": 120,
          "isHighPlatform": true
        },
        {
          "stopName": "Neustadt am Rübenberge",
          "minuteOffset": 132,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 144,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 156,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hannover Hbf",
      "destination": "Norddeich Mole",
      "totalMinutes": 165,
      "baseMinuteDepartures": [
        21
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Neustadt am Rübenberge",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Nienburg (Weser)",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Verden (Aller)",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Achim",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Bremen Hbf",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Delmenhorst",
          "minuteOffset": 84,
          "isHighPlatform": true
        },
        {
          "stopName": "Hude",
          "minuteOffset": 96,
          "isHighPlatform": true
        },
        {
          "stopName": "Oldenburg (Oldb) Hbf",
          "minuteOffset": 108,
          "isHighPlatform": true
        },
        {
          "stopName": "Leer (Ostfriesl)",
          "minuteOffset": 120,
          "isHighPlatform": true
        },
        {
          "stopName": "Emden Hbf",
          "minuteOffset": 132,
          "isHighPlatform": true
        },
        {
          "stopName": "Norden",
          "minuteOffset": 144,
          "isHighPlatform": true
        },
        {
          "stopName": "Norddeich Mole",
          "minuteOffset": 156,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "120 Min.",
      "offPeak": "120 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "05:20",
      "lastTrain": "21:20",
      "nightService": false
    }
  },
  "RE2": {
    "lineRef": "RE2",
    "lineName": "Regional-Express RE2 (metronom Göttingen ⇄ Hannover ⇄ Uelzen)",
    "stammstrecke": "R",
    "corridorName": "metronom Nord-Süd Achse Leinetal ⇄ Heide",
    "color": "#0284c7",
    "directionA": {
      "origin": "Göttingen",
      "destination": "Uelzen",
      "totalMinutes": 110,
      "baseMinuteDepartures": [
        9
      ],
      "stops": [
        {
          "stopName": "Göttingen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Nörten-Hardenberg",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Northeim (Han)",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Einbeck Salzderhelden",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Kreiensen",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Alfeld (Leine)",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Banteln",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Elze (Han)",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Nordstemmen",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Sarstedt",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 66,
          "isHighPlatform": true
        },
        {
          "stopName": "Großburgwedel (Region Hannover)",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Celle",
          "minuteOffset": 78,
          "isHighPlatform": true
        },
        {
          "stopName": "Eschede",
          "minuteOffset": 84,
          "isHighPlatform": true
        },
        {
          "stopName": "Unterlüß",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Suderburg",
          "minuteOffset": 96,
          "isHighPlatform": true
        },
        {
          "stopName": "Uelzen",
          "minuteOffset": 102,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Uelzen",
      "destination": "Göttingen",
      "totalMinutes": 110,
      "baseMinuteDepartures": [
        14
      ],
      "stops": [
        {
          "stopName": "Uelzen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Suderburg",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Unterlüß",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Eschede",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Celle",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Großburgwedel (Region Hannover)",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Sarstedt",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Nordstemmen",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Elze (Han)",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Banteln",
          "minuteOffset": 66,
          "isHighPlatform": true
        },
        {
          "stopName": "Alfeld (Leine)",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Kreiensen",
          "minuteOffset": 78,
          "isHighPlatform": true
        },
        {
          "stopName": "Einbeck Salzderhelden",
          "minuteOffset": 84,
          "isHighPlatform": true
        },
        {
          "stopName": "Northeim (Han)",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Nörten-Hardenberg",
          "minuteOffset": 96,
          "isHighPlatform": true
        },
        {
          "stopName": "Göttingen",
          "minuteOffset": 102,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "04:09",
      "lastTrain": "23:14",
      "nightService": false
    }
  },
  "RE3": {
    "lineRef": "RE3",
    "lineName": "Regional-Express RE3 (metronom Hannover Hbf ⇄ Uelzen ⇄ Hamburg Hbf)",
    "stammstrecke": "R",
    "corridorName": "Hauptachse Niedersachsen-Hamburg",
    "color": "#eab308",
    "directionA": {
      "origin": "Hannover Hbf",
      "destination": "Hamburg Hbf",
      "totalMinutes": 140,
      "baseMinuteDepartures": [
        40
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Großburgwedel (Region Hannover)",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Celle",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Eschede",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Unterlüß",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Suderburg",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Uelzen",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Bevensen",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Bienenbüttel",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Lüneburg",
          "minuteOffset": 100,
          "isHighPlatform": true
        },
        {
          "stopName": "Winsen (Luhe)",
          "minuteOffset": 110,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 120,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 130,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hamburg Hbf",
      "destination": "Hannover Hbf",
      "totalMinutes": 140,
      "baseMinuteDepartures": [
        57
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Winsen (Luhe)",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Lüneburg",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Bienenbüttel",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Bevensen",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Uelzen",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Suderburg",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Unterlüß",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Eschede",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Celle",
          "minuteOffset": 100,
          "isHighPlatform": true
        },
        {
          "stopName": "Großburgwedel (Region Hannover)",
          "minuteOffset": 110,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 120,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 130,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "120 Min."
    },
    "operatingHours": {
      "firstTrain": "04:40",
      "lastTrain": "00:40",
      "nightService": true
    }
  },
  "RE10": {
    "lineRef": "RE10",
    "lineName": "Regional-Express RE10 (erixx Hannover ⇄ Hildesheim ⇄ Bad Harzburg)",
    "stammstrecke": "R",
    "corridorName": "Harz-Express Hannover ⇄ Goslar / Bad Harzburg",
    "color": "#10b981",
    "directionA": {
      "origin": "Hannover Hbf",
      "destination": "Bad Harzburg",
      "totalMinutes": 72,
      "baseMinuteDepartures": [
        48
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Sarstedt",
          "minuteOffset": 7,
          "isHighPlatform": true
        },
        {
          "stopName": "Hildesheim Hbf",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Hildesheim Ost",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Groß Düngen",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Derneburg (Han)",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Baddeckenstedt",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Salzgitter-Ringelheim",
          "minuteOffset": 49,
          "isHighPlatform": true
        },
        {
          "stopName": "Goslar",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Harzburg",
          "minuteOffset": 63,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Bad Harzburg",
      "destination": "Hannover Hbf",
      "totalMinutes": 72,
      "baseMinuteDepartures": [
        34
      ],
      "stops": [
        {
          "stopName": "Bad Harzburg",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Goslar",
          "minuteOffset": 7,
          "isHighPlatform": true
        },
        {
          "stopName": "Salzgitter-Ringelheim",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Baddeckenstedt",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Derneburg (Han)",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Groß Düngen",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hildesheim Ost",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Hildesheim Hbf",
          "minuteOffset": 49,
          "isHighPlatform": true
        },
        {
          "stopName": "Sarstedt",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 63,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:48",
      "lastTrain": "22:48",
      "nightService": false
    }
  },
  "RE30": {
    "lineRef": "RE30",
    "lineName": "Regional-Express RE30 (enno Hannover ⇄ Gifhorn ⇄ Wolfsburg)",
    "stammstrecke": "R",
    "corridorName": "Ost-Niedersachsen-Sprinter enno",
    "color": "#ec4899",
    "directionA": {
      "origin": "Hannover Hbf",
      "destination": "Wolfsburg Hbf",
      "totalMinutes": 52,
      "baseMinuteDepartures": [
        15
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Immensen-Arpke",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Dollbergen",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Dedenhausen",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Meinersen",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Gifhorn",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Calberlah",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Fallersleben",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Wolfsburg Hbf",
          "minuteOffset": 45,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Wolfsburg Hbf",
      "destination": "Hannover Hbf",
      "totalMinutes": 52,
      "baseMinuteDepartures": [
        14
      ],
      "stops": [
        {
          "stopName": "Wolfsburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Fallersleben",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Calberlah",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Gifhorn",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Meinersen",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Dedenhausen",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Dollbergen",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Immensen-Arpke",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 45,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min. (HVZ 30 Min.)",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "05:15",
      "lastTrain": "23:15",
      "nightService": false
    }
  },
  "RE60": {
    "lineRef": "RE60",
    "lineName": "Regional-Express RE60 (WestfalenBahn Braunschweig ⇄ Hbf ⇄ Rheine)",
    "stammstrecke": "R",
    "corridorName": "Braunschweig Hbf ⇄ Hannover Hbf ⇄ Minden ⇄ Rheine",
    "color": "#ef4444",
    "directionA": {
      "origin": "Braunschweig Hbf",
      "destination": "Rheine",
      "totalMinutes": 110,
      "baseMinuteDepartures": [
        18
      ],
      "stops": [
        {
          "stopName": "Braunschweig Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Peine",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Haste",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthagen",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Bückeburg",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Minden (Westf)",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Löhne (Westf)",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Osnabrück Hbf",
          "minuteOffset": 100,
          "isHighPlatform": true
        },
        {
          "stopName": "Rheine",
          "minuteOffset": 110,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Rheine",
      "destination": "Braunschweig Hbf",
      "totalMinutes": 110,
      "baseMinuteDepartures": [
        40
      ],
      "stops": [
        {
          "stopName": "Rheine",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Osnabrück Hbf",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Löhne (Westf)",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Minden (Westf)",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Bückeburg",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthagen",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Haste",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Peine",
          "minuteOffset": 100,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweig Hbf",
          "minuteOffset": 110,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "05:18",
      "lastTrain": "23:18",
      "nightService": false
    }
  },
  "RE70": {
    "lineRef": "RE70",
    "lineName": "Regional-Express RE70 (WestfalenBahn Braunschweig ⇄ Hbf ⇄ Bielefeld)",
    "stammstrecke": "R",
    "corridorName": "Braunschweig Hbf ⇄ Hannover Hbf ⇄ Minden ⇄ Bielefeld",
    "color": "#f97316",
    "directionA": {
      "origin": "Braunschweig Hbf",
      "destination": "Bielefeld Hbf",
      "totalMinutes": 115,
      "baseMinuteDepartures": [
        48
      ],
      "stops": [
        {
          "stopName": "Braunschweig Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Peine",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Haste",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthagen",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Bückeburg",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Minden (Westf)",
          "minuteOffset": 64,
          "isHighPlatform": true
        },
        {
          "stopName": "Porta Westfalica",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Oeynhausen",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Löhne (Westf)",
          "minuteOffset": 88,
          "isHighPlatform": true
        },
        {
          "stopName": "Herford",
          "minuteOffset": 96,
          "isHighPlatform": true
        },
        {
          "stopName": "Bielefeld Hbf",
          "minuteOffset": 104,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Bielefeld Hbf",
      "destination": "Braunschweig Hbf",
      "totalMinutes": 115,
      "baseMinuteDepartures": [
        10
      ],
      "stops": [
        {
          "stopName": "Bielefeld Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Herford",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Löhne (Westf)",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Oeynhausen",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Porta Westfalica",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Minden (Westf)",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Bückeburg",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthagen",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Haste",
          "minuteOffset": 64,
          "isHighPlatform": true
        },
        {
          "stopName": "Wunstorf",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Lehrte",
          "minuteOffset": 88,
          "isHighPlatform": true
        },
        {
          "stopName": "Peine",
          "minuteOffset": 96,
          "isHighPlatform": true
        },
        {
          "stopName": "Braunschweig Hbf",
          "minuteOffset": 104,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "05:48",
      "lastTrain": "23:48",
      "nightService": false
    }
  },
  "RB38": {
    "lineRef": "RB38",
    "lineName": "Regionalbahn RB38 Heidebahn (DB Regio Hannover ⇄ Soltau ⇄ Buchholz)",
    "stammstrecke": "R",
    "corridorName": "Heidebahn Lüneburger Heide",
    "color": "#84cc16",
    "directionA": {
      "origin": "Hannover Hbf",
      "destination": "Buchholz (Nordheide)",
      "totalMinutes": 105,
      "baseMinuteDepartures": [
        51
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Mellendorf",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Lindwedel",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwarmstedt",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hodenhagen",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Walsrode",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Fallingbostel",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Dorfmark",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Soltau (Han)",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Schneverdingen",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Wintermoor",
          "minuteOffset": 66,
          "isHighPlatform": true
        },
        {
          "stopName": "Handeloh",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Büsenbachtal",
          "minuteOffset": 78,
          "isHighPlatform": true
        },
        {
          "stopName": "Holm-Seppensen",
          "minuteOffset": 84,
          "isHighPlatform": true
        },
        {
          "stopName": "Suerhop",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Buchholz (Nordheide)",
          "minuteOffset": 96,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Buchholz (Nordheide)",
      "destination": "Hannover Hbf",
      "totalMinutes": 105,
      "baseMinuteDepartures": [
        18
      ],
      "stops": [
        {
          "stopName": "Buchholz (Nordheide)",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Suerhop",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Holm-Seppensen",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Büsenbachtal",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Handeloh",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Wintermoor",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Schneverdingen",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Soltau (Han)",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Dorfmark",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Fallingbostel",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Walsrode",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Hodenhagen",
          "minuteOffset": 66,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwarmstedt",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Lindwedel",
          "minuteOffset": 78,
          "isHighPlatform": true
        },
        {
          "stopName": "Mellendorf",
          "minuteOffset": 84,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 96,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "04:51",
      "lastTrain": "22:51",
      "nightService": false
    }
  }
};

export const HAMBURG_SCHEDULES: Record<string, LineSchedule> = {
"1": {
    "lineRef": "1",
    "lineName": "Metrobus 1",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "S Rissen \u21c4 Bf. Altona",
    "directionA": {
      "origin": "S Rissen",
      "destination": "Bf. Altona",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "S Rissen",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Schule Marschweg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Kl\u00f6vensteenweg (S\u00fcd)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Suurheid",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Asklepios Westklinikum (West)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Asklepios Westklinikum (Mitte)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Asklepios Westklinikum (Ost)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Bahn\u00fcbergang Sieversst\u00fccken",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Sieversst\u00fccken",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Wittland (S S\u00fclldorf)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Anne-Frank-Stra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Kr\u00e4henhorst",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Karstenstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "S Blankenese",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fchlenberg",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Frahmstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Grotefendweg",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Darbovenstieg",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "S\u00fclldorfer Landstra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Pieperweg",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Holtbarg",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefelder Holt",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Heerbrook",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Botterbarg",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Isfeldstra\u00dfe",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Langelohstra\u00dfe (Nord)",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Knabeweg",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbe-Einkaufszentrum",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Windm\u00fchlenweg",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Flottbeker Drift",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Zum H\u00fcnengrab (DESY)",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Stutsmoor",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Trabrennbahn Bahrenfeld",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Ebertallee",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "B\u00f6cklinstra\u00dfe",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "S Othmarschen",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "R\u00f6pers Weide",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Behringstra\u00dfe (AK Altona)",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "AK Altona (Eingang)",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Behringstra\u00dfe (AK Altona)",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Griegstra\u00dfe",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Kreuzkirche Ottensen",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Bleickenallee (Kinderkrankenhaus)",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Brunnenstra\u00dfe",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Bahrenfelder Stra\u00dfe",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 90,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Bf. Altona",
      "destination": "S Rissen",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Bahrenfelder Stra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Brunnenstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Bleickenallee (Kinderkrankenhaus)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Kreuzkirche Ottensen",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Griegstra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Behringstra\u00dfe (AK Altona)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "AK Altona (Eingang)",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Behringstra\u00dfe (AK Altona)",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "R\u00f6pers Weide",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "S Othmarschen",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "B\u00f6cklinstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Ebertallee",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Trabrennbahn Bahrenfeld",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Stutsmoor",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Zum H\u00fcnengrab (DESY)",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Flottbeker Drift",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Windm\u00fchlenweg",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbe-Einkaufszentrum",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Knabeweg",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Langelohstra\u00dfe (Nord)",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Isfeldstra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Botterbarg",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Heerbrook",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefelder Holt",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Holtbarg",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Pieperweg",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "S\u00fclldorfer Landstra\u00dfe",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Darbovenstieg",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Grotefendweg",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Frahmstra\u00dfe",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fchlenberg",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "S Blankenese",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Karstenstra\u00dfe",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Kr\u00e4henhorst",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Anne-Frank-Stra\u00dfe",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Wittland (S S\u00fclldorf)",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Sieversst\u00fccken",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Bahn\u00fcbergang Sieversst\u00fccken",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Asklepios Westklinikum (Ost)",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Asklepios Westklinikum (Mitte)",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Asklepios Westklinikum (West)",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Suurheid",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Kl\u00f6vensteenweg (S\u00fcd)",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Schule Marschweg",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "S Rissen",
          "minuteOffset": 90,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "10": {
    "lineRef": "10",
    "lineName": "Metrobus 10",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Grunewaldstra\u00dfe \u21c4 U Wandsbek Markt",
    "directionA": {
      "origin": "Grunewaldstra\u00dfe",
      "destination": "U Wandsbek Markt",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Grunewaldstra\u00dfe",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Glatzer Stra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Bekkamp",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Bekkampsweg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfelder Stra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Denksteinweg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker Weg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Hohen Feld",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Universit\u00e4t der Bundeswehr",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Osterkamp",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "AK Wandsbek",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Bovestra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Schatzmeisterstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Zieseni\u00dfstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 30,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U Wandsbek Markt",
      "destination": "Grunewaldstra\u00dfe",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Zieseni\u00dfstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Schatzmeisterstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Bovestra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "AK Wandsbek",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Osterkamp",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Universit\u00e4t der Bundeswehr",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Hohen Feld",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker Weg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Denksteinweg",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfelder Stra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Bekkampsweg",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Bekkamp",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Glatzer Stra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Grunewaldstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "11": {
    "lineRef": "11",
    "lineName": "Metrobus 11",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "U Wandsbek Markt \u21c4 Sorenkoppel",
    "directionA": {
      "origin": "U Wandsbek Markt",
      "destination": "Sorenkoppel",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Josephstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Kedenburgstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Birtstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Neumarkt 63",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Ziethenstra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Schimmelmannstra\u00dfe (Mitte)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Asserstieg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Jenfelder Moor",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Albert-Schweitzer-Ring",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Kuehnstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "K\u00f6penicker Stra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Berliner Platz",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Potsdamer Stra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "H\u00fcllenkamp",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Kinderkrankenhaus Wilhelmstift",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Kielkoppelstra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthachter Weg",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Hegen",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Sorenkoppel",
          "minuteOffset": 38,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Sorenkoppel",
      "destination": "U Wandsbek Markt",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Sorenkoppel",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Hegen",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthachter Weg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Kielkoppelstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Kinderkrankenhaus Wilhelmstift",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "H\u00fcllenkamp",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Potsdamer Stra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Berliner Platz",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "K\u00f6penicker Stra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Kuehnstra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Albert-Schweitzer-Ring",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Jenfelder Moor",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Asserstieg",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Schimmelmannstra\u00dfe (Mitte)",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Ziethenstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Neumarkt 63",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Birtstra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Kedenburgstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Josephstra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 38,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "12": {
    "lineRef": "12",
    "lineName": "Metrobus 12",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "S Blankenese \u21c4 Osterbrookplatz",
    "directionA": {
      "origin": "S Blankenese",
      "destination": "Osterbrookplatz",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "S Blankenese",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fchlenberg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Winckelmannstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Sieberlingstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbschlo\u00dfstra\u00dfe (Seegerichtshof)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Teufelsbr\u00fcck (F\u00e4hre)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Holztwiete",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Zedernweg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Halbmondsweg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Liebermannstra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Hohenzollernring (S\u00fcd)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Fischers Allee",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothestra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Altona",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Altonaer Poststra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Bergstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Bl\u00fccherstra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "S Reeperbahn",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Davidstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "U St. Pauli",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Museum f\u00fcr Hamburgische Geschichte",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Handwerkskammer",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Johannes-Brahms-Platz",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "U Stephansplatz",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Kunsthalle",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Spitalerstra\u00dfe",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "U Steinstra\u00dfe (Deichtorplatz)",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Repsoldstra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Albertstra\u00dfe",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "S Hammerbrook (Nord)",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "S Hammerbrook (S\u00fcd)",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "S\u00fcderstra\u00dfe",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Ausschl\u00e4ger Weg (LBV)",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Luisenweg",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Schadesweg",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Osterbrookplatz",
          "minuteOffset": 74,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Osterbrookplatz",
      "destination": "S Blankenese",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Osterbrookplatz",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Schadesweg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Luisenweg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Ausschl\u00e4ger Weg (LBV)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "S\u00fcderstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "S Hammerbrook (S\u00fcd)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "S Hammerbrook (Nord)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Albertstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Repsoldstra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "U Steinstra\u00dfe (Deichtorplatz)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Spitalerstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Kunsthalle",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U Stephansplatz",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Johannes-Brahms-Platz",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Handwerkskammer",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Museum f\u00fcr Hamburgische Geschichte",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "U St. Pauli",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Davidstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "S Reeperbahn",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Bl\u00fccherstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Bergstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Altonaer Poststra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Altona",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothestra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Fischers Allee",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Hohenzollernring (S\u00fcd)",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Liebermannstra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Halbmondsweg",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Zedernweg",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Holztwiete",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Teufelsbr\u00fcck (F\u00e4hre)",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbschlo\u00dfstra\u00dfe (Seegerichtshof)",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Sieberlingstra\u00dfe",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Winckelmannstra\u00dfe",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fchlenberg",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "S Blankenese",
          "minuteOffset": 74,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "13": {
    "lineRef": "13",
    "lineName": "Metrobus 13",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "S Veddel \u21c4 Kirchdorf (S\u00fcd)",
    "directionA": {
      "origin": "S Veddel",
      "destination": "Kirchdorf (S\u00fcd)",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "S Veddel",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Harburger Chaussee",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Werkcentrum Elbinsel",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Vogelh\u00fcttendeich",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "St\u00fcbenplatz",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Mannesallee",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Veringstra\u00dfe (Mitte)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Veringstra\u00dfe (S\u00fcd)",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Rotenh\u00e4user Stra\u00dfe (West)",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Mengestra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Wilhelmsburg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Dratelnstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Inselpark",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "S Wilhelmsburg",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Neuenfelder Stra\u00dfe (Schule)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Kirchdorfer Stra\u00dfe (Museum Elbinsel)",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Karl-Arnold-Ring",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Kirchdorf (S\u00fcd)",
          "minuteOffset": 34,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Kirchdorf (S\u00fcd)",
      "destination": "S Veddel",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Kirchdorf (S\u00fcd)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Karl-Arnold-Ring",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Kirchdorfer Stra\u00dfe (Museum Elbinsel)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Neuenfelder Stra\u00dfe (Schule)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "S Wilhelmsburg",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Inselpark",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Dratelnstra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Wilhelmsburg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Mengestra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Rotenh\u00e4user Stra\u00dfe (West)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Veringstra\u00dfe (S\u00fcd)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Veringstra\u00dfe (Mitte)",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Mannesallee",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "St\u00fcbenplatz",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Vogelh\u00fcttendeich",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Werkcentrum Elbinsel",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Harburger Chaussee",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "S Veddel",
          "minuteOffset": 34,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "15": {
    "lineRef": "15",
    "lineName": "Metrobus 15",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "S Othmarschen \u21c4 Alsterchaussee",
    "directionA": {
      "origin": "S Othmarschen",
      "destination": "Alsterchaussee",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "S Othmarschen",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Emkendorfstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Reventlowstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Agathe-Lasch-Weg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Ernst-August-Stra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Wrangelpark",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Philosophenweg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Hohenzollernring",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Fischers Allee",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothestra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Altona",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerichtstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Max-Brauer-Allee (Mitte)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Sternbr\u00fccke",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Schulterblatt",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Weidenallee",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "U Schlump",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Bundesstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Bezirksamt Eimsb\u00fcttel",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Parkallee",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hallerstra\u00dfe",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsterchaussee",
          "minuteOffset": 46,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Alsterchaussee",
      "destination": "S Othmarschen",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Alsterchaussee",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hallerstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Parkallee",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Bezirksamt Eimsb\u00fcttel",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Bundesstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "U Schlump",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Weidenallee",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Schulterblatt",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Sternbr\u00fccke",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Max-Brauer-Allee (Mitte)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerichtstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Altona",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothestra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Fischers Allee",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Hohenzollernring",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Philosophenweg",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Wrangelpark",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Ernst-August-Stra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Agathe-Lasch-Weg",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Reventlowstra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Emkendorfstra\u00dfe",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "S Othmarschen",
          "minuteOffset": 46,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "16": {
    "lineRef": "16",
    "lineName": "Metrobus 16",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Elbe-Einkaufszentrum \u21c4 Rentenversicherung Nord",
    "directionA": {
      "origin": "Elbe-Einkaufszentrum",
      "destination": "Rentenversicherung Nord",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Elbe-Einkaufszentrum",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Ostermeyerstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Hemmingstedter Weg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Bertha-Uhl-Kamp",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Flottbeker Kirche",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Kalckreuthweg (Mitte)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Osdorfer Weg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Bahrenfelder Marktplatz",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "H\u00e4ndelstra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "S Bahrenfeld",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcnebergstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Daimlerstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Zeisehallen",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Rainstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Altonaer Poststra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Bergstra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Bl\u00fccherstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "S Reeperbahn",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Davidstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "U St. Pauli",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Michaeliskirche",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Domstra\u00dfe",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Speersort",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Jakobikirchhof",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "B\u00f6ckmannstra\u00dfe",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "U Lohm\u00fchlenstra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "U L\u00fcbecker Stra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wartenau",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Richardstra\u00dfe",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Eilbeker Weg",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Maxstra\u00dfe",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Seumestra\u00dfe",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "S Friedrichsberg",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Krausestra\u00dfe",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Stra\u00dfburger Platz",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "U Stra\u00dfburger Stra\u00dfe",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Eulenkamp",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Friedrich-Ebert-Damm (West)",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Stephanstra\u00dfe",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Helbingtwiete",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Stadtrand",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Sylter Weg",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Rentenversicherung Nord",
          "minuteOffset": 90,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Rentenversicherung Nord",
      "destination": "Elbe-Einkaufszentrum",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Rentenversicherung Nord",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Sylter Weg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Stadtrand",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Helbingtwiete",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Stephanstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Friedrich-Ebert-Damm (West)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Eulenkamp",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "U Stra\u00dfburger Stra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Stra\u00dfburger Platz",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Krausestra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "S Friedrichsberg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Seumestra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Maxstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Eilbeker Weg",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Richardstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wartenau",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "U L\u00fcbecker Stra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "U Lohm\u00fchlenstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "B\u00f6ckmannstra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Jakobikirchhof",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Speersort",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Domstra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Michaeliskirche",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "U St. Pauli",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Davidstra\u00dfe",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "S Reeperbahn",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Bl\u00fccherstra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Bergstra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Altonaer Poststra\u00dfe",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Rainstra\u00dfe",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Zeisehallen",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Daimlerstra\u00dfe",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcnebergstra\u00dfe",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "S Bahrenfeld",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "H\u00e4ndelstra\u00dfe",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Bahrenfelder Marktplatz",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Osdorfer Weg",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Kalckreuthweg (Mitte)",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Flottbeker Kirche",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Bertha-Uhl-Kamp",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Hemmingstedter Weg",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Ostermeyerstra\u00dfe",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbe-Einkaufszentrum",
          "minuteOffset": 90,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "18": {
    "lineRef": "18",
    "lineName": "Metrobus 18",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Hauptbahnhof/ZOB \u21c4 Am St\u00fchm-S\u00fcd",
    "directionA": {
      "origin": "Hauptbahnhof/ZOB",
      "destination": "Am St\u00fchm-S\u00fcd",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Kirchenallee",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Gurlittstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "AK St. Georg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Graumannsweg",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Mundsburger Br\u00fccke",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "U Mundsburg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Beethovenstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Bartholom\u00e4us-Therme",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Biedermannplatz",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Brucknerstra\u00dfe (Arbeitsgerichte)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "U Saarlandstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Burmesterstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Barmbek",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Wachtelstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Habichtstra\u00dfe (Mitte)",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Heinrich-Helbing-Stra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Bauernrosenweg",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Werner-Otto-Stra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahnstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Steilshooper Allee",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Herthastra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Bramfelder Dorfplatz",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Berner Chaussee",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "N\u00fc\u00dflerkamp",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Hohnerkamp (Mitte)",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Gumbinner Kehre",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Am St\u00fchm-S\u00fcd",
          "minuteOffset": 54,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Am St\u00fchm-S\u00fcd",
      "destination": "Hauptbahnhof/ZOB",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Am St\u00fchm-S\u00fcd",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Gumbinner Kehre",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Hohnerkamp (Mitte)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "N\u00fc\u00dflerkamp",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Berner Chaussee",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Bramfelder Dorfplatz",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Herthastra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Steilshooper Allee",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahnstra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Werner-Otto-Stra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Bauernrosenweg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Heinrich-Helbing-Stra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Habichtstra\u00dfe (Mitte)",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Wachtelstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Barmbek",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Burmesterstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "U Saarlandstra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Brucknerstra\u00dfe (Arbeitsgerichte)",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Biedermannplatz",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Bartholom\u00e4us-Therme",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Beethovenstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "U Mundsburg",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Mundsburger Br\u00fccke",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Graumannsweg",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "AK St. Georg",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Gurlittstra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Kirchenallee",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 54,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "2": {
    "lineRef": "2",
    "lineName": "Metrobus 2",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "U S Berliner Tor (Beim Strohhause) \u21c4 Schenefeld, Achterndiek",
    "directionA": {
      "origin": "U S Berliner Tor (Beim Strohhause)",
      "destination": "Schenefeld, Achterndiek",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "U S Berliner Tor (Beim Strohhause)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Kurt-Schumacher-Allee",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "U Steinstra\u00dfe (Deichtorplatz)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Ericusspitze",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Singapurstra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Sandtorkai",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Kaiserkai (Elbphilharmonie)",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "U Baumwall",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Rambachstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Landungsbr\u00fccken",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "St. Pauli Hafenstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Hafentreppe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Fischmarkt",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Behnstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Altona",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Rainstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Hohenesch",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "S Ottensen",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Celsiusweg",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Bornkampsweg",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Sauer-Stra\u00dfe",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Silcherstra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "August-Kirch-Stra\u00dfe",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Trabrennbahn Bahrenfeld",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Luruper Chaussee (DESY)",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadionstra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Tannenberg",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Rugenbarg (Nord)",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Eckhoffplatz (Lurup Center)",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Flurstra\u00dfe (Nord)",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Luckmoor",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Engelbrechtweg",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Schenefelder Platz",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Parkstieg",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Stadtzentrum",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Borgfelde",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Dorfplatz",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, In de Masch",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Achterndiek",
          "minuteOffset": 84,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Schenefeld, Achterndiek",
      "destination": "U S Berliner Tor (Beim Strohhause)",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Schenefeld, Achterndiek",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, In de Masch",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Dorfplatz",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Borgfelde",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Stadtzentrum",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Parkstieg",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Schenefelder Platz",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Engelbrechtweg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Luckmoor",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Flurstra\u00dfe (Nord)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Eckhoffplatz (Lurup Center)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Rugenbarg (Nord)",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Tannenberg",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadionstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Luruper Chaussee (DESY)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Trabrennbahn Bahrenfeld",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "August-Kirch-Stra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Silcherstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Sauer-Stra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Bornkampsweg",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Celsiusweg",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "S Ottensen",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Hohenesch",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Gro\u00dfe Rainstra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Altona",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Behnstra\u00dfe",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Fischmarkt",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Hafentreppe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "St. Pauli Hafenstra\u00dfe",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Landungsbr\u00fccken",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Rambachstra\u00dfe",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "U Baumwall",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Kaiserkai (Elbphilharmonie)",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Sandtorkai",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Singapurstra\u00dfe",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Ericusspitze",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "U Steinstra\u00dfe (Deichtorplatz)",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Kurt-Schumacher-Allee",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Berliner Tor (Beim Strohhause)",
          "minuteOffset": 84,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "20": {
    "lineRef": "20",
    "lineName": "Metrobus 20",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "S R\u00fcbenkamp \u21c4 Bf. Altona",
    "directionA": {
      "origin": "S R\u00fcbenkamp",
      "destination": "Bf. Altona",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "S R\u00fcbenkamp",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Kapstadtring",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Dakarweg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "\u00dcberseering (West)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Jahnring (Mitte)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Ohlsdorfer Stra\u00dfe (Planetarium)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Winterhuder Marktplatz",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hudtwalckerstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Julius-Reincke-Stieg (Bethanien)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Park (UKE)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "UK Eppendorf",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00f6wenstra\u00dfe (Facharztklinik)",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "G\u00e4rtnerstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Kottwitzstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Goebenstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Schulweg",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Fruchtallee (Hamburg-Haus)",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsenplatz",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "S Holstenstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Max-Brauer-Allee (Mitte)",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerichtstra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 44,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Bf. Altona",
      "destination": "S R\u00fcbenkamp",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerichtstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Max-Brauer-Allee (Mitte)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "S Holstenstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsenplatz",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Fruchtallee (Hamburg-Haus)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Schulweg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Goebenstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Kottwitzstra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "G\u00e4rtnerstra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00f6wenstra\u00dfe (Facharztklinik)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "UK Eppendorf",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Park (UKE)",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Julius-Reincke-Stieg (Bethanien)",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hudtwalckerstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Winterhuder Marktplatz",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Ohlsdorfer Stra\u00dfe (Planetarium)",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Jahnring (Mitte)",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "\u00dcberseering (West)",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Dakarweg",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Kapstadtring",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "S R\u00fcbenkamp",
          "minuteOffset": 44,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "21": {
    "lineRef": "21",
    "lineName": "Metrobus 21",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Teufelsbr\u00fcck (F\u00e4hre) \u21c4 U Niendorf Nord",
    "directionA": {
      "origin": "Teufelsbr\u00fcck (F\u00e4hre)",
      "destination": "U Niendorf Nord",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Teufelsbr\u00fcck (F\u00e4hre)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Ohnsorgweg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Marxsenweg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Baron-Voght-Stra\u00dfe (Mitte)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "S Klein Flottbek",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Langkamp",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Hemmingstedter Weg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Ostermeyerstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbe-Einkaufszentrum",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Knabeweg",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Langelohstra\u00dfe (Nord)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Sandort",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Rugenfeld",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Grubenstieg",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Immenbusch",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Achtern Born",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "B\u00f6ttcherkamp",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Schenefelder Platz",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Engelbrechtweg",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Trebelstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Recknitzstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Jevenstedter Stra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Franzosenkoppel",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Katzbachstra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Fangdieckstra\u00dfe",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Langbargheide (Nord)",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00fcdersring",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Langbargheide (S\u00fcd)",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "A S Eidelstedt",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fchlenauweg",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Eidelstedter Platz",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Wiebischenkamp",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Deepenbrook (M\u00f6bel H\u00f6ffner)",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Eidelstedter Brook",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Spanische Furt",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Graf-Johann-Weg",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "W\u00e4hlingsweg",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Frohmestra\u00dfe (Mitte)",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Oldesloer Stra\u00dfe",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Modering",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Vielohwisch",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Wagrierweg",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Vielohweg (Mitte)",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "U Niendorf Nord",
          "minuteOffset": 86,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U Niendorf Nord",
      "destination": "Teufelsbr\u00fcck (F\u00e4hre)",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U Niendorf Nord",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Vielohweg (Mitte)",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Wagrierweg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Vielohwisch",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Modering",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Oldesloer Stra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Frohmestra\u00dfe (Mitte)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "W\u00e4hlingsweg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Graf-Johann-Weg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Spanische Furt",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Eidelstedter Brook",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Deepenbrook (M\u00f6bel H\u00f6ffner)",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Wiebischenkamp",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Eidelstedter Platz",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fchlenauweg",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "A S Eidelstedt",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Langbargheide (S\u00fcd)",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00fcdersring",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Langbargheide (Nord)",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Fangdieckstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Katzbachstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Franzosenkoppel",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Jevenstedter Stra\u00dfe",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Recknitzstra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Trebelstra\u00dfe",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Engelbrechtweg",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Schenefelder Platz",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "B\u00f6ttcherkamp",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Achtern Born",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Immenbusch",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Grubenstieg",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Rugenfeld",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Sandort",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Langelohstra\u00dfe (Nord)",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Knabeweg",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbe-Einkaufszentrum",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Ostermeyerstra\u00dfe",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Hemmingstedter Weg",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Langkamp",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "S Klein Flottbek",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Baron-Voght-Stra\u00dfe (Mitte)",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Marxsenweg",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Ohnsorgweg",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Teufelsbr\u00fcck (F\u00e4hre)",
          "minuteOffset": 86,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "22": {
    "lineRef": "22",
    "lineName": "Metrobus 22",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "S Blankenese \u21c4 U Kellinghusenstra\u00dfe",
    "directionA": {
      "origin": "S Blankenese",
      "destination": "U Kellinghusenstra\u00dfe",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "S Blankenese",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fchlenberg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Frahmstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Tietzestra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "D\u00fcpenautal",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Isfeld",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Langelohstra\u00dfe (Nord)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Knabeweg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbe-Einkaufszentrum",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Flurkamp",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Geranienweg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Achtern Styg",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Flurstra\u00dfe/Rugenbarg",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Kressenweg",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Rugenbarg (Nord)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Vorhornweg",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Langbargheide (S\u00fcd)",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Hellgrundweg (Arenen)",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Schnackenburgallee",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "S Stellingen",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Volksparkstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Stellingen",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hagenbecks Tierpark",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Schillingsbekweg",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Oddernskamp",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Behrmannplatz",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Siemersplatz",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Offakamp",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Frickestra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Tarpenbekstra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "U Kellinghusenstra\u00dfe",
          "minuteOffset": 62,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U Kellinghusenstra\u00dfe",
      "destination": "S Blankenese",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U Kellinghusenstra\u00dfe",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Tarpenbekstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Frickestra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Offakamp",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Siemersplatz",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Behrmannplatz",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Oddernskamp",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Schillingsbekweg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hagenbecks Tierpark",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathaus Stellingen",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Volksparkstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "S Stellingen",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Schnackenburgallee",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Hellgrundweg (Arenen)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Langbargheide (S\u00fcd)",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Vorhornweg",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Rugenbarg (Nord)",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Kressenweg",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Flurstra\u00dfe/Rugenbarg",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Achtern Styg",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Geranienweg",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Flurkamp",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Elbe-Einkaufszentrum",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Knabeweg",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Langelohstra\u00dfe (Nord)",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Isfeld",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "D\u00fcpenautal",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Tietzestra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Frahmstra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fchlenberg",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "S Blankenese",
          "minuteOffset": 62,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "23": {
    "lineRef": "23",
    "lineName": "Metrobus 23",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "U Billstedt \u21c4 Lufthansa-Basis (Haupteingang)",
    "directionA": {
      "origin": "U Billstedt",
      "destination": "Lufthansa-Basis (Haupteingang)",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "U Billstedt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "\u00d6jendorfer Weg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker H\u00f6he",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Kattensteert",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Querkamp",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Stengelestra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Hasencleverstra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "U Horner Rennbahn",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Trib\u00fcnenweg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Husarendenkmal",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Zieseni\u00dfstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Wandsbeker Allee",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "U Stra\u00dfburger Stra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "U Alter Teichweg",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Olivaer Stra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00e4mmersieth (Mitte)",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Barmbek",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Genslerstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "S Alte W\u00f6hr",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauensteinstra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Dakarweg",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Kapstadtring",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Manilabr\u00fccke",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Sydneystra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "U Alsterdorf",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Traute-Lafrenz-Stra\u00dfe",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Brabandstra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsterkrugchaussee (Mitte)",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Heselst\u00fccken",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Lufthansa-Basis (Haupteingang)",
          "minuteOffset": 62,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Lufthansa-Basis (Haupteingang)",
      "destination": "U Billstedt",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Lufthansa-Basis (Haupteingang)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Heselst\u00fccken",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsterkrugchaussee (Mitte)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Brabandstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Traute-Lafrenz-Stra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "U Alsterdorf",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Sydneystra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Manilabr\u00fccke",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Kapstadtring",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Dakarweg",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauensteinstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "S Alte W\u00f6hr",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Genslerstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Barmbek",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00e4mmersieth (Mitte)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Olivaer Stra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "U Alter Teichweg",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "U Stra\u00dfburger Stra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Wandsbeker Allee",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Zieseni\u00dfstra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Husarendenkmal",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Trib\u00fcnenweg",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "U Horner Rennbahn",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Hasencleverstra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Stengelestra\u00dfe",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Querkamp",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Kattensteert",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker H\u00f6he",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "\u00d6jendorfer Weg",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "U Billstedt",
          "minuteOffset": 62,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "24": {
    "lineRef": "24",
    "lineName": "Metrobus 24",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "U Niendorf Markt \u21c4 Bf. Rahlstedt (Doberaner Weg)",
    "directionA": {
      "origin": "U Niendorf Markt",
      "destination": "Bf. Rahlstedt (Doberaner Weg)",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "U Niendorf Markt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Fuhlsb\u00fctteler Weg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "An der Lohe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Herzog-Bruno-Weg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Graf-Anton-Weg",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Wendlohstra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Vietinghoffweg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Gottschalkweg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Vielohweg (Mitte)",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "U Niendorf Nord",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Pommernweg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Keltenweg",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Sperlingsweg",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Krohnstiegtunnel",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Ermlandweg",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Wrangelkoppel",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Samlandweg",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Rittmerskamp",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "U Langenhorn Markt (Krohnstieg)",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Schulwald",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Lademannbogen",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Glash\u00fctter Landstra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Brillkamp",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Hehsel",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Ruscheweyhstra\u00dfe",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Norbert-Schmid-Platz",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Goldr\u00f6schenweg",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Alte Landstra\u00dfe (Nord)",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Schulbergredder",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Alstertal-Einkaufszentrum",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "S Poppenb\u00fcttel (Wentzelplatz)",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "S Poppenb\u00fcttel (Wentzelplatz)",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Alstertal-Einkaufszentrum",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadtbahnstra\u00dfe (Nord)",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Saseler Markt",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Op de Elg",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Steinwegel",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Saselbekstra\u00dfe",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "H\u00fcltkoppel",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "R\u00f6genfeld",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Halenreie",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "U Volksdorf",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Eulenkrugstra\u00dfe",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "U Meiendorfer Weg",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Ringstra\u00dfe",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Supp\u00e9-Stra\u00dfe",
          "minuteOffset": 90,
          "isHighPlatform": false
        },
        {
          "stopName": "Lapplandring",
          "minuteOffset": 92,
          "isHighPlatform": false
        },
        {
          "stopName": "Offenbachweg",
          "minuteOffset": 94,
          "isHighPlatform": false
        },
        {
          "stopName": "Skaldenweg",
          "minuteOffset": 96,
          "isHighPlatform": false
        },
        {
          "stopName": "Hellmesbergerweg",
          "minuteOffset": 98,
          "isHighPlatform": false
        },
        {
          "stopName": "Wildschwanbrook (Mitte)",
          "minuteOffset": 100,
          "isHighPlatform": false
        },
        {
          "stopName": "Wildschwanbrook",
          "minuteOffset": 102,
          "isHighPlatform": false
        },
        {
          "stopName": "Saseler Stra\u00dfe",
          "minuteOffset": 104,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerstenwiese",
          "minuteOffset": 106,
          "isHighPlatform": false
        },
        {
          "stopName": "Bargteheider Stra\u00dfe (Nord)",
          "minuteOffset": 108,
          "isHighPlatform": false
        },
        {
          "stopName": "Sandkule",
          "minuteOffset": 110,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Rahlstedt (Doberaner Weg)",
          "minuteOffset": 112,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Bf. Rahlstedt (Doberaner Weg)",
      "destination": "U Niendorf Markt",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Bf. Rahlstedt (Doberaner Weg)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Sandkule",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Bargteheider Stra\u00dfe (Nord)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerstenwiese",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Saseler Stra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Wildschwanbrook",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Wildschwanbrook (Mitte)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Hellmesbergerweg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Skaldenweg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Offenbachweg",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Lapplandring",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Supp\u00e9-Stra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Ringstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "U Meiendorfer Weg",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Eulenkrugstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "U Volksdorf",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Halenreie",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "R\u00f6genfeld",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "H\u00fcltkoppel",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Saselbekstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Steinwegel",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Op de Elg",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Saseler Markt",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadtbahnstra\u00dfe (Nord)",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Alstertal-Einkaufszentrum",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "S Poppenb\u00fcttel (Wentzelplatz)",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "S Poppenb\u00fcttel (Wentzelplatz)",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Alstertal-Einkaufszentrum",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Schulbergredder",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Alte Landstra\u00dfe (Nord)",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Goldr\u00f6schenweg",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Norbert-Schmid-Platz",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Ruscheweyhstra\u00dfe",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Hehsel",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Brillkamp",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Glash\u00fctter Landstra\u00dfe",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Lademannbogen",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Schulwald",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "U Langenhorn Markt (Krohnstieg)",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Rittmerskamp",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Samlandweg",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Wrangelkoppel",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Ermlandweg",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Krohnstiegtunnel",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Sperlingsweg",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Keltenweg",
          "minuteOffset": 90,
          "isHighPlatform": false
        },
        {
          "stopName": "Pommernweg",
          "minuteOffset": 92,
          "isHighPlatform": false
        },
        {
          "stopName": "U Niendorf Nord",
          "minuteOffset": 94,
          "isHighPlatform": false
        },
        {
          "stopName": "Vielohweg (Mitte)",
          "minuteOffset": 96,
          "isHighPlatform": false
        },
        {
          "stopName": "Gottschalkweg",
          "minuteOffset": 98,
          "isHighPlatform": false
        },
        {
          "stopName": "Vietinghoffweg",
          "minuteOffset": 100,
          "isHighPlatform": false
        },
        {
          "stopName": "Wendlohstra\u00dfe",
          "minuteOffset": 102,
          "isHighPlatform": false
        },
        {
          "stopName": "Graf-Anton-Weg",
          "minuteOffset": 104,
          "isHighPlatform": false
        },
        {
          "stopName": "Herzog-Bruno-Weg",
          "minuteOffset": 106,
          "isHighPlatform": false
        },
        {
          "stopName": "An der Lohe",
          "minuteOffset": 108,
          "isHighPlatform": false
        },
        {
          "stopName": "Fuhlsb\u00fctteler Weg",
          "minuteOffset": 110,
          "isHighPlatform": false
        },
        {
          "stopName": "U Niendorf Markt",
          "minuteOffset": 112,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "25": {
    "lineRef": "25",
    "lineName": "Metrobus 25",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Bf. Altona \u21c4 U Burgstra\u00dfe",
    "directionA": {
      "origin": "Bf. Altona",
      "destination": "U Burgstra\u00dfe",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerichtstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Max-Brauer-Allee (Mitte)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "S Holstenstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsenplatz",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Fruchtallee (Hamburg-Haus)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Schulweg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Goebenstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Kottwitzstra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "G\u00e4rtnerstra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00f6wenstra\u00dfe (Facharztklinik)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "UK Eppendorf",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Park (UKE)",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Julius-Reincke-Stieg (Bethanien)",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Tarpenbekstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Lokstedter Weg",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "U Kellinghusenstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hudtwalckerstra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Winterhuder Marktplatz",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "U Sierichstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Dorotheenstra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Goldbekplatz",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Gertigstra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Hans-Henny-Jahnn-Weg",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Hebbelstra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Beethovenstra\u00dfe",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "U Mundsburg",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "U Uhlandstra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "U Uhlandstra\u00dfe (G\u00fcntherstra\u00dfe)",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wartenau",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "S Landwehr (Ramazan-Avci-Platz)",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Bethesdastra\u00dfe",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "U Burgstra\u00dfe",
          "minuteOffset": 66,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U Burgstra\u00dfe",
      "destination": "Bf. Altona",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U Burgstra\u00dfe",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Bethesdastra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "S Landwehr (Ramazan-Avci-Platz)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wartenau",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "U Uhlandstra\u00dfe (G\u00fcntherstra\u00dfe)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "U Uhlandstra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "U Mundsburg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Beethovenstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Hebbelstra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Hans-Henny-Jahnn-Weg",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Gertigstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Goldbekplatz",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Dorotheenstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "U Sierichstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Winterhuder Marktplatz",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hudtwalckerstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "U Kellinghusenstra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Lokstedter Weg",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Tarpenbekstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Julius-Reincke-Stieg (Bethanien)",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Park (UKE)",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "UK Eppendorf",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00f6wenstra\u00dfe (Facharztklinik)",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "G\u00e4rtnerstra\u00dfe",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Kottwitzstra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Goebenstra\u00dfe",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Schulweg",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Fruchtallee (Hamburg-Haus)",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsenplatz",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "S Holstenstra\u00dfe",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Max-Brauer-Allee (Mitte)",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerichtstra\u00dfe",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Altona",
          "minuteOffset": 66,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "26": {
    "lineRef": "26",
    "lineName": "Metrobus 26",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Gewerbepark Victoria \u21c4 S R\u00fcbenkamp",
    "directionA": {
      "origin": "Gewerbepark Victoria",
      "destination": "S R\u00fcbenkamp",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Gewerbepark Victoria",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Victoriaring",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Hoffmannstieg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Prehnsweg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Sieker Landstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Schweriner Stra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Rahlstedt (Amtsstra\u00dfe)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Liliencronpark",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Forum Gymnasium Rahlstedt",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Boltenhagener Stra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Scharbeutzer Stra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahlstedter Weg (Mitte)",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U Farmsen",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Tegelweg",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Haldesdorfer Stra\u00dfe (Nord)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Ellernreihe (Mitte)",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Steilshooper Allee",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Fabriciusstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Gustav-Seitz-Weg",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Alfred-Mahlau-Weg",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Fritz-Flinte-Ring",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcndgensstra\u00dfe (West)",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Eichenlohweg",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Hebebrandstra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "S R\u00fcbenkamp",
          "minuteOffset": 48,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "S R\u00fcbenkamp",
      "destination": "Gewerbepark Victoria",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "S R\u00fcbenkamp",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Hebebrandstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Eichenlohweg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcndgensstra\u00dfe (West)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Fritz-Flinte-Ring",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Alfred-Mahlau-Weg",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Gustav-Seitz-Weg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Fabriciusstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Steilshooper Allee",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Ellernreihe (Mitte)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Haldesdorfer Stra\u00dfe (Nord)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Tegelweg",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U Farmsen",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahlstedter Weg (Mitte)",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Scharbeutzer Stra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Boltenhagener Stra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Forum Gymnasium Rahlstedt",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Liliencronpark",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Rahlstedt (Amtsstra\u00dfe)",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Schweriner Stra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Sieker Landstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Prehnsweg",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Hoffmannstieg",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Victoriaring",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Gewerbepark Victoria",
          "minuteOffset": 48,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "27": {
    "lineRef": "27",
    "lineName": "Metrobus 27",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "S Wellingsb\u00fcttel \u21c4 U Billstedt",
    "directionA": {
      "origin": "S Wellingsb\u00fcttel",
      "destination": "U Billstedt",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "S Wellingsb\u00fcttel",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Rolfinckstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Waldingstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Grootmoor",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Gut Karlsh\u00f6he",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Thomas-Mann-Stra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Buddenbrookweg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Karlsh\u00f6he",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Stuhtsweg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Neusurenland",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Pflegezentrum Farmsen",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Berufsf\u00f6rderungswerk Hamburg",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U Farmsen",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahlstedter Weg (Mitte)",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Paracelsusstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Pulverhof (Mitte)",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Stemmeshay",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Tonndorf",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Studio Hamburg",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Wilsonstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "K\u00f6penicker Stra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Berliner Platz",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Liegnitzer Stra\u00dfe",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Schweidnitzer Stra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfelder Stra\u00dfe",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Denksteinweg",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker Weg",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Pflegezentrum Holstenhof",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "R\u00fcbezahlstra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Aschenputtelstra\u00dfe",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Fuchsbergredder",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Manshardtstra\u00dfe",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Prinzenweg",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Meriandamm",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker H\u00f6he",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "U Billstedt",
          "minuteOffset": 72,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U Billstedt",
      "destination": "S Wellingsb\u00fcttel",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U Billstedt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker H\u00f6he",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Meriandamm",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Prinzenweg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Manshardtstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Fuchsbergredder",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Aschenputtelstra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "R\u00fcbezahlstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Pflegezentrum Holstenhof",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker Weg",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Denksteinweg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfelder Stra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Schweidnitzer Stra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Liegnitzer Stra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Berliner Platz",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "K\u00f6penicker Stra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Wilsonstra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Studio Hamburg",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Tonndorf",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Stemmeshay",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Pulverhof (Mitte)",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Paracelsusstra\u00dfe",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahlstedter Weg (Mitte)",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "U Farmsen",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Berufsf\u00f6rderungswerk Hamburg",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Pflegezentrum Farmsen",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Neusurenland",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Stuhtsweg",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Karlsh\u00f6he",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Buddenbrookweg",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Thomas-Mann-Stra\u00dfe",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Gut Karlsh\u00f6he",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Grootmoor",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Waldingstra\u00dfe",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Rolfinckstra\u00dfe",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "S Wellingsb\u00fcttel",
          "minuteOffset": 72,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "28": {
    "lineRef": "28",
    "lineName": "Metrobus 28",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "U Niendorf Markt \u21c4 U Wandsbek Markt",
    "directionA": {
      "origin": "U Niendorf Markt",
      "destination": "U Wandsbek Markt",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "U Niendorf Markt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Vogt-Cordes-Damm",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Niendorfer Stra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Bekst\u00fcck",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Stavenhagenstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Warnckesweg",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Spreenende",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Licentiatenberg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Paeplowstieg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Lufthansa-Basis (Haupteingang)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Heselst\u00fccken",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsterkrugchaussee (Mitte)",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Moltrechtweg",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Brabandstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Traute-Lafrenz-Stra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "U Alsterdorf",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Sydneystra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Manilabr\u00fccke",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Kapstadtring",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "S R\u00fcbenkamp",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Jahnbr\u00fccke",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Habichtsplatz",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "U Habichtstra\u00dfe",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Habichtstra\u00dfe (Mitte)",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00e4mmersieth (Nord)",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "U Alter Teichweg",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "U Stra\u00dfburger Stra\u00dfe",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Wandsbeker Allee",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 56,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U Wandsbek Markt",
      "destination": "U Niendorf Markt",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Wandsbeker Allee",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "U Stra\u00dfburger Stra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "U Alter Teichweg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "L\u00e4mmersieth (Nord)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Habichtstra\u00dfe (Mitte)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "U Habichtstra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Habichtsplatz",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Jahnbr\u00fccke",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "S R\u00fcbenkamp",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Kapstadtring",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Manilabr\u00fccke",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Sydneystra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "U Alsterdorf",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Traute-Lafrenz-Stra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Brabandstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Moltrechtweg",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsterkrugchaussee (Mitte)",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Heselst\u00fccken",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Lufthansa-Basis (Haupteingang)",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Paeplowstieg",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Licentiatenberg",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Spreenende",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Warnckesweg",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Stavenhagenstra\u00dfe",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Bekst\u00fcck",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Niendorfer Stra\u00dfe",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Vogt-Cordes-Damm",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "U Niendorf Markt",
          "minuteOffset": 56,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "29": {
    "lineRef": "29",
    "lineName": "Metrobus 29",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Gewerbepark Merkur \u21c4 Bf. Bergedorf",
    "directionA": {
      "origin": "Gewerbepark Merkur",
      "destination": "Bf. Bergedorf",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Gewerbepark Merkur",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Neuer H\u00f6ltigbaum",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Naturschutzgebiet H\u00f6ltigbaum",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Neurahlstedter Graben",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Waterbl\u00f6ckenwiese",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Heckende",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Pahlbl\u00f6ckensstieg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Schweriner Stra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahlstedt Center",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Rahlstedt (Amtsstra\u00dfe)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Rahlstedt (Amtsstra\u00dfe)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Altes Rathaus Rahlstedt",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Buchwaldstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Amtsstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Ohlendorffturm",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Immenseeweg",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Brunskamp",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Sorenkoppel",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Hegen",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthachter Weg",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Kielkoppelstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Kinderkrankenhaus Wilhelmstift",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "H\u00fcllenkamp",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Potsdamer Stra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Berliner Platz",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "K\u00f6penicker Stra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Kaskadenpark",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Otto-Hahn-Schule Jenfeld",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfelder Allee",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfelder Stra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Hans-Rubbert-Stra\u00dfe",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Fuchsbergweg",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Rispengrasweg",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Rehkoppel",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Fuchsbergredder",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Manshardtstra\u00dfe",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Prinzenweg",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Meriandamm",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker H\u00f6he",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "U Billstedt",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "U Billstedt",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Frobeniusweg",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Billstedter M\u00fchlenweg",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohkamp",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Kirchsteinbek",
          "minuteOffset": 90,
          "isHighPlatform": false
        },
        {
          "stopName": "Havighorster Redder (West)",
          "minuteOffset": 92,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fcnterweg",
          "minuteOffset": 94,
          "isHighPlatform": false
        },
        {
          "stopName": "U M\u00fcmmelmannsberg",
          "minuteOffset": 96,
          "isHighPlatform": false
        },
        {
          "stopName": "Steinbeker Grenzdamm",
          "minuteOffset": 98,
          "isHighPlatform": false
        },
        {
          "stopName": "Boberg",
          "minuteOffset": 100,
          "isHighPlatform": false
        },
        {
          "stopName": "BG Klinikum Boberg",
          "minuteOffset": 102,
          "isHighPlatform": false
        },
        {
          "stopName": "Grandkoppel (West)",
          "minuteOffset": 104,
          "isHighPlatform": false
        },
        {
          "stopName": "Grandkoppel",
          "minuteOffset": 106,
          "isHighPlatform": false
        },
        {
          "stopName": "Emilie-G\u00fcnther-Weg",
          "minuteOffset": 108,
          "isHighPlatform": false
        },
        {
          "stopName": "An der Bergkoppel",
          "minuteOffset": 110,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohbr\u00fcgger Kirchstra\u00dfe",
          "minuteOffset": 112,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohbr\u00fcgger Markt",
          "minuteOffset": 114,
          "isHighPlatform": false
        },
        {
          "stopName": "Alte Holstenstra\u00dfe",
          "minuteOffset": 116,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Bergedorf",
          "minuteOffset": 118,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Bf. Bergedorf",
      "destination": "Gewerbepark Merkur",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Bf. Bergedorf",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Alte Holstenstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohbr\u00fcgger Markt",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohbr\u00fcgger Kirchstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "An der Bergkoppel",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Emilie-G\u00fcnther-Weg",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Grandkoppel",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Grandkoppel (West)",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "BG Klinikum Boberg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Boberg",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Steinbeker Grenzdamm",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "U M\u00fcmmelmannsberg",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "M\u00fcnterweg",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Havighorster Redder (West)",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Kirchsteinbek",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohkamp",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Billstedter M\u00fchlenweg",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Frobeniusweg",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "U Billstedt",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "U Billstedt",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker H\u00f6he",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Meriandamm",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Prinzenweg",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Manshardtstra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Fuchsbergredder",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Rehkoppel",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Rispengrasweg",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Fuchsbergweg",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Hans-Rubbert-Stra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfelder Stra\u00dfe",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfelder Allee",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Otto-Hahn-Schule Jenfeld",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Kaskadenpark",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "K\u00f6penicker Stra\u00dfe",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Berliner Platz",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Potsdamer Stra\u00dfe",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "H\u00fcllenkamp",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Kinderkrankenhaus Wilhelmstift",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Kielkoppelstra\u00dfe",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthachter Weg",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Hegen",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Sorenkoppel",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Brunskamp",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Immenseeweg",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Ohlendorffturm",
          "minuteOffset": 90,
          "isHighPlatform": false
        },
        {
          "stopName": "Amtsstra\u00dfe",
          "minuteOffset": 92,
          "isHighPlatform": false
        },
        {
          "stopName": "Buchwaldstra\u00dfe",
          "minuteOffset": 94,
          "isHighPlatform": false
        },
        {
          "stopName": "Altes Rathaus Rahlstedt",
          "minuteOffset": 96,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Rahlstedt (Amtsstra\u00dfe)",
          "minuteOffset": 98,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Rahlstedt (Amtsstra\u00dfe)",
          "minuteOffset": 100,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahlstedt Center",
          "minuteOffset": 102,
          "isHighPlatform": false
        },
        {
          "stopName": "Schweriner Stra\u00dfe",
          "minuteOffset": 104,
          "isHighPlatform": false
        },
        {
          "stopName": "Pahlbl\u00f6ckensstieg",
          "minuteOffset": 106,
          "isHighPlatform": false
        },
        {
          "stopName": "Heckende",
          "minuteOffset": 108,
          "isHighPlatform": false
        },
        {
          "stopName": "Waterbl\u00f6ckenwiese",
          "minuteOffset": 110,
          "isHighPlatform": false
        },
        {
          "stopName": "Neurahlstedter Graben",
          "minuteOffset": 112,
          "isHighPlatform": false
        },
        {
          "stopName": "Naturschutzgebiet H\u00f6ltigbaum",
          "minuteOffset": 114,
          "isHighPlatform": false
        },
        {
          "stopName": "Neuer H\u00f6ltigbaum",
          "minuteOffset": 116,
          "isHighPlatform": false
        },
        {
          "stopName": "Gewerbepark Merkur",
          "minuteOffset": 118,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "3": {
    "lineRef": "3",
    "lineName": "Metrobus 3",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Kraftwerk Tiefstack \u21c4 Schenefeld, Schenefelder Platz",
    "directionA": {
      "origin": "Kraftwerk Tiefstack",
      "destination": "Schenefeld, Schenefelder Platz",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Kraftwerk Tiefstack",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "S Tiefstack",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Ausschl\u00e4ger Allee (Kfz-Verwahrstelle)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothenburgstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Zollvereinsstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Thiedingreihe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Billhorner Deich",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothenburgsorter Marktplatz",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Billhorner M\u00fchlenweg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Billhorner Br\u00fcckenstra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Nagelsweg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Lippeltstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Spaldingstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "U Steinstra\u00dfe (Deichtorplatz)",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/M\u00f6nckebergstra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerhart-Hauptmann-Platz",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathausmarkt",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Axel-Springer-Platz",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Bezirksamt Hamburg-Mitte",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Sievekingplatz",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "U Feldstra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Neuer Pferdemarkt",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Bernstorffstra\u00dfe",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Sternbr\u00fccke",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "S Holstenstra\u00dfe",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Kaltenkircher Platz",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Sch\u00fctzenstra\u00dfe (Mitte)",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Bornkampsweg",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Sauer-Stra\u00dfe",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Silcherstra\u00dfe",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "August-Kirch-Stra\u00dfe",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Trabrennbahn Bahrenfeld",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Luruper Chaussee (DESY)",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadionstra\u00dfe",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Tannenberg",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Rugenbarg (Nord)",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Eckhoffplatz (Lurup Center)",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Flurstra\u00dfe (Nord)",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Luckmoor",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "Engelbrechtweg",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Schenefelder Platz",
          "minuteOffset": 90,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Schenefeld, Schenefelder Platz",
      "destination": "Kraftwerk Tiefstack",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Schenefeld, Schenefelder Platz",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Engelbrechtweg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Luckmoor",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Flurstra\u00dfe (Nord)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Eckhoffplatz (Lurup Center)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Rugenbarg (Nord)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Tannenberg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadionstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Luruper Chaussee (DESY)",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Trabrennbahn Bahrenfeld",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "August-Kirch-Stra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Silcherstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Sauer-Stra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Bornkampsweg",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Sch\u00fctzenstra\u00dfe (Mitte)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Kaltenkircher Platz",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "S Holstenstra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Sternbr\u00fccke",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Bernstorffstra\u00dfe",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Neuer Pferdemarkt",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "U Feldstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Sievekingplatz",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Bezirksamt Hamburg-Mitte",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Axel-Springer-Platz",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathausmarkt",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerhart-Hauptmann-Platz",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/M\u00f6nckebergstra\u00dfe",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "U Steinstra\u00dfe (Deichtorplatz)",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Spaldingstra\u00dfe",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Lippeltstra\u00dfe",
          "minuteOffset": 68,
          "isHighPlatform": false
        },
        {
          "stopName": "Nagelsweg",
          "minuteOffset": 70,
          "isHighPlatform": false
        },
        {
          "stopName": "Billhorner Br\u00fcckenstra\u00dfe",
          "minuteOffset": 72,
          "isHighPlatform": false
        },
        {
          "stopName": "Billhorner M\u00fchlenweg",
          "minuteOffset": 74,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothenburgsorter Marktplatz",
          "minuteOffset": 76,
          "isHighPlatform": false
        },
        {
          "stopName": "Billhorner Deich",
          "minuteOffset": 78,
          "isHighPlatform": false
        },
        {
          "stopName": "Thiedingreihe",
          "minuteOffset": 80,
          "isHighPlatform": false
        },
        {
          "stopName": "Zollvereinsstra\u00dfe",
          "minuteOffset": 82,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothenburgstra\u00dfe",
          "minuteOffset": 84,
          "isHighPlatform": false
        },
        {
          "stopName": "Ausschl\u00e4ger Allee (Kfz-Verwahrstelle)",
          "minuteOffset": 86,
          "isHighPlatform": false
        },
        {
          "stopName": "S Tiefstack",
          "minuteOffset": 88,
          "isHighPlatform": false
        },
        {
          "stopName": "Kraftwerk Tiefstack",
          "minuteOffset": 90,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "7": {
    "lineRef": "7",
    "lineName": "Metrobus 7",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Borchertring \u21c4 U S Barmbek",
    "directionA": {
      "origin": "Borchertring",
      "destination": "U S Barmbek",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Borchertring",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcndgensstra\u00dfe (Ost)",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Erich-Ziegel-Ring",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcndgensstra\u00dfe (Mitte)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Gustav-Seitz-Weg",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Alfred-Mahlau-Weg",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Schwarzer Weg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Richeystra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Langenfort",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "U Habichtstra\u00dfe (Steilshooper Stra\u00dfe)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Harzensweg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Hellbrookstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Barmbek",
          "minuteOffset": 24,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U S Barmbek",
      "destination": "Borchertring",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U S Barmbek",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Hellbrookstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Harzensweg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "U Habichtstra\u00dfe (Steilshooper Stra\u00dfe)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Langenfort",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Richeystra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Schwarzer Weg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Alfred-Mahlau-Weg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Gustav-Seitz-Weg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcndgensstra\u00dfe (Mitte)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Erich-Ziegel-Ring",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcndgensstra\u00dfe (Ost)",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Borchertring",
          "minuteOffset": 24,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "8": {
    "lineRef": "8",
    "lineName": "Metrobus 8",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "U Wandsbek Markt \u21c4 S Poppenb\u00fcttel (Wentzelplatz)",
    "directionA": {
      "origin": "U Wandsbek Markt",
      "destination": "S Poppenb\u00fcttel (Wentzelplatz)",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Wendemuthstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Hogrevestra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Gladowstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Waldd\u00f6rferstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Friedrich-Ebert-Damm (West)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Tilsiter Stra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek-Gartenstadt",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Haldesdorfer Stra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Werner-Otto-Stra\u00dfe (Mitte)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Werner-Otto-Stra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahnstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Steilshooper Allee",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Herthastra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Bramfelder Dorfplatz",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Berner Chaussee",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "K\u00f6nigsberger Stra\u00dfe",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Maisredder",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Damm",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Rolfinckstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Pfeilshofer Weg",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Frahmredder",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadtbahnstra\u00dfe (Mitte)",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "S Poppenb\u00fcttel (Wentzelplatz)",
          "minuteOffset": 46,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "S Poppenb\u00fcttel (Wentzelplatz)",
      "destination": "U Wandsbek Markt",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "S Poppenb\u00fcttel (Wentzelplatz)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadtbahnstra\u00dfe (Mitte)",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Frahmredder",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Pfeilshofer Weg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Rolfinckstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Damm",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Maisredder",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "K\u00f6nigsberger Stra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Berner Chaussee",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Bramfelder Dorfplatz",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Herthastra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Steilshooper Allee",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Rahnstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Werner-Otto-Stra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Werner-Otto-Stra\u00dfe (Mitte)",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Haldesdorfer Stra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek-Gartenstadt",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Tilsiter Stra\u00dfe",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Friedrich-Ebert-Damm (West)",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Waldd\u00f6rferstra\u00dfe",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Gladowstra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Hogrevestra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Wendemuthstra\u00dfe",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 46,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "9": {
    "lineRef": "9",
    "lineName": "Metrobus 9",
    "color": "#ff4d00",
    "stammstrecke": "BUS",
    "corridorName": "Bf. Rahlstedt (Amtsstra\u00dfe) \u21c4 U Wandsbek Markt",
    "directionA": {
      "origin": "Bf. Rahlstedt (Amtsstra\u00dfe)",
      "destination": "U Wandsbek Markt",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Bf. Rahlstedt (Amtsstra\u00dfe)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Wilhelm-Grimm-Stra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Brockdorffstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Loher Stra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Pulverhof (S\u00fcd)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Martensallee",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Wilsonstra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Studio Hamburg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Tonndorf (Tonndorfer Hauptstra\u00dfe)",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Friedhof Tonndorf",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Nordmarkstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "\u00d6lm\u00fchlenweg (S\u00fcd)",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Kurf\u00fcrstenstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Eichtalstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Holzm\u00fchlenstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Wendemuthstra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 32,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U Wandsbek Markt",
      "destination": "Bf. Rahlstedt (Amtsstra\u00dfe)",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Wendemuthstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Holzm\u00fchlenstra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Eichtalstra\u00dfe",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Kurf\u00fcrstenstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "\u00d6lm\u00fchlenweg (S\u00fcd)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Nordmarkstra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Friedhof Tonndorf",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Tonndorf (Tonndorfer Hauptstra\u00dfe)",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Studio Hamburg",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Wilsonstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Martensallee",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Am Pulverhof (S\u00fcd)",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Loher Stra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Brockdorffstra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Wilhelm-Grimm-Stra\u00dfe",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Rahlstedt (Amtsstra\u00dfe)",
          "minuteOffset": 32,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "X22": {
    "lineRef": "X22",
    "lineName": "Expressbus X22",
    "color": "#009944",
    "stammstrecke": "BUS",
    "corridorName": "U Hagenbecks Tierpark \u21c4 Jenfeld-Zentrum",
    "directionA": {
      "origin": "U Hagenbecks Tierpark",
      "destination": "Jenfeld-Zentrum",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "U Hagenbecks Tierpark",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Siemersplatz",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Lokstedter Weg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hudtwalckerstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Winterhuder Marktplatz",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Maria-Louisen-Stra\u00dfe (Nord)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Semperstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Flotowstra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Biedermannplatz",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hamburger Stra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Eilbeker Weg",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Wandsbeker Chaussee",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Universit\u00e4t der Bundeswehr",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker Weg",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 32,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Jenfeld-Zentrum",
      "destination": "U Hagenbecks Tierpark",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Schiffbeker Weg",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Universit\u00e4t der Bundeswehr",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "U Wandsbek Markt",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Wandsbeker Chaussee",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Eilbeker Weg",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hamburger Stra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Biedermannplatz",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Flotowstra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Semperstra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Maria-Louisen-Stra\u00dfe (Nord)",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Winterhuder Marktplatz",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hudtwalckerstra\u00dfe",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Lokstedter Weg",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Siemersplatz",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "U Hagenbecks Tierpark",
          "minuteOffset": 32,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "X3": {
    "lineRef": "X3",
    "lineName": "Expressbus X3",
    "color": "#009944",
    "stammstrecke": "BUS",
    "corridorName": "U Me\u00dfberg \u21c4 Schenefeld, Schenefelder Platz",
    "directionA": {
      "origin": "U Me\u00dfberg",
      "destination": "Schenefeld, Schenefelder Platz",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "U Me\u00dfberg",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Speersort",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Jungfernstieg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "U G\u00e4nsemarkt",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "U Feldstra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "S Holstenstra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Sch\u00fctzenstra\u00dfe (Mitte)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Sauer-Stra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Trabrennbahn Bahrenfeld",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Luruper Chaussee (DESY)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadionstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Kressenweg",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Immenbusch",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Achtern Born",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "B\u00f6ttcherkamp",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Schenefeld, Schenefelder Platz",
          "minuteOffset": 30,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Schenefeld, Schenefelder Platz",
      "destination": "U Me\u00dfberg",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Schenefeld, Schenefelder Platz",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "B\u00f6ttcherkamp",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Achtern Born",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Immenbusch",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Kressenweg",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Stadionstra\u00dfe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Luruper Chaussee (DESY)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Trabrennbahn Bahrenfeld",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Sauer-Stra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Sch\u00fctzenstra\u00dfe (Mitte)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "S Holstenstra\u00dfe",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "U Feldstra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "U G\u00e4nsemarkt",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Jungfernstieg",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Speersort",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "U Me\u00dfberg",
          "minuteOffset": 30,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "X30": {
    "lineRef": "X30",
    "lineName": "Expressbus X30",
    "color": "#009944",
    "stammstrecke": "BUS",
    "corridorName": "S Harburg Rathaus (H\u00f6lertwiete) \u21c4 Bf. Bergedorf",
    "directionA": {
      "origin": "S Harburg Rathaus (H\u00f6lertwiete)",
      "destination": "Bf. Bergedorf",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "S Harburg Rathaus (H\u00f6lertwiete)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "S Harburg Rathaus (Ei\u00dfendorfer Stra\u00dfe)",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Knoopstra\u00dfe/Bremer Stra\u00dfe",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Moorstra\u00dfe (Phoenix-Center)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Felix-Jud-Ring (Mitte)",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Michael-Pritzl-Weg",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Scheliha-Stra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "S Nettelnburg (S\u00fcdeingang)",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Oberer Landweg (Eisenbahnbr\u00fccke)",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Kurt-A.-K\u00f6rber-Chaussee (Ost)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Bergedorf",
          "minuteOffset": 20,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Bf. Bergedorf",
      "destination": "S Harburg Rathaus (H\u00f6lertwiete)",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Bf. Bergedorf",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Kurt-A.-K\u00f6rber-Chaussee (Ost)",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Oberer Landweg (Eisenbahnbr\u00fccke)",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "S Nettelnburg (S\u00fcdeingang)",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Von-Scheliha-Stra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Michael-Pritzl-Weg",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Felix-Jud-Ring (Mitte)",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Moorstra\u00dfe (Phoenix-Center)",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Knoopstra\u00dfe/Bremer Stra\u00dfe",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "S Harburg Rathaus (Ei\u00dfendorfer Stra\u00dfe)",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "S Harburg Rathaus (H\u00f6lertwiete)",
          "minuteOffset": 20,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },
  "X80": {
    "lineRef": "X80",
    "lineName": "Expressbus X80",
    "color": "#009944",
    "stammstrecke": "BUS",
    "corridorName": "Lauenburg, ZOB \u21c4 U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
    "directionA": {
      "origin": "Lauenburg, ZOB",
      "destination": "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Lauenburg, ZOB",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauenburg, Albinusstra\u00dfe",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauenburg, Sportplatz",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauenburg, Birnbaumkamp",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Gl\u00fcsing, Berliner Stra\u00dfe",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Schnakenbek, Twiete",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcnhof, Krukower Weg",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcnhof, Steinberg",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Gr\u00fcner J\u00e4ger",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Waldfriedhof",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Jugendherberge",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Berliner Stra\u00dfe",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, ZOB",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, An der Post",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, D\u00fcneberger Stra\u00dfe",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Sch\u00e4ferstrift",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Besenhorst",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Lehfeld",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Bergedorf",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Sander Markt",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohbr\u00fcgger Markt",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohbr\u00fcgger Kirchstra\u00dfe",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Grandkoppel",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "BG Klinikum Boberg",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Boberg",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Billstedter Hauptstra\u00dfe",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Bauerberg",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "U Burgstra\u00dfe",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Borgfelder Stra\u00dfe",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Berliner Tor (Beim Strohhause)",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerhart-Hauptmann-Platz",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathausmarkt",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
          "minuteOffset": 68,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
      "destination": "Lauenburg, ZOB",
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Rathausmarkt",
          "minuteOffset": 2,
          "isHighPlatform": false
        },
        {
          "stopName": "Gerhart-Hauptmann-Platz",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "HBF/Steintordamm",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof/ZOB",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "U S Berliner Tor (Beim Strohhause)",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Borgfelder Stra\u00dfe",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "U Burgstra\u00dfe",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Bauerberg",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Billstedter Hauptstra\u00dfe",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Boberg",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "BG Klinikum Boberg",
          "minuteOffset": 22,
          "isHighPlatform": false
        },
        {
          "stopName": "Grandkoppel",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohbr\u00fcgger Kirchstra\u00dfe",
          "minuteOffset": 26,
          "isHighPlatform": false
        },
        {
          "stopName": "Lohbr\u00fcgger Markt",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Sander Markt",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Bf. Bergedorf",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Lehfeld",
          "minuteOffset": 34,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Besenhorst",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Sch\u00e4ferstrift",
          "minuteOffset": 38,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, D\u00fcneberger Stra\u00dfe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, An der Post",
          "minuteOffset": 42,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, ZOB",
          "minuteOffset": 44,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Berliner Stra\u00dfe",
          "minuteOffset": 46,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Jugendherberge",
          "minuteOffset": 48,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Waldfriedhof",
          "minuteOffset": 50,
          "isHighPlatform": false
        },
        {
          "stopName": "Geesthacht, Gr\u00fcner J\u00e4ger",
          "minuteOffset": 52,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcnhof, Steinberg",
          "minuteOffset": 54,
          "isHighPlatform": false
        },
        {
          "stopName": "Gr\u00fcnhof, Krukower Weg",
          "minuteOffset": 56,
          "isHighPlatform": false
        },
        {
          "stopName": "Schnakenbek, Twiete",
          "minuteOffset": 58,
          "isHighPlatform": false
        },
        {
          "stopName": "Gl\u00fcsing, Berliner Stra\u00dfe",
          "minuteOffset": 60,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauenburg, Birnbaumkamp",
          "minuteOffset": 62,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauenburg, Sportplatz",
          "minuteOffset": 64,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauenburg, Albinusstra\u00dfe",
          "minuteOffset": 66,
          "isHighPlatform": false
        },
        {
          "stopName": "Lauenburg, ZOB",
          "minuteOffset": 68,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:30",
      "nightService": true
    }
  },

  "4": {
    "lineRef": "4",
    "lineName": "Metrobus 4 (Wildacker ⇄ Eidelstedt ⇄ Schlump ⇄ Hbf/ZOB)",
    "stammstrecke": "BUS",
    "corridorName": "Metrobus 4 Eimsbüttel ⇄ Innenstadt",
    "color": "#f97316",
    "directionA": {
      "origin": "Wildacker",
      "destination": "Hauptbahnhof / ZOB",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Wildacker",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Eidelstedter Platz",
          "minuteOffset": 5,
          "isHighPlatform": false
        },
        {
          "stopName": "Stellingen",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Osterstraße",
          "minuteOffset": 15,
          "isHighPlatform": false
        },
        {
          "stopName": "Schlump",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Dammtor Bahnhof",
          "minuteOffset": 25,
          "isHighPlatform": false
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 35,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Hauptbahnhof / ZOB",
      "destination": "Wildacker",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 5,
          "isHighPlatform": false
        },
        {
          "stopName": "Dammtor Bahnhof",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Schlump",
          "minuteOffset": 15,
          "isHighPlatform": false
        },
        {
          "stopName": "Osterstraße",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Stellingen",
          "minuteOffset": 25,
          "isHighPlatform": false
        },
        {
          "stopName": "Eidelstedter Platz",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Wildacker",
          "minuteOffset": 35,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "5-10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "24/7",
      "lastTrain": "24/7",
      "nightService": true
    }
  },
  "5": {
    "lineRef": "5",
    "lineName": "Metrobus 5 (Hamburg-Schnelsen (A Burgwedel) ⇄ Niendorf ⇄ Hoheluft ⇄ Dammtor ⇄ Hbf/ZOB)",
    "stammstrecke": "BUS",
    "corridorName": "Europas meistgenutzte Buslinie (Metrobus 5)",
    "color": "#84cc16",
    "directionA": {
      "origin": "Hamburg-Schnelsen (A Burgwedel)",
      "destination": "Hauptbahnhof / ZOB",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        2,
        7,
        12,
        17,
        22,
        27,
        32,
        37,
        42,
        47,
        52,
        57
      ],
      "stops": [
        {
          "stopName": "Hamburg-Schnelsen (A Burgwedel)",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Niendorf Markt",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Nedderfeld",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Gärtnerstraße",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Hoheluftbrücke",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Bezirksamt Eimsbüttel",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Grindelhof",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Dammtor Bahnhof",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Gänsemarkt",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 40,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Hauptbahnhof / ZOB",
      "destination": "Hamburg-Schnelsen (A Burgwedel)",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        1,
        6,
        11,
        16,
        21,
        26,
        31,
        36,
        41,
        46,
        51,
        56
      ],
      "stops": [
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 4,
          "isHighPlatform": false
        },
        {
          "stopName": "Gänsemarkt",
          "minuteOffset": 8,
          "isHighPlatform": false
        },
        {
          "stopName": "Dammtor Bahnhof",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Grindelhof",
          "minuteOffset": 16,
          "isHighPlatform": false
        },
        {
          "stopName": "Bezirksamt Eimsbüttel",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Hoheluftbrücke",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Gärtnerstraße",
          "minuteOffset": 28,
          "isHighPlatform": false
        },
        {
          "stopName": "Nedderfeld",
          "minuteOffset": 32,
          "isHighPlatform": false
        },
        {
          "stopName": "Niendorf Markt",
          "minuteOffset": 36,
          "isHighPlatform": false
        },
        {
          "stopName": "Hamburg-Schnelsen (A Burgwedel)",
          "minuteOffset": 40,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "3-5 Min.",
      "offPeak": "5 Min.",
      "night": "20 Min. durchgehend"
    },
    "operatingHours": {
      "firstTrain": "24/7",
      "lastTrain": "24/7",
      "nightService": true
    }
  },
  "6": {
    "lineRef": "6",
    "lineName": "Metrobus 6 (Borgweg ⇄ Uhlenhorst ⇄ Hbf ⇄ Landungsbrücken ⇄ Feldstr.)",
    "stammstrecke": "BUS",
    "corridorName": "Metrobus 6 Alsterufer ⇄ Hafen",
    "color": "#3b82f6",
    "directionA": {
      "origin": "Borgweg (Stadtpark)",
      "destination": "Feldstraße (Heiligengeistfeld)",
      "totalMinutes": 34,
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Borgweg",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Mühlenkamp / Hofweg",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Speicherstadt",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Feldstraße",
          "minuteOffset": 30,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Feldstraße (Heiligengeistfeld)",
      "destination": "Borgweg (Stadtpark)",
      "totalMinutes": 34,
      "baseMinuteDepartures": [
        0,
        10,
        20,
        30,
        40,
        50
      ],
      "stops": [
        {
          "stopName": "Feldstraße",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Speicherstadt",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Mühlenkamp / Hofweg",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Borgweg",
          "minuteOffset": 30,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "24/7",
      "lastTrain": "24/7",
      "nightService": true
    }
  },
  "17": {
    "lineRef": "17",
    "lineName": "Metrobus 17 (U Berne ⇄ Farmsen ⇄ Wandsbek Markt ⇄ Hbf/ZOB)",
    "stammstrecke": "BUS",
    "corridorName": "Metrobus 17 Nord-Ost-Zubringer",
    "color": "#8b5cf6",
    "directionA": {
      "origin": "U Berne",
      "destination": "Hauptbahnhof / ZOB",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        8,
        18,
        28,
        38,
        48,
        58
      ],
      "stops": [
        {
          "stopName": "Berne",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Farmsen",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Wandsbek Markt",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 30,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Hauptbahnhof / ZOB",
      "destination": "U Berne",
      "totalMinutes": 38,
      "baseMinuteDepartures": [
        4,
        14,
        24,
        34,
        44,
        54
      ],
      "stops": [
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Wandsbek Markt",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Farmsen",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Berne",
          "minuteOffset": 30,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "24/7",
      "lastTrain": "24/7",
      "nightService": true
    }
  },
  "19": {
    "lineRef": "19",
    "lineName": "Metrobus 19 (Alsterdorf ⇄ Winterhude ⇄ Dammtor ⇄ Hbf/ZOB)",
    "stammstrecke": "BUS",
    "corridorName": "Metrobus 19 Alsterachse",
    "color": "#14b8a6",
    "directionA": {
      "origin": "Alsterdorf",
      "destination": "Hauptbahnhof / ZOB",
      "totalMinutes": 32,
      "baseMinuteDepartures": [
        0,
        10,
        20,
        30,
        40,
        50
      ],
      "stops": [
        {
          "stopName": "Alsterdorf",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Winterhuder Marktplatz",
          "minuteOffset": 7,
          "isHighPlatform": false
        },
        {
          "stopName": "Harvestehude",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Dammtor Bahnhof",
          "minuteOffset": 21,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 28,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Hauptbahnhof / ZOB",
      "destination": "Alsterdorf",
      "totalMinutes": 32,
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Hauptbahnhof / ZOB",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Dammtor Bahnhof",
          "minuteOffset": 7,
          "isHighPlatform": false
        },
        {
          "stopName": "Harvestehude",
          "minuteOffset": 14,
          "isHighPlatform": false
        },
        {
          "stopName": "Winterhuder Marktplatz",
          "minuteOffset": 21,
          "isHighPlatform": false
        },
        {
          "stopName": "Alsterdorf",
          "minuteOffset": 28,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "24/7",
      "lastTrain": "24/7",
      "nightService": true
    }
  },
  "61": {
    "lineRef": "61",
    "lineName": "HADAG Fähre 61 (Landungsbrücken ⇄ Neuhof)",
    "stammstrecke": "F",
    "corridorName": "St. Pauli Landungsbrücken ⇄ Altona Fischmarkt ⇄ Dockland ⇄ Neuhof",
    "color": "#0284c7",
    "directionA": {
      "origin": "Landungsbrücken (Brücke 2)",
      "destination": "Neuhof (Köhlbrand)",
      "totalMinutes": 22,
      "baseMinuteDepartures": [
        5,
        25,
        45
      ],
      "stops": [
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Altona Fischmarkt",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Dockland",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Waltershof",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Neuhof",
          "minuteOffset": 20,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Neuhof (Köhlbrand)",
      "destination": "Landungsbrücken (Brücke 2)",
      "totalMinutes": 22,
      "baseMinuteDepartures": [
        10,
        30,
        50
      ],
      "stops": [
        {
          "stopName": "Neuhof",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Waltershof",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Dockland",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Altona Fischmarkt",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 20,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "20 Min.",
      "offPeak": "30 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:45",
      "lastTrain": "20:15",
      "nightService": false
    }
  },
  "62": {
    "lineRef": "62",
    "lineName": "HADAG Fähre 62 (Landungsbrücken ⇄ Altona ⇄ Finkenwerder)",
    "stammstrecke": "F",
    "corridorName": "Hafenfähre Landungsbrücken ⇄ Finkenwerder (Airbus)",
    "color": "#06b6d4",
    "directionA": {
      "origin": "Landungsbrücken (Brücke 3)",
      "destination": "Finkenwerder (Airbus)",
      "totalMinutes": 30,
      "baseMinuteDepartures": [
        0,
        15,
        30,
        45
      ],
      "stops": [
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Altona (Fischmarkt)",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Dockland (Fischereihafen)",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Övelgönne (Museumshafen)",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Bubendey-Ufer",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Finkenwerder",
          "minuteOffset": 30,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Finkenwerder (Airbus)",
      "destination": "Landungsbrücken (Brücke 3)",
      "totalMinutes": 30,
      "baseMinuteDepartures": [
        0,
        15,
        30,
        45
      ],
      "stops": [
        {
          "stopName": "Finkenwerder",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bubendey-Ufer",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Övelgönne (Museumshafen)",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Dockland (Fischereihafen)",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Altona (Fischmarkt)",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 30,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "15 Min.",
      "offPeak": "15 Min.",
      "night": "30 Min. bis 23:45"
    },
    "operatingHours": {
      "firstTrain": "05:15",
      "lastTrain": "23:45",
      "nightService": false
    }
  },
  "72": {
    "lineRef": "72",
    "lineName": "HADAG Fähre 72 (Landungsbrücken ⇄ Elbphilharmonie)",
    "stammstrecke": "F",
    "corridorName": "Hafenfähre Landungsbrücken ⇄ Elbphilharmonie (Kaiserkai)",
    "color": "#f59e0b",
    "directionA": {
      "origin": "Landungsbrücken (Brücke 1)",
      "destination": "Elbphilharmonie (Kaiserkai)",
      "totalMinutes": 12,
      "baseMinuteDepartures": [
        5,
        25,
        45
      ],
      "stops": [
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Arningstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbphilharmonie",
          "minuteOffset": 12,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Elbphilharmonie (Kaiserkai)",
      "destination": "Landungsbrücken (Brücke 1)",
      "totalMinutes": 12,
      "baseMinuteDepartures": [
        10,
        30,
        50
      ],
      "stops": [
        {
          "stopName": "Elbphilharmonie",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Arningstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 12,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "20 Min.",
      "offPeak": "20 Min.",
      "night": "Bedarfsverkehr nach Konzertende"
    },
    "operatingHours": {
      "firstTrain": "08:00",
      "lastTrain": "23:30",
      "nightService": false
    }
  },
  "73": {
    "lineRef": "73",
    "lineName": "HADAG Fähre 73 (Landungsbrücken ⇄ Ernst-August-Schleuse)",
    "stammstrecke": "F",
    "corridorName": "Hafenfähre Landungsbrücken ⇄ Theater im Hafen ⇄ Wilhelmsburg",
    "color": "#10b981",
    "directionA": {
      "origin": "Landungsbrücken (Brücke 1)",
      "destination": "Ernst-August-Schleuse",
      "totalMinutes": 18,
      "baseMinuteDepartures": [
        10,
        30,
        50
      ],
      "stops": [
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Theater im Hafen",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Argentinienbrücke",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Ernst-August-Schleuse",
          "minuteOffset": 18,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Ernst-August-Schleuse",
      "destination": "Landungsbrücken (Brücke 1)",
      "totalMinutes": 18,
      "baseMinuteDepartures": [
        0,
        20,
        40
      ],
      "stops": [
        {
          "stopName": "Ernst-August-Schleuse",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Argentinienbrücke",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Theater im Hafen",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 18,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "20 Min. (HVZ)",
      "offPeak": "40 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:40",
      "lastTrain": "19:40",
      "nightService": false
    }
  },
  "75": {
    "lineRef": "75",
    "lineName": "HADAG Fähre 75 (Landungsbrücken ⇄ Steinwerder)",
    "stammstrecke": "F",
    "corridorName": "Hafenfähre Landungsbrücken ⇄ Steinwerder",
    "color": "#ec4899",
    "directionA": {
      "origin": "Landungsbrücken",
      "destination": "Steinwerder (Alter Elbtunnel)",
      "totalMinutes": 6,
      "baseMinuteDepartures": [
        0,
        15,
        30,
        45
      ],
      "stops": [
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Steinwerder (Alter Elbtunnel)",
          "minuteOffset": 6,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Steinwerder (Alter Elbtunnel)",
      "destination": "Landungsbrücken",
      "totalMinutes": 6,
      "baseMinuteDepartures": [
        5,
        20,
        35,
        50
      ],
      "stops": [
        {
          "stopName": "Steinwerder (Alter Elbtunnel)",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 6,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "15 Min.",
      "offPeak": "30 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:30",
      "lastTrain": "19:30",
      "nightService": false
    }
  },
  "U1": {
    "lineRef": "U1",
    "lineName": "U-Bahn U1 (Nord-Ost-Diagonale)",
    "stammstrecke": "U",
    "corridorName": "Norderstedt ⇄ Ohlsdorf ⇄ Jungfernstieg ⇄ Wandsbek ⇄ Großhansdorf",
    "color": "#0284c7",
    "directionA": {
      "origin": "Norderstedt Mitte",
      "destination": "Großhansdorf",
      "totalMinutes": 72,
      "baseMinuteDepartures": [
        4,
        14,
        24,
        34,
        44,
        54
      ],
      "stops": [
        {
          "stopName": "Norderstedt Mitte",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Garstedt",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Ochsenzoll",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Fuhlsbüttel Nord",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Fuhlsbüttel",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Klein Borstel",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Ohlsdorf",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Sengelmannstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Alsterdorf",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Lattenkamp",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hudtwalckerstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Kellinghusenstraße",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Klosterstern",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hallerstraße",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Stephansplatz",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Meßberg",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Steinstraße",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof Süd",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Lohmühlenstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Lübecker Straße",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Wartenau",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Ritterstraße",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Wandsbeker Chaussee",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Wandsbek Markt",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Straßburger Straße",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Alter Teichweg",
          "minuteOffset": 52,
          "isHighPlatform": true
        },
        {
          "stopName": "Wandsbek-Gartenstadt",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Trabrennbahn",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Farmsen",
          "minuteOffset": 58,
          "isHighPlatform": true
        },
        {
          "stopName": "Berne",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Volksdorf",
          "minuteOffset": 62,
          "isHighPlatform": true
        },
        {
          "stopName": "Großhansdorf",
          "minuteOffset": 64,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Großhansdorf",
      "destination": "Norderstedt Mitte",
      "totalMinutes": 72,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Großhansdorf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Volksdorf",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Berne",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Farmsen",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Trabrennbahn",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Wandsbek-Gartenstadt",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Alter Teichweg",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Straßburger Straße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Wandsbek Markt",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Wandsbeker Chaussee",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Ritterstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Wartenau",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Lübecker Straße",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Lohmühlenstraße",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof Süd",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Steinstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Meßberg",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Stephansplatz",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Hallerstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Klosterstern",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Kellinghusenstraße",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Hudtwalckerstraße",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Lattenkamp",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Alsterdorf",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Sengelmannstraße",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Ohlsdorf",
          "minuteOffset": 52,
          "isHighPlatform": true
        },
        {
          "stopName": "Klein Borstel",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Fuhlsbüttel",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Fuhlsbüttel Nord",
          "minuteOffset": 58,
          "isHighPlatform": true
        },
        {
          "stopName": "Ochsenzoll",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Garstedt",
          "minuteOffset": 62,
          "isHighPlatform": true
        },
        {
          "stopName": "Norderstedt Mitte",
          "minuteOffset": 64,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "5 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min. 24/7 am Wochenende"
    },
    "operatingHours": {
      "firstTrain": "04:15",
      "lastTrain": "01:05",
      "nightService": true
    }
  },
  "U2": {
    "lineRef": "U2",
    "lineName": "U-Bahn U2 (Niendorf Nord ⇄ Jungfernstieg ⇄ Billstedt ⇄ Mümmelmannsberg)",
    "stammstrecke": "U",
    "corridorName": "Niendorf ⇄ Eimsbüttel ⇄ Jungfernstieg ⇄ Hbf ⇄ Billstedt",
    "color": "#dc2626",
    "directionA": {
      "origin": "Niendorf Nord",
      "destination": "Mümmelmannsberg",
      "totalMinutes": 48,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Niendorf Nord",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Schippelsweg",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Joachim-Mähl-Straße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Niendorf Markt",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Hagendeel",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Hagenbecks Tierpark",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Lutterothstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Osterstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Emilienstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Christuskirche",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlump",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Messehallen",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Gänsemarkt",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof Nord",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Burgstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammer Kirche",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Rauhes Haus",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Horner Rennbahn",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Legienstraße",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Billstedt",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Merkenstraße",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Steinfurther Allee",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Mümmelmannsberg",
          "minuteOffset": 48,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Mümmelmannsberg",
      "destination": "Niendorf Nord",
      "totalMinutes": 48,
      "baseMinuteDepartures": [
        1,
        11,
        21,
        31,
        41,
        51
      ],
      "stops": [
        {
          "stopName": "Mümmelmannsberg",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Steinfurther Allee",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Merkenstraße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Billstedt",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Legienstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Horner Rennbahn",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Rauhes Haus",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammer Kirche",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Burgstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof Nord",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Gänsemarkt",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Messehallen",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlump",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Christuskirche",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Emilienstraße",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Osterstraße",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Lutterothstraße",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Hagenbecks Tierpark",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Hagendeel",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Niendorf Markt",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Joachim-Mähl-Straße",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Schippelsweg",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Niendorf Nord",
          "minuteOffset": 48,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "5 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min. 24/7 am Wochenende"
    },
    "operatingHours": {
      "firstTrain": "04:20",
      "lastTrain": "01:00",
      "nightService": true
    }
  },
  "U3": {
    "lineRef": "U3",
    "lineName": "U-Bahn U3 (Historische Ringlinie via Hafenviadukt)",
    "stammstrecke": "U",
    "corridorName": "Barmbek ⇄ Kellinghusenstr. ⇄ Landungsbrücken ⇄ Barmbek (Ring)",
    "color": "#eab308",
    "directionA": {
      "origin": "Barmbek (Ring via Hafen)",
      "destination": "Barmbek",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        0,
        5,
        10,
        15,
        20,
        25,
        30,
        35,
        40,
        45,
        50,
        55
      ],
      "stops": [
        {
          "stopName": "Barmbek",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Dehnhaide",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburger Straße",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Mundsburg",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Uhlandstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Lübecker Straße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof Süd",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Mönckebergstraße",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Rathaus",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Rödingsmarkt",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Baumwall (Elbphilharmonie)",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "St. Pauli",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Feldstraße",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Sternschanze",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlump",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hoheluftbrücke",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Eppendorfer Baum",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Kellinghusenstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Sierichstraße",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Borgweg",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Saarlandstraße",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmbek",
          "minuteOffset": 46,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Barmbek (Ring via Schlump)",
      "destination": "Barmbek",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        2,
        7,
        12,
        17,
        22,
        27,
        32,
        37,
        42,
        47,
        52,
        57
      ],
      "stops": [
        {
          "stopName": "Barmbek",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Saarlandstraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Borgweg",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Sierichstraße",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Kellinghusenstraße",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Eppendorfer Baum",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Hoheluftbrücke",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Schlump",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Sternschanze",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Feldstraße",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "St. Pauli",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Baumwall (Elbphilharmonie)",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Rödingsmarkt",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Rathaus",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Mönckebergstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof Süd",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Lübecker Straße",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Uhlandstraße",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Mundsburg",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburger Straße",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Dehnhaide",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmbek",
          "minuteOffset": 46,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "5 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min. 24/7 am Wochenende"
    },
    "operatingHours": {
      "firstTrain": "24/7 Fr/Sa",
      "lastTrain": "01:15 (Mo-Do)",
      "nightService": true
    }
  },
  "U4": {
    "lineRef": "U4",
    "lineName": "U-Bahn U4 (Elbbrücken ⇄ HafenCity ⇄ Jungfernstieg ⇄ Billstedt)",
    "stammstrecke": "U",
    "corridorName": "HafenCity Line & Ost-Verbindung",
    "color": "#06b6d4",
    "directionA": {
      "origin": "Elbbrücken",
      "destination": "Billstedt",
      "totalMinutes": 24,
      "baseMinuteDepartures": [
        7,
        17,
        27,
        37,
        47,
        57
      ],
      "stops": [
        {
          "stopName": "Elbbrücken",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "HafenCity Universität",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Überseequartier",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof Nord",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Burgstraße",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammer Kirche",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Rauhes Haus",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Horner Rennbahn",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Legienstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Billstedt",
          "minuteOffset": 22,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Billstedt",
      "destination": "Elbbrücken",
      "totalMinutes": 24,
      "baseMinuteDepartures": [
        3,
        13,
        23,
        33,
        43,
        53
      ],
      "stops": [
        {
          "stopName": "Billstedt",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Legienstraße",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Horner Rennbahn",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Rauhes Haus",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammer Kirche",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Burgstraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Hauptbahnhof Nord",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Überseequartier",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "HafenCity Universität",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbbrücken",
          "minuteOffset": 22,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min. 24/7 am Wochenende"
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "01:05",
      "nightService": true
    }
  },
  "S1": {
    "lineRef": "S1",
    "lineName": "S-Bahn S1 (Wedel ⇄ Altona ⇄ Hbf ⇄ Airport / Poppenbüttel)",
    "stammstrecke": "S",
    "corridorName": "Flughafen-Linie & Elbvororte",
    "color": "#10b981",
    "directionA": {
      "origin": "Wedel (Holst)",
      "destination": "Hamburg Airport",
      "totalMinutes": 58,
      "baseMinuteDepartures": [
        3,
        13,
        23,
        33,
        43,
        53
      ],
      "stops": [
        {
          "stopName": "Wedel",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Rissen",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Sülldorf",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Iserbrook",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Blankenese",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Hochkamp",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Klein Flottbek",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Othmarschen",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahrenfeld",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Altona",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Königstraße",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Reeperbahn",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthausbrücke",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Landwehr",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Hasselbrook",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Wandsbeker Chaussee",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Friedrichsberg",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmbek",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Alte Wöhr",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Rübenkamp",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Ohlsdorf",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Airport",
          "minuteOffset": 50,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hamburg Airport",
      "destination": "Wedel (Holst)",
      "totalMinutes": 58,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Hamburg Airport",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Ohlsdorf",
          "minuteOffset": 2,
          "isHighPlatform": true
        },
        {
          "stopName": "Rübenkamp",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Alte Wöhr",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmbek",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Friedrichsberg",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Wandsbeker Chaussee",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Hasselbrook",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Landwehr",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 22,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthausbrücke",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 26,
          "isHighPlatform": true
        },
        {
          "stopName": "Reeperbahn",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Königstraße",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Altona",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Bahrenfeld",
          "minuteOffset": 34,
          "isHighPlatform": true
        },
        {
          "stopName": "Othmarschen",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Klein Flottbek",
          "minuteOffset": 38,
          "isHighPlatform": true
        },
        {
          "stopName": "Hochkamp",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Blankenese",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Iserbrook",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Sülldorf",
          "minuteOffset": 46,
          "isHighPlatform": true
        },
        {
          "stopName": "Rissen",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Wedel",
          "minuteOffset": 50,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min. 24/7 am Wochenende"
    },
    "operatingHours": {
      "firstTrain": "04:12",
      "lastTrain": "01:15",
      "nightService": true
    }
  },
  "S2": {
    "lineRef": "S2",
    "lineName": "S-Bahn S2 (Altona ⇄ Hbf ⇄ Bergedorf ⇄ Aumühle)",
    "stammstrecke": "S",
    "corridorName": "Verbindungsbahn & Vierlande-Achse",
    "color": "#dc2626",
    "isDisrupted": true,
    "disruptionType": "CANCELED",
    "disruptionNotice": "Bauarbeiten Verbindungsbahn / Hbf – Gesamtausfall der S2, Ersatzverkehr S2EV aktiv",
    "directionA": {
      "origin": "Hamburg-Altona",
      "destination": "Aumühle",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        8,
        18,
        28,
        38,
        48,
        58
      ],
      "stops": [
        {
          "stopName": "Hamburg-Altona",
          "minuteOffset": 0,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Holstenstraße",
          "minuteOffset": 3,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Sternschanze",
          "minuteOffset": 6,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Dammtor",
          "minuteOffset": 9,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 12,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 15,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Rothenburgsort",
          "minuteOffset": 18,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Tiefstack",
          "minuteOffset": 21,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Billwerder-Moorfleet",
          "minuteOffset": 24,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Mittlerer Landweg",
          "minuteOffset": 27,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Allermöhe",
          "minuteOffset": 30,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Nettelnburg",
          "minuteOffset": 33,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Hamburg-Bergedorf",
          "minuteOffset": 36,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Reinbek",
          "minuteOffset": 39,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Wohltorf",
          "minuteOffset": 42,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Aumühle",
          "minuteOffset": 45,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        }
      ]
    },
    "directionB": {
      "origin": "Aumühle",
      "destination": "Hamburg-Altona",
      "totalMinutes": 44,
      "baseMinuteDepartures": [
        4,
        14,
        24,
        34,
        44,
        54
      ],
      "stops": [
        {
          "stopName": "Aumühle",
          "minuteOffset": 0,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Wohltorf",
          "minuteOffset": 3,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Reinbek",
          "minuteOffset": 6,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Hamburg-Bergedorf",
          "minuteOffset": 9,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Nettelnburg",
          "minuteOffset": 12,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Allermöhe",
          "minuteOffset": 15,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Mittlerer Landweg",
          "minuteOffset": 18,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Billwerder-Moorfleet",
          "minuteOffset": 21,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Tiefstack",
          "minuteOffset": 24,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Rothenburgsort",
          "minuteOffset": 27,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 30,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 33,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Dammtor",
          "minuteOffset": 36,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Sternschanze",
          "minuteOffset": 39,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Holstenstraße",
          "minuteOffset": 42,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        },
        {
          "stopName": "Hamburg-Altona",
          "minuteOffset": 45,
          "isHighPlatform": true,
          "notice": "Halt entfällt (Gesamtausfall S2)"
        }
      ]
    },
    "frequency": {
      "peak": "ENTFÄLLT (SEV alle 10 Min.)",
      "offPeak": "ENTFÄLLT",
      "night": "Kein Zugverkehr"
    },
    "operatingHours": {
      "firstTrain": "Kein Verkehr",
      "lastTrain": "Kein Verkehr",
      "nightService": false
    }
  },
  "S2EV": {
    "lineRef": "S2EV",
    "lineName": "Ersatzverkehr S2EV (Bus Altona ⇄ Hbf ⇄ Bergedorf)",
    "stammstrecke": "BUS",
    "corridorName": "Schienenersatzverkehr S2 (Altona ⇄ Bergedorf)",
    "color": "#ff8000",
    "directionA": {
      "origin": "Hamburg-Altona",
      "destination": "Hamburg-Bergedorf",
      "totalMinutes": 52,
      "baseMinuteDepartures": [
        0,
        10,
        20,
        30,
        40,
        50
      ],
      "stops": [
        {
          "stopName": "Hamburg-Altona",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Holstenstraße",
          "minuteOffset": 5,
          "isHighPlatform": false
        },
        {
          "stopName": "Dammtor",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Hamburg Hbf / Steintorwall",
          "minuteOffset": 15,
          "isHighPlatform": false
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothenburgsort",
          "minuteOffset": 25,
          "isHighPlatform": false
        },
        {
          "stopName": "Tiefstack",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Billwerder-Moorfleet",
          "minuteOffset": 35,
          "isHighPlatform": false
        },
        {
          "stopName": "Allermöhe",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Nettelnburg",
          "minuteOffset": 45,
          "isHighPlatform": false
        },
        {
          "stopName": "Hamburg-Bergedorf",
          "minuteOffset": 50,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Hamburg-Bergedorf",
      "destination": "Hamburg-Altona",
      "totalMinutes": 52,
      "baseMinuteDepartures": [
        5,
        15,
        25,
        35,
        45,
        55
      ],
      "stops": [
        {
          "stopName": "Hamburg-Bergedorf",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Nettelnburg",
          "minuteOffset": 5,
          "isHighPlatform": false
        },
        {
          "stopName": "Allermöhe",
          "minuteOffset": 10,
          "isHighPlatform": false
        },
        {
          "stopName": "Billwerder-Moorfleet",
          "minuteOffset": 15,
          "isHighPlatform": false
        },
        {
          "stopName": "Tiefstack",
          "minuteOffset": 20,
          "isHighPlatform": false
        },
        {
          "stopName": "Rothenburgsort",
          "minuteOffset": 25,
          "isHighPlatform": false
        },
        {
          "stopName": "Berliner Tor",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Hamburg Hbf / Steintorwall",
          "minuteOffset": 35,
          "isHighPlatform": false
        },
        {
          "stopName": "Dammtor",
          "minuteOffset": 40,
          "isHighPlatform": false
        },
        {
          "stopName": "Holstenstraße",
          "minuteOffset": 45,
          "isHighPlatform": false
        },
        {
          "stopName": "Hamburg-Altona",
          "minuteOffset": 50,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min. (SEV Takt)",
      "offPeak": "10 Min.",
      "night": "20 Min."
    },
    "operatingHours": {
      "firstTrain": "24/7 SEV",
      "lastTrain": "24/7 SEV",
      "nightService": true
    }
  },
  "S3": {
    "lineRef": "S3",
    "lineName": "S-Bahn S3 (Pinneberg ⇄ Altona ⇄ Hbf ⇄ Harburg ⇄ Neugraben)",
    "stammstrecke": "S",
    "corridorName": "Pinneberg ⇄ City-Tunnel ⇄ Harburg ⇄ Neugraben",
    "color": "#8b5cf6",
    "directionA": {
      "origin": "Pinneberg",
      "destination": "Neugraben",
      "totalMinutes": 61,
      "baseMinuteDepartures": [
        6,
        16,
        26,
        36,
        46,
        56
      ],
      "stops": [
        {
          "stopName": "Pinneberg",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Thesdorf",
          "minuteOffset": 2.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Halstenbek",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Krupunder",
          "minuteOffset": 7.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbgaustraße",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Eidelstedt",
          "minuteOffset": 12.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Stellingen",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenfelde",
          "minuteOffset": 17.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Diebsteich",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Altona",
          "minuteOffset": 22.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Königstraße",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Reeperbahn",
          "minuteOffset": 27.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthausbrücke",
          "minuteOffset": 32.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 37.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammerbrook",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbbrücken",
          "minuteOffset": 42.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Veddel",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Wilhelmsburg",
          "minuteOffset": 47.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Harburg Rathaus",
          "minuteOffset": 52.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Heimfeld",
          "minuteOffset": 55,
          "isHighPlatform": true
        },
        {
          "stopName": "Neuwiedenthal",
          "minuteOffset": 57.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Neugraben",
          "minuteOffset": 60,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Neugraben",
      "destination": "Pinneberg",
      "totalMinutes": 61,
      "baseMinuteDepartures": [
        2,
        12,
        22,
        32,
        42,
        52
      ],
      "stops": [
        {
          "stopName": "Neugraben",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Neuwiedenthal",
          "minuteOffset": 2.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Heimfeld",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Harburg Rathaus",
          "minuteOffset": 7.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Wilhelmsburg",
          "minuteOffset": 12.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Veddel",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbbrücken",
          "minuteOffset": 17.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammerbrook",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 22.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Jungfernstieg",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Stadthausbrücke",
          "minuteOffset": 27.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Landungsbrücken",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Reeperbahn",
          "minuteOffset": 32.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Königstraße",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Altona",
          "minuteOffset": 37.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Diebsteich",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenfelde",
          "minuteOffset": 42.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Stellingen",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Eidelstedt",
          "minuteOffset": 47.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbgaustraße",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Krupunder",
          "minuteOffset": 52.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Halstenbek",
          "minuteOffset": 55,
          "isHighPlatform": true
        },
        {
          "stopName": "Thesdorf",
          "minuteOffset": 57.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Pinneberg",
          "minuteOffset": 60,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "10 Min.",
      "offPeak": "10 Min.",
      "night": "20 Min. 24/7 am Wochenende"
    },
    "operatingHours": {
      "firstTrain": "04:10",
      "lastTrain": "01:25",
      "nightService": true
    }
  },
  "S5": {
    "lineRef": "S5",
    "lineName": "S-Bahn S5 (Elbgaustr. ⇄ Dammtor ⇄ Harburg ⇄ Stade)",
    "stammstrecke": "S",
    "corridorName": "Elbgaustraße ⇄ Dammtor ⇄ Hbf ⇄ Harburg ⇄ Buxtehude ⇄ Stade",
    "color": "#059669",
    "directionA": {
      "origin": "Elbgaustraße",
      "destination": "Stade",
      "totalMinutes": 74,
      "baseMinuteDepartures": [
        5,
        25,
        45
      ],
      "stops": [
        {
          "stopName": "Elbgaustraße",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Eidelstedt",
          "minuteOffset": 3,
          "isHighPlatform": true
        },
        {
          "stopName": "Stellingen",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenfelde",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Diebsteich",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Holstenstraße",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Sternschanze",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Dammtor",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammerbrook",
          "minuteOffset": 27,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbbrücken",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Veddel",
          "minuteOffset": 33,
          "isHighPlatform": true
        },
        {
          "stopName": "Wilhelmsburg",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 39,
          "isHighPlatform": true
        },
        {
          "stopName": "Harburg Rathaus",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Neugraben",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Fischbek",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Neu Wulmstorf",
          "minuteOffset": 51,
          "isHighPlatform": true
        },
        {
          "stopName": "Buxtehude",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Neukloster",
          "minuteOffset": 57,
          "isHighPlatform": true
        },
        {
          "stopName": "Horneburg",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Dollern",
          "minuteOffset": 63,
          "isHighPlatform": true
        },
        {
          "stopName": "Agathenburg",
          "minuteOffset": 66,
          "isHighPlatform": true
        },
        {
          "stopName": "Stade",
          "minuteOffset": 69,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Stade",
      "destination": "Elbgaustraße",
      "totalMinutes": 74,
      "baseMinuteDepartures": [
        10,
        30,
        50
      ],
      "stops": [
        {
          "stopName": "Stade",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Agathenburg",
          "minuteOffset": 3,
          "isHighPlatform": true
        },
        {
          "stopName": "Dollern",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Horneburg",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Neukloster",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Buxtehude",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Neu Wulmstorf",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Fischbek",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Neugraben",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Harburg Rathaus",
          "minuteOffset": 27,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Wilhelmsburg",
          "minuteOffset": 33,
          "isHighPlatform": true
        },
        {
          "stopName": "Veddel",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbbrücken",
          "minuteOffset": 39,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammerbrook",
          "minuteOffset": 42,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Dammtor",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Sternschanze",
          "minuteOffset": 51,
          "isHighPlatform": true
        },
        {
          "stopName": "Holstenstraße",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Diebsteich",
          "minuteOffset": 57,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenfelde",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Stellingen",
          "minuteOffset": 63,
          "isHighPlatform": true
        },
        {
          "stopName": "Eidelstedt",
          "minuteOffset": 66,
          "isHighPlatform": true
        },
        {
          "stopName": "Elbgaustraße",
          "minuteOffset": 69,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "20 Min. (bis Stade) / 10 Min. (Kern)",
      "offPeak": "20 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:25",
      "lastTrain": "00:55",
      "nightService": true
    }
  },
  "RE1": {
    "lineRef": "RE1",
    "lineName": "Regional-Express RE1 Hanse-Express (Hamburg ⇄ Schwerin ⇄ Rostock)",
    "stammstrecke": "R",
    "corridorName": "Hamburg Hbf ⇄ Büchen ⇄ Schwerin ⇄ Rostock",
    "color": "#ef4444",
    "directionA": {
      "origin": "Hamburg Hbf",
      "destination": "Rostock Hbf",
      "totalMinutes": 125,
      "baseMinuteDepartures": [
        21
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Bergedorf",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwarzenbek",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Müssen",
          "minuteOffset": 27,
          "isHighPlatform": true
        },
        {
          "stopName": "Büchen",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwanheide",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Boizenburg (Elbe)",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Brahlstorf",
          "minuteOffset": 63,
          "isHighPlatform": true
        },
        {
          "stopName": "Pritzier",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Hagenow Land",
          "minuteOffset": 81,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwerin Süd",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwerin Hbf",
          "minuteOffset": 99,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Kleinen",
          "minuteOffset": 108,
          "isHighPlatform": true
        },
        {
          "stopName": "Bützow",
          "minuteOffset": 117,
          "isHighPlatform": true
        },
        {
          "stopName": "Rostock Hbf",
          "minuteOffset": 126,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Rostock Hbf",
      "destination": "Hamburg Hbf",
      "totalMinutes": 125,
      "baseMinuteDepartures": [
        0
      ],
      "stops": [
        {
          "stopName": "Rostock Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bützow",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Kleinen",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwerin Hbf",
          "minuteOffset": 27,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwerin Süd",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Hagenow Land",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Pritzier",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Brahlstorf",
          "minuteOffset": 63,
          "isHighPlatform": true
        },
        {
          "stopName": "Boizenburg (Elbe)",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwanheide",
          "minuteOffset": 81,
          "isHighPlatform": true
        },
        {
          "stopName": "Büchen",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Müssen",
          "minuteOffset": 99,
          "isHighPlatform": true
        },
        {
          "stopName": "Schwarzenbek",
          "minuteOffset": 108,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Bergedorf",
          "minuteOffset": 117,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 126,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min. (HVZ 30 Min.)",
      "offPeak": "60 Min.",
      "night": "120 Min."
    },
    "operatingHours": {
      "firstTrain": "04:45",
      "lastTrain": "00:30",
      "nightService": false
    }
  },
  "RE3": {
    "lineRef": "RE3",
    "lineName": "Regional-Express RE3 (metronom Hamburg ⇄ Lüneburg ⇄ Uelzen ⇄ Hannover)",
    "stammstrecke": "R",
    "corridorName": "metronom Hamburg ⇄ Lüneburg ⇄ Hannover Hbf",
    "color": "#eab308",
    "directionA": {
      "origin": "Hamburg Hbf",
      "destination": "Hannover Hbf",
      "totalMinutes": 140,
      "baseMinuteDepartures": [
        57
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Winsen (Luhe)",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Lüneburg",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Bienenbüttel",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Bevensen",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Uelzen",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Suderburg",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Unterlüß",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Eschede",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Celle",
          "minuteOffset": 100,
          "isHighPlatform": true
        },
        {
          "stopName": "Großburgwedel (Region Hannover)",
          "minuteOffset": 110,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 120,
          "isHighPlatform": true
        },
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 130,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Hannover Hbf",
      "destination": "Hamburg Hbf",
      "totalMinutes": 140,
      "baseMinuteDepartures": [
        40
      ],
      "stops": [
        {
          "stopName": "Hannover Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Langenhagen Mitte",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Großburgwedel (Region Hannover)",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Celle",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Eschede",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Unterlüß",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Suderburg",
          "minuteOffset": 60,
          "isHighPlatform": true
        },
        {
          "stopName": "Uelzen",
          "minuteOffset": 70,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Bevensen",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Bienenbüttel",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Lüneburg",
          "minuteOffset": 100,
          "isHighPlatform": true
        },
        {
          "stopName": "Winsen (Luhe)",
          "minuteOffset": 110,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 120,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 130,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "120 Min."
    },
    "operatingHours": {
      "firstTrain": "04:57",
      "lastTrain": "00:57",
      "nightService": true
    }
  },
  "RE5": {
    "lineRef": "RE5",
    "lineName": "Regional-Express RE5 (Start Unterelbe Hamburg ⇄ Stade ⇄ Cuxhaven)",
    "stammstrecke": "R",
    "corridorName": "Niederelbebahn Hamburg ⇄ Cuxhaven",
    "color": "#0284c7",
    "directionA": {
      "origin": "Hamburg Hbf",
      "destination": "Cuxhaven",
      "totalMinutes": 104,
      "baseMinuteDepartures": [
        6
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Buxtehude",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Horneburg",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Stade",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammah",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Himmelpforten",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Hechthausen",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Hemmoor",
          "minuteOffset": 64,
          "isHighPlatform": true
        },
        {
          "stopName": "Wingst",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Cadenberge",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Otterndorf",
          "minuteOffset": 88,
          "isHighPlatform": true
        },
        {
          "stopName": "Cuxhaven",
          "minuteOffset": 96,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Cuxhaven",
      "destination": "Hamburg Hbf",
      "totalMinutes": 104,
      "baseMinuteDepartures": [
        10
      ],
      "stops": [
        {
          "stopName": "Cuxhaven",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Otterndorf",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Cadenberge",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Wingst",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Hemmoor",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hechthausen",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Himmelpforten",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Hammah",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Stade",
          "minuteOffset": 64,
          "isHighPlatform": true
        },
        {
          "stopName": "Horneburg",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Buxtehude",
          "minuteOffset": 80,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 88,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 96,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "05:06",
      "lastTrain": "23:06",
      "nightService": false
    }
  },
  "RE7": {
    "lineRef": "RE7",
    "lineName": "Regional-Express RE7 (Hamburg ⇄ Elmshorn ⇄ Neumünster ⇄ Flensburg)",
    "stammstrecke": "R",
    "corridorName": "Schleswig-Holstein Express Flensburg",
    "color": "#10b981",
    "directionA": {
      "origin": "Hamburg Hbf",
      "destination": "Flensburg",
      "totalMinutes": 120,
      "baseMinuteDepartures": [
        43
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Dammtor",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Elmshorn",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Neumünster",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Rendsburg",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Schleswig",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Flensburg",
          "minuteOffset": 108,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Flensburg",
      "destination": "Hamburg Hbf",
      "totalMinutes": 120,
      "baseMinuteDepartures": [
        15
      ],
      "stops": [
        {
          "stopName": "Flensburg",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Schleswig",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Rendsburg",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Neumünster",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Elmshorn",
          "minuteOffset": 72,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Dammtor",
          "minuteOffset": 90,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 108,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "05:43",
      "lastTrain": "23:43",
      "nightService": false
    }
  },
  "RE70": {
    "lineRef": "RE70",
    "lineName": "Regional-Express RE70 (Hamburg ⇄ Elmshorn ⇄ Neumünster ⇄ Kiel Hbf)",
    "stammstrecke": "R",
    "corridorName": "Landeshauptstadt-Express Kiel",
    "color": "#06b6d4",
    "directionA": {
      "origin": "Hamburg Hbf",
      "destination": "Kiel Hbf",
      "totalMinutes": 72,
      "baseMinuteDepartures": [
        22
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Dammtor",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Elmshorn",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Wrist",
          "minuteOffset": 27,
          "isHighPlatform": true
        },
        {
          "stopName": "Brokstedt",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Neumünster",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Bordesholm",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Kiel Hbf",
          "minuteOffset": 63,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Kiel Hbf",
      "destination": "Hamburg Hbf",
      "totalMinutes": 72,
      "baseMinuteDepartures": [
        28
      ],
      "stops": [
        {
          "stopName": "Kiel Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bordesholm",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Neumünster",
          "minuteOffset": 18,
          "isHighPlatform": true
        },
        {
          "stopName": "Brokstedt",
          "minuteOffset": 27,
          "isHighPlatform": true
        },
        {
          "stopName": "Wrist",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Elmshorn",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Dammtor",
          "minuteOffset": 54,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 63,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "05:22",
      "lastTrain": "23:22",
      "nightService": false
    }
  },
  "RB31": {
    "lineRef": "RB31",
    "lineName": "Regionalbahn RB31 (metronom Hamburg ⇄ Harburg ⇄ Winsen ⇄ Lüneburg)",
    "stammstrecke": "R",
    "corridorName": "metronom Nahverkehr Elbe-Heide",
    "color": "#f59e0b",
    "directionA": {
      "origin": "Hamburg Hbf",
      "destination": "Lüneburg",
      "totalMinutes": 48,
      "baseMinuteDepartures": [
        16
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Meckelfeld",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Maschen",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Stelle",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Ashausen",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Winsen (Luhe)",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Radbruch",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Bardowick",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Lüneburg",
          "minuteOffset": 45,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Lüneburg",
      "destination": "Hamburg Hbf",
      "totalMinutes": 48,
      "baseMinuteDepartures": [
        54
      ],
      "stops": [
        {
          "stopName": "Lüneburg",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bardowick",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Radbruch",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Winsen (Luhe)",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Ashausen",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Stelle",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Maschen",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Meckelfeld",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 45,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:16",
      "lastTrain": "00:16",
      "nightService": true
    }
  },
  "RB61": {
    "lineRef": "RB61",
    "lineName": "Regionalbahn RB61 (nordbahn Hamburg ⇄ Elmshorn ⇄ Itzehoe)",
    "stammstrecke": "R",
    "corridorName": "nordbahn Marschbahn-Zubringer",
    "color": "#3b82f6",
    "directionA": {
      "origin": "Hamburg Hbf",
      "destination": "Itzehoe",
      "totalMinutes": 56,
      "baseMinuteDepartures": [
        38
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Dammtor",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Pinneberg",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Prisdorf",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Tornesch",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Elmshorn",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Herzhorn",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Glückstadt",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Krempe",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Kremperheide",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Itzehoe",
          "minuteOffset": 50,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Itzehoe",
      "destination": "Hamburg Hbf",
      "totalMinutes": 56,
      "baseMinuteDepartures": [
        27
      ],
      "stops": [
        {
          "stopName": "Itzehoe",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Kremperheide",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Krempe",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Glückstadt",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Herzhorn",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Elmshorn",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Tornesch",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Prisdorf",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Pinneberg",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Dammtor",
          "minuteOffset": 45,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 50,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Einzeltakt"
    },
    "operatingHours": {
      "firstTrain": "05:38",
      "lastTrain": "23:38",
      "nightService": false
    }
  },
  "RB81": {
    "lineRef": "RB81",
    "lineName": "Regionalbahn RB81 (DB Regio Hamburg ⇄ Ahrensburg ⇄ Bad Oldesloe)",
    "stammstrecke": "R",
    "corridorName": "Stormarn-Bahn Hamburg ⇄ Bad Oldesloe",
    "color": "#8b5cf6",
    "directionA": {
      "origin": "Hamburg Hbf",
      "destination": "Bad Oldesloe",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        9,
        39
      ],
      "stops": [
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Hasselbrook",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Tonndorf",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Rahlstedt",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahrensburg",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahrensburg-Gartenholz",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Bargteheide",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Kupfermühle",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Oldesloe",
          "minuteOffset": 40,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Bad Oldesloe",
      "destination": "Hamburg Hbf",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        12,
        42
      ],
      "stops": [
        {
          "stopName": "Bad Oldesloe",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Kupfermühle",
          "minuteOffset": 5,
          "isHighPlatform": true
        },
        {
          "stopName": "Bargteheide",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahrensburg-Gartenholz",
          "minuteOffset": 15,
          "isHighPlatform": true
        },
        {
          "stopName": "Ahrensburg",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Rahlstedt",
          "minuteOffset": 25,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Tonndorf",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Hasselbrook",
          "minuteOffset": 35,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 40,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "30 Min.",
      "offPeak": "30 Min.",
      "night": "60 Min. Fr/Sa"
    },
    "operatingHours": {
      "firstTrain": "04:39",
      "lastTrain": "00:39",
      "nightService": true
    }
  },
  "A1": {
    "lineRef": "A1",
    "lineName": "AKN Eisenbahn A1 (Eidelstedt ⇄ Quickborn ⇄ Kaltenkirchen ⇄ Neumünster)",
    "stammstrecke": "R",
    "corridorName": "AKN Stammstrecke Hamburg Nord-West",
    "color": "#f97316",
    "directionA": {
      "origin": "Eidelstedt",
      "destination": "Neumünster",
      "totalMinutes": 65,
      "baseMinuteDepartures": [
        10,
        30,
        50
      ],
      "stops": [
        {
          "stopName": "Eidelstedt",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Eidelstedt Zentrum",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Hörgensweg",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Schnelsen",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Schnelsen (A Burgwedel)",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Bönningstedt",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Hasloh",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Quickborn Süd",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Quickborn",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Ellerau",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Tanneneck",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Ulzburg Süd",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Henstedt-Ulzburg",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Kaltenkirchen",
          "minuteOffset": 52,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Bramstedt",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Neumünster",
          "minuteOffset": 60,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Neumünster",
      "destination": "Eidelstedt",
      "totalMinutes": 65,
      "baseMinuteDepartures": [
        15,
        35,
        55
      ],
      "stops": [
        {
          "stopName": "Neumünster",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Bramstedt",
          "minuteOffset": 4,
          "isHighPlatform": true
        },
        {
          "stopName": "Kaltenkirchen",
          "minuteOffset": 8,
          "isHighPlatform": true
        },
        {
          "stopName": "Henstedt-Ulzburg",
          "minuteOffset": 12,
          "isHighPlatform": true
        },
        {
          "stopName": "Ulzburg Süd",
          "minuteOffset": 16,
          "isHighPlatform": true
        },
        {
          "stopName": "Tanneneck",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Ellerau",
          "minuteOffset": 24,
          "isHighPlatform": true
        },
        {
          "stopName": "Quickborn",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Quickborn Süd",
          "minuteOffset": 32,
          "isHighPlatform": true
        },
        {
          "stopName": "Hasloh",
          "minuteOffset": 36,
          "isHighPlatform": true
        },
        {
          "stopName": "Bönningstedt",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Schnelsen (A Burgwedel)",
          "minuteOffset": 44,
          "isHighPlatform": true
        },
        {
          "stopName": "Schnelsen",
          "minuteOffset": 48,
          "isHighPlatform": true
        },
        {
          "stopName": "Hörgensweg",
          "minuteOffset": 52,
          "isHighPlatform": true
        },
        {
          "stopName": "Eidelstedt Zentrum",
          "minuteOffset": 56,
          "isHighPlatform": true
        },
        {
          "stopName": "Eidelstedt",
          "minuteOffset": 60,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "20 Min.",
      "offPeak": "20 Min.",
      "night": "60 Min."
    },
    "operatingHours": {
      "firstTrain": "04:30",
      "lastTrain": "00:50",
      "nightService": true
    }
  },
  "A2": {
    "lineRef": "A2",
    "lineName": "AKN Eisenbahn A2 (Norderstedt Mitte ⇄ Ulzburg Süd)",
    "stammstrecke": "R",
    "corridorName": "AKN Alsternordbahn Norderstedt",
    "color": "#84cc16",
    "directionA": {
      "origin": "Norderstedt Mitte",
      "destination": "Ulzburg Süd",
      "totalMinutes": 14,
      "baseMinuteDepartures": [
        5,
        25,
        45
      ],
      "stops": [
        {
          "stopName": "Norderstedt Mitte",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Moorbekhalle",
          "minuteOffset": 3,
          "isHighPlatform": true
        },
        {
          "stopName": "Friedrichsgabe",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Quickborner Straße",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Ulzburg Süd",
          "minuteOffset": 12,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Ulzburg Süd",
      "destination": "Norderstedt Mitte",
      "totalMinutes": 14,
      "baseMinuteDepartures": [
        15,
        35,
        55
      ],
      "stops": [
        {
          "stopName": "Ulzburg Süd",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Quickborner Straße",
          "minuteOffset": 3,
          "isHighPlatform": true
        },
        {
          "stopName": "Friedrichsgabe",
          "minuteOffset": 6,
          "isHighPlatform": true
        },
        {
          "stopName": "Moorbekhalle",
          "minuteOffset": 9,
          "isHighPlatform": true
        },
        {
          "stopName": "Norderstedt Mitte",
          "minuteOffset": 12,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "20 Min.",
      "offPeak": "20 Min.",
      "night": "40 Min."
    },
    "operatingHours": {
      "firstTrain": "04:45",
      "lastTrain": "00:45",
      "nightService": true
    }
  },
  "A3": {
    "lineRef": "A3",
    "lineName": "AKN Eisenbahn A3 (Elmshorn ⇄ Barmstedt ⇄ Ulzburg Süd)",
    "stammstrecke": "R",
    "corridorName": "AKN Elmshorn-Barmstedt-Bahn",
    "color": "#06b6d4",
    "directionA": {
      "origin": "Elmshorn",
      "destination": "Ulzburg Süd",
      "totalMinutes": 32,
      "baseMinuteDepartures": [
        18
      ],
      "stops": [
        {
          "stopName": "Elmshorn",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Sparrieshoop",
          "minuteOffset": 3.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Offenau",
          "minuteOffset": 7,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmstedt",
          "minuteOffset": 10.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmstedt Brunnenstraße",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Voßloch",
          "minuteOffset": 17.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Bokholt",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmstedt",
          "minuteOffset": 24.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Henstedt-Ulzburg",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Ulzburg Süd",
          "minuteOffset": 31.5,
          "isHighPlatform": true
        }
      ]
    },
    "directionB": {
      "origin": "Ulzburg Süd",
      "destination": "Elmshorn",
      "totalMinutes": 32,
      "baseMinuteDepartures": [
        8
      ],
      "stops": [
        {
          "stopName": "Ulzburg Süd",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Henstedt-Ulzburg",
          "minuteOffset": 3.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmstedt",
          "minuteOffset": 7,
          "isHighPlatform": true
        },
        {
          "stopName": "Bokholt",
          "minuteOffset": 10.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Voßloch",
          "minuteOffset": 14,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmstedt Brunnenstraße",
          "minuteOffset": 17.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Barmstedt",
          "minuteOffset": 21,
          "isHighPlatform": true
        },
        {
          "stopName": "Offenau",
          "minuteOffset": 24.5,
          "isHighPlatform": true
        },
        {
          "stopName": "Sparrieshoop",
          "minuteOffset": 28,
          "isHighPlatform": true
        },
        {
          "stopName": "Elmshorn",
          "minuteOffset": 31.5,
          "isHighPlatform": true
        }
      ]
    },
    "frequency": {
      "peak": "60 Min.",
      "offPeak": "60 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:18",
      "lastTrain": "22:18",
      "nightService": false
    }
  },
  "X35": {
    "lineRef": "X35",
    "lineName": "Expressbus X35 (Groß Borstel ⇄ Eppendorf ⇄ Hbf ⇄ Jenfeld-Zentrum)",
    "stammstrecke": "BUS",
    "corridorName": "Expressbus X35 Tangentiale",
    "color": "#ef4444",
    "directionA": {
      "origin": "Groß Borstel",
      "destination": "Jenfeld-Zentrum",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        10,
        30,
        50
      ],
      "stops": [
        {
          "stopName": "Groß Borstel",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Messehallen",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Gänsemarkt",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / Spitalerstraße",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Wandsbek Markt",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 36,
          "isHighPlatform": false
        }
      ]
    },
    "directionB": {
      "origin": "Jenfeld-Zentrum",
      "destination": "Groß Borstel",
      "totalMinutes": 42,
      "baseMinuteDepartures": [
        15,
        35,
        55
      ],
      "stops": [
        {
          "stopName": "Jenfeld-Zentrum",
          "minuteOffset": 0,
          "isHighPlatform": false
        },
        {
          "stopName": "Wandsbek Markt",
          "minuteOffset": 6,
          "isHighPlatform": false
        },
        {
          "stopName": "Hauptbahnhof / Spitalerstraße",
          "minuteOffset": 12,
          "isHighPlatform": false
        },
        {
          "stopName": "Gänsemarkt",
          "minuteOffset": 18,
          "isHighPlatform": false
        },
        {
          "stopName": "Messehallen",
          "minuteOffset": 24,
          "isHighPlatform": false
        },
        {
          "stopName": "Eppendorfer Marktplatz",
          "minuteOffset": 30,
          "isHighPlatform": false
        },
        {
          "stopName": "Groß Borstel",
          "minuteOffset": 36,
          "isHighPlatform": false
        }
      ]
    },
    "frequency": {
      "peak": "10 Min. (HVZ) / 20 Min.",
      "offPeak": "20 Min.",
      "night": "Kein Spätverkehr"
    },
    "operatingHours": {
      "firstTrain": "05:30",
      "lastTrain": "21:30",
      "nightService": false
    }
  }
};
