import { TransitStop } from '../services/apiService';

// Exact OpenStreetMap Verified Coordinates for Hamburg Rapid Transit Network (HVV)
export const ALL_HAMBURG_STATIONS: TransitStop[] = [
  // --- U-BAHN U1 (NORDERSTEDT ⇄ OHLSTEDT / GROSSHANSDORF) ---
  { id: 'hh-norderstedt-mitte', name: 'Norderstedt Mitte', type: 'U-Bahn U1 • AKN A1', lat: 53.7067, lng: 9.9908 },
  { id: 'hh-fuhlsbuettel-nord', name: 'Fuhlsbüttel Nord', type: 'U-Bahn U1', lat: 53.6402, lng: 10.0210 },
  { id: 'hh-ohlsdorf', name: 'Ohlsdorf', type: 'U-Bahn U1 • S1 (Airport-Shuttle)', lat: 53.6205, lng: 10.0325 },
  { id: 'hh-kellinghusenstr', name: 'Kellinghusenstraße', type: 'U-Bahn U1/U3', lat: 53.5885, lng: 9.9910 },
  { id: 'hh-stephansplatz', name: 'Stephansplatz (Oper / Planten un Blomen)', type: 'U-Bahn U1', lat: 53.5585, lng: 9.9885 },
  { id: 'hh-jungfernstieg', name: 'Jungfernstieg', type: 'U-Bahn U1/U2/U4 • S1/S3', lat: 53.5534, lng: 9.9930 },
  { id: 'hh-hbf-sued', name: 'Hauptbahnhof Süd', type: 'U-Bahn U1/U3', lat: 53.5515, lng: 10.0075 },
  { id: 'hh-hbf-nord', name: 'Hauptbahnhof Nord', type: 'U-Bahn U2/U4', lat: 53.5540, lng: 10.0070 },
  { id: 'hh-wandsbek-markt', name: 'Wandsbek Markt (ZOB)', type: 'U-Bahn U1', lat: 53.5718, lng: 10.0682 },
  { id: 'hh-volksdorf', name: 'Volksdorf', type: 'U-Bahn U1', lat: 53.6520, lng: 10.1650 },
  { id: 'hh-grosshansdorf', name: 'Großhansdorf', type: 'U-Bahn U1', lat: 53.6640, lng: 10.2880 },

  // --- U-BAHN U2 / U4 (EIMSBÜTTEL ⇄ HAFENCITY / BILLSTEDT) ---
  { id: 'hh-niendorf-nord', name: 'Niendorf Nord', type: 'U-Bahn U2', lat: 53.6285, lng: 9.9490 },
  { id: 'hh-hagenbeck', name: 'Hagenbecks Tierpark', type: 'U-Bahn U2', lat: 53.5930, lng: 9.9430 },
  { id: 'hh-schlump', name: 'Schlump (Universität)', type: 'U-Bahn U2/U3', lat: 53.5678, lng: 9.9698 },
  { id: 'hh-messehallen', name: 'Messehallen (CCH)', type: 'U-Bahn U2', lat: 53.5580, lng: 9.9760 },
  { id: 'hh-gaensemarkt', name: 'Gänsemarkt (Staatsoper)', type: 'U-Bahn U2', lat: 53.5555, lng: 9.9870 },
  { id: 'hh-berliner-tor', name: 'Berliner Tor (Knotenpunkt)', type: 'U-Bahn U2/U3/U4 • S1/S2', lat: 53.5528, lng: 10.0245 },
  { id: 'hh-burgstrasse', name: 'Burgstraße', type: 'U-Bahn U2/U4', lat: 53.5545, lng: 10.0420 },
  { id: 'hh-billstedt', name: 'Billstedt', type: 'U-Bahn U2/U4', lat: 53.5410, lng: 10.1070 },
  { id: 'hh-muemmelmannsberg', name: 'Mümmelmannsberg', type: 'U-Bahn U2', lat: 53.5280, lng: 10.1510 },
  { id: 'hh-ueberseequartier', name: 'Überseequartier (HafenCity)', type: 'U-Bahn U4', lat: 53.5410, lng: 9.9960 },
  { id: 'hh-hafencity-univ', name: 'HafenCity Universität', type: 'U-Bahn U4', lat: 53.5395, lng: 10.0105 },
  { id: 'hh-elbbruecken-u', name: 'Elbbrücken (U4)', type: 'U-Bahn U4 • S3/S5', lat: 53.5350, lng: 10.0240 },

  // --- U-BAHN U3 (HISTORISCHE RINGLINIE) ---
  { id: 'hh-barmbek', name: 'Barmbek (ZOB)', type: 'U-Bahn U3 • S1', lat: 53.5870, lng: 10.0450 },
  { id: 'hh-sternschanze', name: 'Sternschanze (Schanzenviertel)', type: 'U-Bahn U3 • S2/S5', lat: 53.5630, lng: 9.9675 },
  { id: 'hh-st-pauli', name: 'St. Pauli (Reeperbahn / Millerntor)', type: 'U-Bahn U3', lat: 53.5505, lng: 9.9665 },
  { id: 'hh-landungsbruecken', name: 'Landungsbrücken (Hafen / Fähren)', type: 'U-Bahn U3 • S1/S3', lat: 53.5458, lng: 9.9692 },
  { id: 'hh-baumwall', name: 'Baumwall (Elbphilharmonie)', type: 'U-Bahn U3', lat: 53.5435, lng: 9.9810 },
  { id: 'hh-roedingsmarkt', name: 'Rödingsmarkt (Viadukt)', type: 'U-Bahn U3', lat: 53.5475, lng: 9.9860 },
  { id: 'hh-rathaus', name: 'Rathaus (Hamburg)', type: 'U-Bahn U3', lat: 53.5500, lng: 9.9930 },
  { id: 'hh-moenckebergstr', name: 'Mönckebergstraße', type: 'U-Bahn U3', lat: 53.5510, lng: 10.0010 },

  // --- S-BAHN S1 (WEDEL ⇄ AIRPORT / POPPENBÜTTEL) ---
  { id: 'hh-wedel', name: 'Wedel (Holst)', type: 'S-Bahn S1', lat: 53.5810, lng: 9.7050 },
  { id: 'hh-blankenese', name: 'Blankenese (Treppenviertel)', type: 'S-Bahn S1', lat: 53.5585, lng: 9.8130 },
  { id: 'hh-othmarschen', name: 'Othmarschen', type: 'S-Bahn S1', lat: 53.5600, lng: 9.8920 },
  { id: 'hh-altona', name: 'Hamburg-Altona', type: 'Fern-/Regional- • S1/S2/S3', lat: 53.5527, lng: 9.9352 },
  { id: 'hh-reeperbahn', name: 'Reeperbahn (Kiez)', type: 'S-Bahn S1/S3', lat: 53.5495, lng: 9.9570 },
  { id: 'hh-hbf', name: 'Hamburg Hauptbahnhof', type: 'Fern-/Regional-/S-Bahn • S1-S5', lat: 53.5531, lng: 10.0067 },
  { id: 'hh-airport', name: 'Hamburg Airport (Flughafen)', type: 'S-Bahn S1', lat: 53.6325, lng: 10.0065 },
  { id: 'hh-poppenbuettel', name: 'Poppenbüttel (Alstertal)', type: 'S-Bahn S1', lat: 53.6540, lng: 10.0880 },

  // --- S-BAHN S2 (ALTONA ⇄ VERBINDUNGSBAHN ⇄ BERGEDORF ⇄ AUMÜHLE) ---
  { id: 'hh-holstenstr', name: 'Holstenstraße', type: 'S-Bahn S2/S5', lat: 53.5620, lng: 9.9510 },
  { id: 'hh-dammtor', name: 'Hamburg Dammtor (Messe/CCH)', type: 'Fern-/Regional- • S2/S5', lat: 53.5607, lng: 9.9895 },
  { id: 'hh-rothenburgsort', name: 'Rothenburgsort', type: 'S-Bahn S2', lat: 53.5355, lng: 10.0430 },
  { id: 'hh-tiefstack', name: 'Tiefstack', type: 'S-Bahn S2', lat: 53.5270, lng: 10.0630 },
  { id: 'hh-billwerder-moorfleet', name: 'Billwerder-Moorfleet', type: 'S-Bahn S2', lat: 53.5180, lng: 10.1020 },
  { id: 'hh-mittlerer-landweg', name: 'Mittlerer Landweg', type: 'S-Bahn S2', lat: 53.5080, lng: 10.1380 },
  { id: 'hh-allermoehe', name: 'Allermöhe', type: 'S-Bahn S2', lat: 53.4980, lng: 10.1650 },
  { id: 'hh-nettelnburg', name: 'Nettelnburg', type: 'S-Bahn S2', lat: 53.4920, lng: 10.1850 },
  { id: 'hh-bergedorf', name: 'Hamburg-Bergedorf', type: 'Regional- • S2', lat: 53.4892, lng: 10.2085 },
  { id: 'hh-reinbek', name: 'Reinbek', type: 'S-Bahn S2', lat: 53.5080, lng: 10.2480 },
  { id: 'hh-wohltorf', name: 'Wohltorf', type: 'S-Bahn S2', lat: 53.5210, lng: 10.2780 },
  { id: 'hh-aumuehle', name: 'Aumühle (Sachsenwald)', type: 'S-Bahn S2', lat: 53.5310, lng: 10.3150 },

  // --- S-BAHN S3 & S5 (PINNEBERG / ELBGAUSTR. ⇄ HARBURG ⇄ BUXTEHUDE ⇄ STADE) ---
  { id: 'hh-pinneberg', name: 'Pinneberg', type: 'Regional- • S3', lat: 53.6550, lng: 9.7950 },
  { id: 'hh-elbgaustr', name: 'Elbgaustraße', type: 'S-Bahn S3/S5', lat: 53.6020, lng: 9.9020 },
  { id: 'hh-diebsteich', name: 'Diebsteich', type: 'S-Bahn S3/S5', lat: 53.5690, lng: 9.9320 },
  { id: 'hh-hammerbrook', name: 'Hammerbrook (City Süd)', type: 'S-Bahn S3/S5', lat: 53.5450, lng: 10.0220 },
  { id: 'hh-elbbruecken-s', name: 'Elbbrücken (S-Bahn)', type: 'S-Bahn S3/S5 • U4', lat: 53.5348, lng: 10.0235 },
  { id: 'hh-veddel', name: 'Veddel (BallinStadt)', type: 'S-Bahn S3/S5', lat: 53.5210, lng: 10.0180 },
  { id: 'hh-wilhelmsburg', name: 'Wilhelmsburg (Inselpark)', type: 'S-Bahn S3/S5', lat: 53.4980, lng: 10.0060 },
  { id: 'hh-harburg-hbf', name: 'Hamburg-Harburg', type: 'Fern-/Regional- • S3/S5', lat: 53.4562, lng: 9.9912 },
  { id: 'hh-harburg-rathaus', name: 'Harburg Rathaus', type: 'S-Bahn S3/S5', lat: 53.4590, lng: 9.9790 },
  { id: 'hh-neugraben', name: 'Neugraben', type: 'S-Bahn S3/S5', lat: 53.4720, lng: 9.8550 },
  { id: 'hh-buxtehude', name: 'Buxtehude (Altes Land)', type: 'Regional- • S5', lat: 53.4710, lng: 9.6960 },
  { id: 'hh-stade', name: 'Stade', type: 'Regional- • S5', lat: 53.5950, lng: 9.4820 },

  // --- HADAG ELBFÄHREN (61, 62, 72) ---
  { id: 'hh-faehre-landungsbruecken', name: 'St. Pauli Landungsbrücken (Brücke 1-3)', type: 'HADAG Fährknoten 61/62/72', lat: 53.5458, lng: 9.9692 },
  { id: 'hh-faehre-elbphilharmonie', name: 'Elbphilharmonie Anleger (Fähre 72)', type: 'Fähre 72', lat: 53.5425, lng: 9.9835 },
  { id: 'hh-faehre-fischmarkt', name: 'Altona (Fischmarkt)', type: 'Fähre 62', lat: 53.5445, lng: 9.9380 },
  { id: 'hh-faehre-dockland', name: 'Dockland (Fischereihafen)', type: 'Fähre 62', lat: 53.5438, lng: 9.9310 },
  { id: 'hh-faehre-oevielgoenne', name: 'Övelgönne / Museumshafen', type: 'Fähre 62', lat: 53.5430, lng: 9.9140 },
  { id: 'hh-faehre-bubendey', name: 'Bubendey-Ufer', type: 'Fähre 62', lat: 53.5410, lng: 9.8950 },
  { id: 'hh-faehre-finkenwerder', name: 'Finkenwerder (Airbus)', type: 'Fähre 62/64', lat: 53.5420, lng: 9.8730 },
  { id: 'hh-faehre-neuhof', name: 'Neuhof (Köhlbrand / Fähre 61)', type: 'Fähre 61', lat: 53.5180, lng: 9.9490 },

  // --- AKN / METROBUS 5 KNOTEN SCHNELSEN ---
  { id: 'hh-akn-burgwedel', name: 'Hamburg-Schnelsen (A Burgwedel)', type: 'AKN A1 • Metrobus 5', lat: 53.6420, lng: 9.9140 }
];

