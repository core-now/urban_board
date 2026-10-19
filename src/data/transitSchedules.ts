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
          "stopName": "Großburgwedel",
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
          "stopName": "Großburgwedel",
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
          "stopName": "Großburgwedel",
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
          "stopName": "Großburgwedel",
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
          "stopName": "Großburgwedel",
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
          "stopName": "Großburgwedel",
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
    "lineName": "Metrobus 5 (Burgwedel ⇄ Niendorf ⇄ Hoheluft ⇄ Dammtor ⇄ Hbf/ZOB)",
    "stammstrecke": "BUS",
    "corridorName": "Europas meistgenutzte Buslinie (Metrobus 5)",
    "color": "#84cc16",
    "directionA": {
      "origin": "Burgwedel",
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
          "stopName": "Burgwedel",
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
      "destination": "Burgwedel",
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
          "stopName": "Burgwedel",
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
      "destination": "Uelzen",
      "totalMinutes": 62,
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
        }
      ]
    },
    "directionB": {
      "origin": "Uelzen",
      "destination": "Hamburg Hbf",
      "totalMinutes": 62,
      "baseMinuteDepartures": [
        2
      ],
      "stops": [
        {
          "stopName": "Uelzen",
          "minuteOffset": 0,
          "isHighPlatform": true
        },
        {
          "stopName": "Bad Bevensen",
          "minuteOffset": 10,
          "isHighPlatform": true
        },
        {
          "stopName": "Bienenbüttel",
          "minuteOffset": 20,
          "isHighPlatform": true
        },
        {
          "stopName": "Lüneburg",
          "minuteOffset": 30,
          "isHighPlatform": true
        },
        {
          "stopName": "Winsen (Luhe)",
          "minuteOffset": 40,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg-Harburg",
          "minuteOffset": 50,
          "isHighPlatform": true
        },
        {
          "stopName": "Hamburg Hbf",
          "minuteOffset": 60,
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
          "stopName": "Burgwedel",
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
          "stopName": "Burgwedel",
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
