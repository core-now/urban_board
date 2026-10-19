// Complete Official Route Coordinate Tracks and All Stop Sequences for Hannover & Hamburg Transit Networks
// ÜSTRA / GVH / Transdev / DB / Metronom / WestfalenBahn / erixx & HVV / Hochbahn / S-Bahn Hamburg / HADAG / AKN

export interface TransitLineRoute {
  id: string;
  ref: string;
  name: string;
  type: 'subway' | 'tram' | 'sbahn' | 'bus';
  color: string;
  from: string;
  to: string;
  stops: string[];
  coordinates: [number, number][]; // [Lat, Lng]
}

export const HANNOVER_TRANSIT_ROUTES: Record<string, TransitLineRoute> = {
  "1": {
    "id": "line-1",
    "ref": "1",
    "name": "Stadtbahn 1",
    "type": "subway",
    "color": "#ff8000",
    "from": "Langenhagen",
    "to": "Sarstedt",
    "stops": [
      "Langenhagen",
      "Langenhagen / Zentrum",
      "Berliner Platz",
      "Alter Flughafen",
      "Wiesenau",
      "Kabelkamp",
      "Niedersachsenring",
      "Dragonerstraße",
      "Vahrenwalder Platz",
      "Werderstraße",
      "Hauptbahnhof",
      "Kröpcke",
      "Aegidientorplatz",
      "Schlägerstraße",
      "Geibelstraße",
      "Altenbekener Damm",
      "Fiedelerstraße",
      "Döhren / Peiner Straße",
      "Bothmerstraße",
      "Wiehbergstraße",
      "Laatzen / Birkenstraße",
      "Laatzen / Zentrum",
      "Rethen",
      "Gleidingen",
      "Sarstedt"
    ],
    "coordinates": [
      [
        52.4439,
        9.742
      ],
      [
        52.438,
        9.741
      ],
      [
        52.431,
        9.74
      ],
      [
        52.418,
        9.739
      ],
      [
        52.411,
        9.738
      ],
      [
        52.406,
        9.737
      ],
      [
        52.3985,
        9.7355
      ],
      [
        52.3942,
        9.736
      ],
      [
        52.389,
        9.737
      ],
      [
        52.3845,
        9.7395
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.3744,
        9.7386
      ],
      [
        52.3688,
        9.7431
      ],
      [
        52.363,
        9.748
      ],
      [
        52.359,
        9.751
      ],
      [
        52.355,
        9.754
      ],
      [
        52.346,
        9.761
      ],
      [
        52.338,
        9.769
      ],
      [
        52.331,
        9.775
      ],
      [
        52.325,
        9.782
      ],
      [
        52.32,
        9.785
      ],
      [
        52.316,
        9.789
      ],
      [
        52.288,
        9.815
      ],
      [
        52.261,
        9.818
      ],
      [
        52.238,
        9.822
      ]
    ]
  },
  "2": {
    "id": "line-2",
    "ref": "2",
    "name": "Stadtbahn 2",
    "type": "subway",
    "color": "#3b82f6",
    "from": "Alte Heide",
    "to": "Rethen",
    "stops": [
      "Alte Heide",
      "Bahnstr.",
      "Vahrenheider Markt",
      "Zehlendorfweg",
      "Niedersachsenring",
      "Dragonerstraße",
      "Vahrenwalder Platz",
      "Werderstraße",
      "Hauptbahnhof",
      "Kröpcke",
      "Aegidientorplatz",
      "Schlägerstraße",
      "Geibelstraße",
      "Altenbekener Damm",
      "Fiedelerstraße",
      "Döhren / Peiner Straße",
      "Bothmerstraße",
      "Wiehbergstraße",
      "Laatzen / Birkenstraße",
      "Laatzen / Ginsterweg",
      "Rethen / Nord",
      "Rethen"
    ],
    "coordinates": [
      [
        52.425,
        9.755
      ],
      [
        52.418,
        9.752
      ],
      [
        52.412,
        9.748
      ],
      [
        52.405,
        9.741
      ],
      [
        52.3985,
        9.7355
      ],
      [
        52.3942,
        9.736
      ],
      [
        52.389,
        9.737
      ],
      [
        52.3845,
        9.7395
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.3744,
        9.7386
      ],
      [
        52.3688,
        9.7431
      ],
      [
        52.363,
        9.748
      ],
      [
        52.359,
        9.751
      ],
      [
        52.355,
        9.754
      ],
      [
        52.346,
        9.761
      ],
      [
        52.338,
        9.769
      ],
      [
        52.331,
        9.775
      ],
      [
        52.325,
        9.782
      ],
      [
        52.32,
        9.785
      ],
      [
        52.308,
        9.798
      ],
      [
        52.298,
        9.808
      ],
      [
        52.288,
        9.815
      ]
    ]
  },
  "3": {
    "id": "line-3",
    "ref": "3",
    "name": "Stadtbahn 3",
    "type": "subway",
    "color": "#0284c7",
    "from": "Altwarmbüchen",
    "to": "Wettbergen",
    "stops": [
      "Altwarmbüchen",
      "Opelstraße",
      "Paracelsusweg",
      "Noltemeyerbrücke",
      "Spannhagengarten",
      "Pelikanstraße",
      "Vier Grenzen",
      "Lortzingstraße",
      "Lister Platz",
      "Sedanstraße / Gerberstraße",
      "Hauptbahnhof",
      "Kröpcke",
      "Markthalle / Landtag",
      "Waterloo",
      "Allerweg",
      "Stadionbrücke",
      "Bahnhof Linden/Fischerhof",
      "Beekestraße",
      "Wallensteinstraße",
      "Tresckowstraße",
      "Wettbergen"
    ],
    "coordinates": [
      [
        52.428,
        9.855
      ],
      [
        52.421,
        9.838
      ],
      [
        52.412,
        9.821
      ],
      [
        52.404,
        9.805
      ],
      [
        52.4015,
        9.792
      ],
      [
        52.3995,
        9.782
      ],
      [
        52.396,
        9.771
      ],
      [
        52.392,
        9.7595
      ],
      [
        52.388,
        9.751
      ],
      [
        52.382,
        9.7485
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.3744,
        9.7386
      ],
      [
        52.371,
        9.735
      ],
      [
        52.368,
        9.728
      ],
      [
        52.361,
        9.721
      ],
      [
        52.3555,
        9.7225
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.342,
        9.718
      ],
      [
        52.336,
        9.711
      ],
      [
        52.331,
        9.702
      ],
      [
        52.325,
        9.692
      ]
    ]
  },
  "4": {
    "id": "line-4",
    "ref": "4",
    "name": "Stadtbahn 4",
    "type": "subway",
    "color": "#10b981",
    "from": "Garbsen",
    "to": "Roderbruch",
    "stops": [
      "Garbsen",
      "Auf der Horst",
      "Wissenschaftspark Marienwerder",
      "Friedhof Auf der Horst",
      "Stadtfriedhof Stöcken",
      "Schaumburgstraße",
      "Herrenhäuser Gärten",
      "Appelstraße",
      "Schneiderberg",
      "Leibniz Universität",
      "Königsworther Platz",
      "Steintor",
      "Kröpcke",
      "Aegidientorplatz",
      "Marienstraße",
      "Braunschweiger Platz",
      "Clausewitzstraße",
      "Kantplatz",
      "Uhlhornstraße",
      "Kleefeld Bahnhof",
      "Medizinische Hochschule (MHH)",
      "Roderbruch"
    ],
    "coordinates": [
      [
        52.418,
        9.598
      ],
      [
        52.415,
        9.615
      ],
      [
        52.412,
        9.638
      ],
      [
        52.409,
        9.658
      ],
      [
        52.4045,
        9.675
      ],
      [
        52.3972,
        9.6905
      ],
      [
        52.392,
        9.698
      ],
      [
        52.3892,
        9.7042
      ],
      [
        52.3865,
        9.7095
      ],
      [
        52.3824,
        9.7183
      ],
      [
        52.378,
        9.722
      ],
      [
        52.3752,
        9.7312
      ],
      [
        52.3744,
        9.7386
      ],
      [
        52.3688,
        9.7431
      ],
      [
        52.3695,
        9.751
      ],
      [
        52.371,
        9.761
      ],
      [
        52.3715,
        9.772
      ],
      [
        52.372,
        9.782
      ],
      [
        52.375,
        9.792
      ],
      [
        52.379,
        9.799
      ],
      [
        52.384,
        9.805
      ],
      [
        52.389,
        9.818
      ]
    ]
  },
  "5": {
    "id": "line-5",
    "ref": "5",
    "name": "Stadtbahn 5",
    "type": "subway",
    "color": "#eab308",
    "from": "Stöcken",
    "to": "Anderten",
    "stops": [
      "Stöcken",
      "Stöckener Markt",
      "Freudenthalstraße",
      "Stadtfriedhof Stöcken",
      "Bahnhof Leinhausen",
      "Herrenhäuser Markt",
      "Schaumburgstraße",
      "Herrenhäuser Gärten",
      "Appelstraße",
      "Schneiderbg./W.-Busch-Mus.",
      "Leibniz Universität",
      "Königsworther Platz",
      "Steintor",
      "Kröpcke",
      "Aegidientorplatz",
      "Marienstraße",
      "Braunschweiger Platz",
      "Clausewitzstraße",
      "Kantplatz",
      "Uhlhornstraße",
      "Nackenberg",
      "Annastift",
      "Bleekstraße",
      "Saarbrückener Straße",
      "Großer Hillen",
      "Tiergarten",
      "Ostfeldstraße",
      "Königsberger Ring",
      "Anderten"
    ],
    "coordinates": [
      [
        52.40865,
        9.66215
      ],
      [
        52.4072,
        9.6685
      ],
      [
        52.4058,
        9.6715
      ],
      [
        52.40465,
        9.6752
      ],
      [
        52.4012,
        9.6812
      ],
      [
        52.3988,
        9.6865
      ],
      [
        52.39735,
        9.69065
      ],
      [
        52.39215,
        9.69815
      ],
      [
        52.3894,
        9.7043
      ],
      [
        52.3867,
        9.70965
      ],
      [
        52.38245,
        9.71842
      ],
      [
        52.378,
        9.722
      ],
      [
        52.37532,
        9.73145
      ],
      [
        52.37438,
        9.73862
      ],
      [
        52.36892,
        9.74325
      ],
      [
        52.36968,
        9.75124
      ],
      [
        52.37125,
        9.76142
      ],
      [
        52.3715,
        9.772
      ],
      [
        52.372,
        9.782
      ],
      [
        52.375,
        9.792
      ],
      [
        52.378,
        9.801
      ],
      [
        52.371,
        9.809
      ],
      [
        52.365,
        9.815
      ],
      [
        52.361,
        9.821
      ],
      [
        52.358,
        9.826
      ],
      [
        52.355,
        9.831
      ],
      [
        52.358,
        9.841
      ],
      [
        52.361,
        9.849
      ],
      [
        52.3635,
        9.856
      ]
    ]
  },
  "6": {
    "id": "line-6",
    "ref": "6",
    "name": "Stadtbahn 6",
    "type": "subway",
    "color": "#f59e0b",
    "from": "Nordhafen",
    "to": "Messe/Ost (EXPO-Plaza)",
    "stops": [
      "Nordhafen",
      "Mecklenheidestraße",
      "Beneckeallee",
      "Friedenauer Straße",
      "Krepenstraße",
      "Hainhölzer Markt",
      "Fenskestraße",
      "Bahnhof Nordstadt",
      "An der Strangriede",
      "Kopernikusstraße",
      "Christuskirche",
      "Steintor",
      "Kröpcke",
      "Aegidientorplatz",
      "Marienstraße",
      "Braunschweiger Platz",
      "Freundallee",
      "Kerstingstraße",
      "Kinderkrankenhs. auf der Bult",
      "Zuschlagstraße",
      "Bünteweg/Ti.Hochschule",
      "August-Madsack-Straße",
      "Seelhorster Allee",
      "Emslandstraße",
      "Brabeckstraße",
      "Feldbuschwende",
      "Kronsberg",
      "Krügerskamp",
      "Stockholmer Allee",
      "Messe/Ost (EXPO-Plaza)"
    ],
    "coordinates": [
      [
        52.41865,
        9.6782
      ],
      [
        52.41215,
        9.6894
      ],
      [
        52.4101,
        9.6948
      ],
      [
        52.4087,
        9.69975
      ],
      [
        52.40615,
        9.7062
      ],
      [
        52.39965,
        9.71592
      ],
      [
        52.3968,
        9.7182
      ],
      [
        52.39294,
        9.72145
      ],
      [
        52.38872,
        9.72268
      ],
      [
        52.38435,
        9.72662
      ],
      [
        52.38061,
        9.72895
      ],
      [
        52.37532,
        9.73145
      ],
      [
        52.37438,
        9.73862
      ],
      [
        52.36892,
        9.74325
      ],
      [
        52.36968,
        9.75124
      ],
      [
        52.37125,
        9.76142
      ],
      [
        52.3685,
        9.7695
      ],
      [
        52.3638,
        9.7762
      ],
      [
        52.35821,
        9.78245
      ],
      [
        52.35312,
        9.79152
      ],
      [
        52.3495,
        9.8012
      ],
      [
        52.3468,
        9.8085
      ],
      [
        52.34415,
        9.8142
      ],
      [
        52.3421,
        9.8188
      ],
      [
        52.34105,
        9.8224
      ],
      [
        52.3352,
        9.8241
      ],
      [
        52.32745,
        9.8213
      ],
      [
        52.3235,
        9.8198
      ],
      [
        52.321,
        9.8189
      ],
      [
        52.31915,
        9.81845
      ]
    ]
  },
  "7": {
    "id": "line-7",
    "ref": "7",
    "name": "Stadtbahn 7",
    "type": "subway",
    "color": "#6366f1",
    "from": "Misburg",
    "to": "Wettbergen",
    "stops": [
      "Misburg",
      "Am Forstkamp",
      "Kafkastraße",
      "Schierholzstraße",
      "Paracelsusweg",
      "Noltemeyerbrücke",
      "Spannhagengarten",
      "Pelikanstraße",
      "Vier Grenzen",
      "Lortzingstraße",
      "Lister Platz",
      "Sedanstraße / Gerberstraße",
      "Hauptbahnhof",
      "Kröpcke",
      "Markthalle / Landtag",
      "Waterloo",
      "Allerweg",
      "Stadionbrücke",
      "Bahnhof Linden/Fischerhof",
      "Beekestraße",
      "Wallensteinstraße",
      "Tresckowstraße",
      "Wettbergen"
    ],
    "coordinates": [
      [
        52.389,
        9.855
      ],
      [
        52.395,
        9.845
      ],
      [
        52.402,
        9.835
      ],
      [
        52.408,
        9.825
      ],
      [
        52.412,
        9.821
      ],
      [
        52.404,
        9.805
      ],
      [
        52.4015,
        9.792
      ],
      [
        52.3995,
        9.782
      ],
      [
        52.396,
        9.771
      ],
      [
        52.392,
        9.7595
      ],
      [
        52.388,
        9.751
      ],
      [
        52.382,
        9.7485
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.3744,
        9.7386
      ],
      [
        52.371,
        9.735
      ],
      [
        52.368,
        9.728
      ],
      [
        52.361,
        9.721
      ],
      [
        52.3555,
        9.7225
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.342,
        9.718
      ],
      [
        52.336,
        9.711
      ],
      [
        52.331,
        9.702
      ],
      [
        52.325,
        9.692
      ]
    ]
  },
  "8": {
    "id": "line-8",
    "ref": "8",
    "name": "Stadtbahn 8",
    "type": "subway",
    "color": "#f43f5e",
    "from": "Hauptbahnhof",
    "to": "Messe/Nord",
    "stops": [
      "Hauptbahnhof",
      "Kröpcke",
      "Aegidientorplatz",
      "Schlägerstraße",
      "Geibelstraße",
      "Altenbekener Damm",
      "Fiedelerstraße",
      "Döhren / Peiner Straße",
      "Bothmerstraße",
      "Stadtfriedhof Seelhorst",
      "Am Mittelfelde",
      "Messe/Nord"
    ],
    "coordinates": [
      [
        52.3768,
        9.7408
      ],
      [
        52.3744,
        9.7386
      ],
      [
        52.3688,
        9.7431
      ],
      [
        52.363,
        9.748
      ],
      [
        52.359,
        9.751
      ],
      [
        52.355,
        9.754
      ],
      [
        52.346,
        9.761
      ],
      [
        52.338,
        9.769
      ],
      [
        52.331,
        9.775
      ],
      [
        52.335,
        9.792
      ],
      [
        52.331,
        9.805
      ],
      [
        52.325,
        9.808
      ]
    ]
  },
  "9": {
    "id": "line-9",
    "ref": "9",
    "name": "Stadtbahn 9",
    "type": "subway",
    "color": "#8b5cf6",
    "from": "Empelde",
    "to": "Fasanenkrug",
    "stops": [
      "Empelde",
      "Hermann-Ehlers-Allee",
      "Köthener Straße",
      "Am Soltekampe",
      "Eichenfeldstraße",
      "Safariweg",
      "Nieschlagstraße",
      "Lindener Marktplatz",
      "Am Küchengarten",
      "Schwarzer Bär",
      "Waterloo",
      "Markthalle / Landtag",
      "Kröpcke",
      "Hauptbahnhof",
      "Sedanstraße / Gerberstraße",
      "Lister Platz",
      "Lortzingstraße",
      "Vier Grenzen",
      "Pelikanstraße",
      "Spannhagengarten",
      "In den Sieben Stücken",
      "Kurze-Kamp-Straße",
      "Fasanenkrug"
    ],
    "coordinates": [
      [
        52.341,
        9.664
      ],
      [
        52.348,
        9.673
      ],
      [
        52.353,
        9.681
      ],
      [
        52.358,
        9.689
      ],
      [
        52.362,
        9.694
      ],
      [
        52.366,
        9.699
      ],
      [
        52.368,
        9.704
      ],
      [
        52.37,
        9.711
      ],
      [
        52.3712,
        9.7104
      ],
      [
        52.367,
        9.721
      ],
      [
        52.368,
        9.728
      ],
      [
        52.371,
        9.735
      ],
      [
        52.3744,
        9.7386
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.382,
        9.7485
      ],
      [
        52.388,
        9.751
      ],
      [
        52.392,
        9.7595
      ],
      [
        52.396,
        9.771
      ],
      [
        52.3995,
        9.782
      ],
      [
        52.4015,
        9.792
      ],
      [
        52.408,
        9.801
      ],
      [
        52.416,
        9.809
      ],
      [
        52.424,
        9.817
      ]
    ]
  },
  "10": {
    "id": "line-10",
    "ref": "10",
    "name": "Stadtbahn 10",
    "type": "tram",
    "color": "#14b8a6",
    "from": "Ahlem",
    "to": "Hauptbahnhof / ZOB",
    "stops": [
      "Ahlem",
      "Ehrhartstraße",
      "Brunnenstraße",
      "Ungerstraße",
      "Leinaustraße",
      "Am Küchengarten",
      "Glocksee",
      "Goetheplatz",
      "Clevertor",
      "Steintor",
      "Hauptbahnhof / Rosenstraße",
      "Hauptbahnhof / ZOB"
    ],
    "coordinates": [
      [
        52.382,
        9.664
      ],
      [
        52.379,
        9.673
      ],
      [
        52.376,
        9.682
      ],
      [
        52.3745,
        9.691
      ],
      [
        52.372,
        9.702
      ],
      [
        52.3712,
        9.7104
      ],
      [
        52.3725,
        9.719
      ],
      [
        52.371,
        9.724
      ],
      [
        52.373,
        9.728
      ],
      [
        52.3752,
        9.7312
      ],
      [
        52.376,
        9.738
      ],
      [
        52.3768,
        9.7408
      ]
    ]
  },
  "11": {
    "id": "line-11",
    "ref": "11",
    "name": "Stadtbahn 11",
    "type": "subway",
    "color": "#a855f7",
    "from": "Haltenhoffstraße",
    "to": "Zoo",
    "stops": [
      "Haltenhoffstraße",
      "An der Strangriede",
      "Kopernikusstraße",
      "Christuskirche",
      "Steintor",
      "Kröpcke",
      "Aegidientorplatz",
      "Marienstraße",
      "Braunschweiger Platz",
      "Clausewitzstraße",
      "Hannover Congress Centrum (HCC)",
      "Zoo"
    ],
    "coordinates": [
      [
        52.391,
        9.715
      ],
      [
        52.38872,
        9.72268
      ],
      [
        52.38435,
        9.72662
      ],
      [
        52.38061,
        9.72895
      ],
      [
        52.37532,
        9.73145
      ],
      [
        52.37438,
        9.73862
      ],
      [
        52.36892,
        9.74325
      ],
      [
        52.36968,
        9.75124
      ],
      [
        52.37125,
        9.76142
      ],
      [
        52.3715,
        9.772
      ],
      [
        52.377,
        9.771
      ],
      [
        52.381,
        9.773
      ]
    ]
  },
  "13": {
    "id": "line-13",
    "ref": "13",
    "name": "Stadtbahn 13",
    "type": "subway",
    "color": "#0ea5e9",
    "from": "Hemmingen",
    "to": "Fasanenkrug",
    "stops": [
      "Hemmingen",
      "Hemmingen / Saarstraße",
      "Hemmingen / Berliner Straße",
      "Unter den Birken",
      "Westerfeld / Deveser Straße",
      "Stadionbrücke",
      "Allerweg",
      "Waterloo",
      "Markthalle / Landtag",
      "Kröpcke",
      "Hauptbahnhof",
      "Sedanstraße / Gerberstraße",
      "Lister Platz",
      "Vier Grenzen",
      "Spannhagengarten",
      "In den Sieben Stücken",
      "Fasanenkrug"
    ],
    "coordinates": [
      [
        52.321,
        9.729
      ],
      [
        52.328,
        9.727
      ],
      [
        52.335,
        9.725
      ],
      [
        52.342,
        9.724
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.3555,
        9.7225
      ],
      [
        52.361,
        9.721
      ],
      [
        52.368,
        9.728
      ],
      [
        52.371,
        9.735
      ],
      [
        52.3744,
        9.7386
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.382,
        9.7485
      ],
      [
        52.388,
        9.751
      ],
      [
        52.396,
        9.771
      ],
      [
        52.4015,
        9.792
      ],
      [
        52.408,
        9.801
      ],
      [
        52.424,
        9.817
      ]
    ]
  },
  "17": {
    "id": "line-17",
    "ref": "17",
    "name": "Stadtbahn 17",
    "type": "tram",
    "color": "#ec4899",
    "from": "Wallensteinstraße",
    "to": "Hauptbahnhof / ZOB",
    "stops": [
      "Wallensteinstraße",
      "Beekestraße",
      "Bahnhof Linden/Fischerhof",
      "Stadionbrücke",
      "Allerweg",
      "Schwarzer Bär",
      "Humboldtstraße",
      "Goetheplatz",
      "Clevertor",
      "Steintor",
      "Hauptbahnhof / ZOB"
    ],
    "coordinates": [
      [
        52.336,
        9.711
      ],
      [
        52.342,
        9.718
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.3555,
        9.7225
      ],
      [
        52.361,
        9.721
      ],
      [
        52.367,
        9.721
      ],
      [
        52.369,
        9.722
      ],
      [
        52.371,
        9.724
      ],
      [
        52.373,
        9.728
      ],
      [
        52.3752,
        9.7312
      ],
      [
        52.3768,
        9.7408
      ]
    ]
  },
  "100": {
    "id": "line-100",
    "ref": "100",
    "name": "Ringbus 100",
    "type": "bus",
    "color": "#84cc16",
    "from": "August-Holweg-Platz",
    "to": "Kröpcke",
    "stops": [
      "August-Holweg-Platz",
      "Lindener Marktplatz",
      "Am Küchengarten",
      "Glocksee",
      "Königsworther Platz",
      "Christuskirche",
      "Hauptbahnhof / Ernst-August-Platz",
      "Kröpcke"
    ],
    "coordinates": [
      [
        52.364,
        9.715
      ],
      [
        52.37,
        9.711
      ],
      [
        52.3712,
        9.7104
      ],
      [
        52.3725,
        9.719
      ],
      [
        52.378,
        9.722
      ],
      [
        52.3806,
        9.7289
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.3744,
        9.7386
      ]
    ]
  },
  "120": {
    "id": "line-120",
    "ref": "120",
    "name": "Bus 120 (Ahlem ⇄ Kröpcke)",
    "type": "bus",
    "color": "#06b6d4",
    "from": "Ahlem",
    "to": "Kröpcke",
    "stops": [
      "Ahlem",
      "Wunstorfer Straße",
      "Limmer Schleuse",
      "Leinaustraße",
      "Am Küchengarten",
      "Waterloo",
      "Aegidientorplatz",
      "Kröpcke"
    ],
    "coordinates": [
      [
        52.382,
        9.664
      ],
      [
        52.3745,
        9.691
      ],
      [
        52.378,
        9.685
      ],
      [
        52.372,
        9.702
      ],
      [
        52.3712,
        9.7104
      ],
      [
        52.368,
        9.728
      ],
      [
        52.3688,
        9.7431
      ],
      [
        52.3744,
        9.7386
      ]
    ]
  },
  "121": {
    "id": "line-121",
    "ref": "121",
    "name": "Bus 121 (Haltenhoffstr. ⇄ Altenbekener Damm)",
    "type": "bus",
    "color": "#f59e0b",
    "from": "Haltenhoffstraße",
    "to": "Altenbekener Damm",
    "stops": [
      "Haltenhoffstraße",
      "Fenskestraße",
      "Vahrenwalder Platz",
      "Hauptbahnhof / ZOB",
      "Marienstraße",
      "Altenbekener Damm"
    ],
    "coordinates": [
      [
        52.391,
        9.715
      ],
      [
        52.3968,
        9.7182
      ],
      [
        52.389,
        9.737
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.3696,
        9.7512
      ],
      [
        52.355,
        9.754
      ]
    ]
  },
  "128": {
    "id": "line-128",
    "ref": "128",
    "name": "Bus 128 (Nordhafen ⇄ Peiner Straße)",
    "type": "bus",
    "color": "#8b5cf6",
    "from": "Nordhafen",
    "to": "Peiner Straße",
    "stops": [
      "Nordhafen",
      "Mecklenheidestraße",
      "Vahrenwalder Markt",
      "Niedersachsenring",
      "Lister Platz",
      "Kantplatz",
      "Peiner Straße"
    ],
    "coordinates": [
      [
        52.4186,
        9.6782
      ],
      [
        52.4121,
        9.6894
      ],
      [
        52.412,
        9.748
      ],
      [
        52.3985,
        9.7355
      ],
      [
        52.388,
        9.751
      ],
      [
        52.372,
        9.782
      ],
      [
        52.338,
        9.769
      ]
    ]
  },
  "134": {
    "id": "line-134",
    "ref": "134",
    "name": "Bus 134 (Nordhafen ⇄ Peiner Straße)",
    "type": "bus",
    "color": "#ec4899",
    "from": "Nordhafen",
    "to": "Peiner Straße",
    "stops": [
      "Nordhafen",
      "Beneckeallee",
      "Vahrenheider Markt",
      "Hauptbahnhof",
      "Marienstraße",
      "Kinderkrankenhs. auf der Bult",
      "Peiner Straße"
    ],
    "coordinates": [
      [
        52.4186,
        9.6782
      ],
      [
        52.4101,
        9.6948
      ],
      [
        52.412,
        9.748
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.3696,
        9.7512
      ],
      [
        52.3582,
        9.7824
      ],
      [
        52.338,
        9.769
      ]
    ]
  },
  "200": {
    "id": "line-200",
    "ref": "200",
    "name": "Ringbus 200",
    "type": "bus",
    "color": "#10b981",
    "from": "Kröpcke",
    "to": "August-Holweg-Platz",
    "stops": [
      "Kröpcke",
      "Aegidientorplatz",
      "Rathaus / Bleichenstraße",
      "Waterlooplatz",
      "Schwarzer Bär",
      "Lindener Marktplatz",
      "August-Holweg-Platz"
    ],
    "coordinates": [
      [
        52.3744,
        9.7386
      ],
      [
        52.3688,
        9.7431
      ],
      [
        52.367,
        9.736
      ],
      [
        52.368,
        9.728
      ],
      [
        52.367,
        9.721
      ],
      [
        52.37,
        9.711
      ],
      [
        52.364,
        9.715
      ]
    ]
  },
  "800": {
    "id": "line-800",
    "ref": "800",
    "name": "SprintH Bus 800 (Mehrum ⇄ Kröpcke)",
    "type": "bus",
    "color": "#ff8000",
    "from": "Mehrum",
    "to": "Kröpcke",
    "stops": [
      "Mehrum",
      "Rethmar",
      "Sehnde",
      "Ilten",
      "Kronsberg",
      "Aegidientorplatz",
      "Kröpcke"
    ],
    "coordinates": [
      [
        52.295,
        10.09
      ],
      [
        52.312,
        10.04
      ],
      [
        52.318,
        9.965
      ],
      [
        52.345,
        9.92
      ],
      [
        52.3274,
        9.8213
      ],
      [
        52.3688,
        9.7431
      ],
      [
        52.3744,
        9.7386
      ]
    ]
  },
  "S1": {
    "id": "line-s1",
    "ref": "S1",
    "name": "S-Bahn S1",
    "type": "sbahn",
    "color": "#0284c7",
    "from": "Minden (Westf)",
    "to": "Hannover Hbf",
    "stops": [
      "Minden (Westf)",
      "Bückeburg",
      "Kirchhorsten",
      "Stadthagen",
      "Lindhorst",
      "Haste",
      "Wunstorf",
      "Hannover-Bornum",
      "Hannover-Linden/Fischerhof",
      "Hannover Bismarckstraße",
      "Hannover Hbf"
    ],
    "coordinates": [
      [
        52.29,
        8.935
      ],
      [
        52.261,
        9.05
      ],
      [
        52.285,
        9.15
      ],
      [
        52.325,
        9.21
      ],
      [
        52.36,
        9.29
      ],
      [
        52.38,
        9.39
      ],
      [
        52.42,
        9.43
      ],
      [
        52.355,
        9.69
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.358,
        9.761
      ],
      [
        52.3768,
        9.7408
      ]
    ]
  },
  "S2": {
    "id": "line-s2",
    "ref": "S2",
    "name": "S-Bahn S2",
    "type": "sbahn",
    "color": "#06b6d4",
    "from": "Nienburg (Weser)",
    "to": "Haste (Han)",
    "stops": [
      "Nienburg (Weser)",
      "Linsburg",
      "Hagen (Han)",
      "Eilvese",
      "Neustadt am Rübenberge",
      "Poggenhagen",
      "Wunstorf",
      "Hannover-Leinhausen",
      "Hannover-Nordstadt",
      "Hannover Hbf",
      "Hannover Bismarckstraße",
      "Hannover-Linden/Fischerhof",
      "Weetzen",
      "Barsinghausen",
      "Bad Nenndorf",
      "Haste (Han)"
    ],
    "coordinates": [
      [
        52.64,
        9.22
      ],
      [
        52.59,
        9.31
      ],
      [
        52.56,
        9.42
      ],
      [
        52.53,
        9.45
      ],
      [
        52.505,
        9.46
      ],
      [
        52.47,
        9.44
      ],
      [
        52.42,
        9.43
      ],
      [
        52.4012,
        9.6812
      ],
      [
        52.3928,
        9.7212
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.358,
        9.761
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.305,
        9.64
      ],
      [
        52.302,
        9.46
      ],
      [
        52.335,
        9.38
      ],
      [
        52.38,
        9.39
      ]
    ]
  },
  "S3": {
    "id": "line-s3",
    "ref": "S3",
    "name": "S-Bahn S3",
    "type": "sbahn",
    "color": "#8b5cf6",
    "from": "Hannover Hbf",
    "to": "Hildesheim Hbf",
    "stops": [
      "Hannover Hbf",
      "Hannover-Kleefeld",
      "Hannover Karl-Wiechert-Allee",
      "Hannover-Anderten/Misburg",
      "Ahlten",
      "Lehrte",
      "Sehnde",
      "Algermissen",
      "Harsum",
      "Hildesheim Hbf"
    ],
    "coordinates": [
      [
        52.3768,
        9.7408
      ],
      [
        52.378,
        9.79
      ],
      [
        52.371,
        9.815
      ],
      [
        52.363,
        9.855
      ],
      [
        52.368,
        9.905
      ],
      [
        52.373,
        9.978
      ],
      [
        52.318,
        9.965
      ],
      [
        52.255,
        9.97
      ],
      [
        52.205,
        9.96
      ],
      [
        52.158,
        9.952
      ]
    ]
  },
  "S4": {
    "id": "line-s4",
    "ref": "S4",
    "name": "S-Bahn S4",
    "type": "sbahn",
    "color": "#06b6d4",
    "from": "Bennemühlen",
    "to": "Hildesheim Hbf",
    "stops": [
      "Bennemühlen",
      "Mellendorf",
      "Bissendorf",
      "Langenhagen-Kaltenweide",
      "Langenhagen Pferdemarkt",
      "Langenhagen Mitte",
      "Hannover-Vinnhorst",
      "Hannover-Ledeburg",
      "Bahnhof Nordstadt",
      "Hannover Hbf",
      "Hannover Bismarckstraße",
      "Hannover Messe/Laatzen",
      "Rethen (Leine)",
      "Sarstedt",
      "Barnten",
      "Emmerke",
      "Hildesheim Hbf"
    ],
    "coordinates": [
      [
        52.568,
        9.738
      ],
      [
        52.548,
        9.742
      ],
      [
        52.518,
        9.74
      ],
      [
        52.481,
        9.738
      ],
      [
        52.458,
        9.736
      ],
      [
        52.443,
        9.735
      ],
      [
        52.418,
        9.718
      ],
      [
        52.404,
        9.705
      ],
      [
        52.3928,
        9.7212
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.358,
        9.761
      ],
      [
        52.3218,
        9.7942
      ],
      [
        52.288,
        9.815
      ],
      [
        52.238,
        9.822
      ],
      [
        52.205,
        9.865
      ],
      [
        52.178,
        9.902
      ],
      [
        52.158,
        9.952
      ]
    ]
  },
  "S5": {
    "id": "line-s5",
    "ref": "S5",
    "name": "S-Bahn S5 (Flughafen ⇄ Paderborn)",
    "type": "sbahn",
    "color": "#10b981",
    "from": "Hannover Flughafen",
    "to": "Paderborn Hbf",
    "stops": [
      "Hannover Flughafen",
      "Langenhagen Pferdemarkt",
      "Langenhagen Mitte",
      "Hannover-Vinnhorst",
      "Hannover-Ledeburg",
      "Bahnhof Nordstadt",
      "Hannover Hbf",
      "Hannover Bismarckstraße",
      "Hannover-Linden/Fischerhof",
      "Weetzen",
      "Springe",
      "Bad Münder (Deister)",
      "Hameln",
      "Bad Pyrmont",
      "Lügde",
      "Schieder",
      "Steinheim (Westf)",
      "Altenbeken",
      "Paderborn Hbf"
    ],
    "coordinates": [
      [
        52.46,
        9.695
      ],
      [
        52.458,
        9.736
      ],
      [
        52.443,
        9.735
      ],
      [
        52.418,
        9.718
      ],
      [
        52.404,
        9.705
      ],
      [
        52.3928,
        9.7212
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.358,
        9.761
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.305,
        9.64
      ],
      [
        52.21,
        9.555
      ],
      [
        52.195,
        9.46
      ],
      [
        52.105,
        9.365
      ],
      [
        51.985,
        9.255
      ],
      [
        51.96,
        9.245
      ],
      [
        51.92,
        9.155
      ],
      [
        51.87,
        9.04
      ],
      [
        51.76,
        8.945
      ],
      [
        51.715,
        8.755
      ]
    ]
  },
  "S6": {
    "id": "line-s6",
    "ref": "S6",
    "name": "S-Bahn S6",
    "type": "sbahn",
    "color": "#ec4899",
    "from": "Hannover Hbf",
    "to": "Celle",
    "stops": [
      "Hannover Hbf",
      "Hannover Karl-Wiechert-Allee",
      "Aligse",
      "Burgdorf",
      "Otze",
      "Ehlershausen",
      "Großburgwedel",
      "Celle"
    ],
    "coordinates": [
      [
        52.3768,
        9.7408
      ],
      [
        52.371,
        9.815
      ],
      [
        52.395,
        9.975
      ],
      [
        52.445,
        10.005
      ],
      [
        52.49,
        10.015
      ],
      [
        52.53,
        10.025
      ],
      [
        52.495,
        9.865
      ],
      [
        52.625,
        10.08
      ]
    ]
  },
  "S7": {
    "id": "line-s7",
    "ref": "S7",
    "name": "S-Bahn S7",
    "type": "sbahn",
    "color": "#eab308",
    "from": "Hannover Hbf",
    "to": "Celle",
    "stops": [
      "Hannover Hbf",
      "Hannover-Kleefeld",
      "Hannover Karl-Wiechert-Allee",
      "Hannover-Anderten/Misburg",
      "Ahlten",
      "Lehrte",
      "Aligse",
      "Burgdorf",
      "Otze",
      "Ehlershausen",
      "Celle"
    ],
    "coordinates": [
      [
        52.3768,
        9.7408
      ],
      [
        52.378,
        9.79
      ],
      [
        52.371,
        9.815
      ],
      [
        52.363,
        9.855
      ],
      [
        52.368,
        9.905
      ],
      [
        52.373,
        9.978
      ],
      [
        52.395,
        9.975
      ],
      [
        52.445,
        10.005
      ],
      [
        52.49,
        10.015
      ],
      [
        52.53,
        10.025
      ],
      [
        52.625,
        10.08
      ]
    ]
  },
  "S21": {
    "id": "line-s21",
    "ref": "S21",
    "name": "Express-S-Bahn S21",
    "type": "sbahn",
    "color": "#3b82f6",
    "from": "Barsinghausen",
    "to": "Hannover Hbf",
    "stops": [
      "Barsinghausen",
      "Wennigsen (Deister)",
      "Weetzen",
      "Hannover-Linden/Fischerhof",
      "Hannover Bismarckstraße",
      "Hannover Hbf"
    ],
    "coordinates": [
      [
        52.302,
        9.46
      ],
      [
        52.275,
        9.61
      ],
      [
        52.305,
        9.64
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.358,
        9.761
      ],
      [
        52.3768,
        9.7408
      ]
    ]
  },
  "S51": {
    "id": "line-s51",
    "ref": "S51",
    "name": "Express-S-Bahn S51",
    "type": "sbahn",
    "color": "#14b8a6",
    "from": "Hameln",
    "to": "Hannover Hbf / Seelze",
    "stops": [
      "Hameln",
      "Springe",
      "Hannover-Linden/Fischerhof",
      "Hannover Bismarckstraße",
      "Hannover Hbf",
      "Seelze"
    ],
    "coordinates": [
      [
        52.105,
        9.365
      ],
      [
        52.21,
        9.555
      ],
      [
        52.3485,
        9.723
      ],
      [
        52.358,
        9.761
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.395,
        9.6
      ]
    ]
  },
  "RE1": {
    "id": "line-re1",
    "ref": "RE1",
    "name": "Regional-Express RE1 (DB Regio)",
    "type": "sbahn",
    "color": "#ef4444",
    "from": "Norddeich Mole",
    "to": "Hannover Hbf",
    "stops": [
      "Norddeich Mole",
      "Norden",
      "Emden Hbf",
      "Leer (Ostfriesl)",
      "Oldenburg (Oldb) Hbf",
      "Hude",
      "Delmenhorst",
      "Bremen Hbf",
      "Achim",
      "Verden (Aller)",
      "Nienburg (Weser)",
      "Neustadt am Rübenberge",
      "Wunstorf",
      "Hannover Hbf"
    ],
    "coordinates": [
      [
        53.625,
        7.155
      ],
      [
        53.595,
        7.205
      ],
      [
        53.365,
        7.215
      ],
      [
        53.235,
        7.465
      ],
      [
        53.145,
        8.225
      ],
      [
        53.115,
        8.46
      ],
      [
        53.05,
        8.63
      ],
      [
        53.085,
        8.815
      ],
      [
        53.01,
        9.03
      ],
      [
        52.925,
        9.23
      ],
      [
        52.64,
        9.22
      ],
      [
        52.505,
        9.46
      ],
      [
        52.42,
        9.43
      ],
      [
        52.3768,
        9.7408
      ]
    ]
  },
  "RE2": {
    "id": "line-re2",
    "ref": "RE2",
    "name": "Regional-Express RE2 (metronom)",
    "type": "sbahn",
    "color": "#0284c7",
    "from": "Göttingen",
    "to": "Uelzen",
    "stops": [
      "Göttingen",
      "Nörten-Hardenberg",
      "Northeim (Han)",
      "Einbeck Salzderhelden",
      "Kreiensen",
      "Alfeld (Leine)",
      "Banteln",
      "Elze (Han)",
      "Nordstemmen",
      "Sarstedt",
      "Hannover Hbf",
      "Langenhagen Mitte",
      "Großburgwedel",
      "Celle",
      "Eschede",
      "Unterlüß",
      "Suderburg",
      "Uelzen"
    ],
    "coordinates": [
      [
        51.535,
        9.925
      ],
      [
        51.63,
        9.94
      ],
      [
        51.705,
        10.005
      ],
      [
        51.8,
        9.91
      ],
      [
        51.855,
        9.965
      ],
      [
        51.985,
        9.825
      ],
      [
        52.07,
        9.755
      ],
      [
        52.12,
        9.74
      ],
      [
        52.16,
        9.78
      ],
      [
        52.238,
        9.822
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.443,
        9.735
      ],
      [
        52.495,
        9.865
      ],
      [
        52.625,
        10.08
      ],
      [
        52.73,
        10.245
      ],
      [
        52.85,
        10.295
      ],
      [
        52.9,
        10.45
      ],
      [
        52.965,
        10.555
      ]
    ]
  },
  "RE3": {
    "id": "line-re3",
    "ref": "RE3",
    "name": "Regional-Express RE3 (metronom Hauptachse)",
    "type": "sbahn",
    "color": "#eab308",
    "from": "Hannover Hbf",
    "to": "Hamburg Hbf",
    "stops": [
      "Hannover Hbf",
      "Langenhagen Mitte",
      "Großburgwedel",
      "Celle",
      "Eschede",
      "Unterlüß",
      "Suderburg",
      "Uelzen",
      "Bad Bevensen",
      "Bienenbüttel",
      "Lüneburg",
      "Winsen (Luhe)",
      "Hamburg-Harburg",
      "Hamburg Hbf"
    ],
    "coordinates": [
      [
        52.3768,
        9.7408
      ],
      [
        52.443,
        9.735
      ],
      [
        52.495,
        9.865
      ],
      [
        52.625,
        10.08
      ],
      [
        52.73,
        10.245
      ],
      [
        52.85,
        10.295
      ],
      [
        52.9,
        10.45
      ],
      [
        52.965,
        10.555
      ],
      [
        53.08,
        10.585
      ],
      [
        53.14,
        10.49
      ],
      [
        53.25,
        10.415
      ],
      [
        53.36,
        10.215
      ],
      [
        53.4562,
        9.9912
      ],
      [
        53.5531,
        10.0067
      ]
    ]
  },
  "RE10": {
    "id": "line-re10",
    "ref": "RE10",
    "name": "Regional-Express RE10 (erixx)",
    "type": "sbahn",
    "color": "#10b981",
    "from": "Hannover Hbf",
    "to": "Bad Harzburg",
    "stops": [
      "Hannover Hbf",
      "Sarstedt",
      "Hildesheim Hbf",
      "Hildesheim Ost",
      "Groß Düngen",
      "Derneburg (Han)",
      "Baddeckenstedt",
      "Salzgitter-Ringelheim",
      "Goslar",
      "Bad Harzburg"
    ],
    "coordinates": [
      [
        52.3768,
        9.7408
      ],
      [
        52.238,
        9.822
      ],
      [
        52.158,
        9.952
      ],
      [
        52.15,
        9.97
      ],
      [
        52.1,
        10.02
      ],
      [
        52.095,
        10.13
      ],
      [
        52.085,
        10.18
      ],
      [
        52.035,
        10.315
      ],
      [
        51.905,
        10.43
      ],
      [
        51.88,
        10.56
      ]
    ]
  },
  "RE30": {
    "id": "line-re30",
    "ref": "RE30",
    "name": "Regional-Express RE30 (enno)",
    "type": "sbahn",
    "color": "#ec4899",
    "from": "Hannover Hbf",
    "to": "Wolfsburg Hbf",
    "stops": [
      "Hannover Hbf",
      "Lehrte",
      "Immensen-Arpke",
      "Dollbergen",
      "Dedenhausen",
      "Meinersen",
      "Gifhorn",
      "Calberlah",
      "Fallersleben",
      "Wolfsburg Hbf"
    ],
    "coordinates": [
      [
        52.3768,
        9.7408
      ],
      [
        52.373,
        9.978
      ],
      [
        52.395,
        10.075
      ],
      [
        52.405,
        10.17
      ],
      [
        52.425,
        10.23
      ],
      [
        52.465,
        10.355
      ],
      [
        52.485,
        10.54
      ],
      [
        52.425,
        10.615
      ],
      [
        52.418,
        10.71
      ],
      [
        52.428,
        10.785
      ]
    ]
  },
  "RE60": {
    "id": "line-re60",
    "ref": "RE60",
    "name": "Regional-Express RE60 (WestfalenBahn)",
    "type": "sbahn",
    "color": "#ef4444",
    "from": "Braunschweig Hbf",
    "to": "Rheine",
    "stops": [
      "Braunschweig Hbf",
      "Peine",
      "Lehrte",
      "Hannover Hbf",
      "Wunstorf",
      "Haste",
      "Stadthagen",
      "Bückeburg",
      "Minden (Westf)",
      "Löhne (Westf)",
      "Osnabrück Hbf",
      "Rheine"
    ],
    "coordinates": [
      [
        52.252,
        10.54
      ],
      [
        52.32,
        10.235
      ],
      [
        52.373,
        9.978
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.42,
        9.43
      ],
      [
        52.38,
        9.39
      ],
      [
        52.325,
        9.21
      ],
      [
        52.261,
        9.05
      ],
      [
        52.29,
        8.935
      ],
      [
        52.2,
        8.715
      ],
      [
        52.275,
        8.06
      ],
      [
        52.28,
        7.44
      ]
    ]
  },
  "RE70": {
    "id": "line-re70",
    "ref": "RE70",
    "name": "Regional-Express RE70 (WestfalenBahn)",
    "type": "sbahn",
    "color": "#f97316",
    "from": "Braunschweig Hbf",
    "to": "Bielefeld Hbf",
    "stops": [
      "Braunschweig Hbf",
      "Peine",
      "Lehrte",
      "Hannover Hbf",
      "Wunstorf",
      "Haste",
      "Stadthagen",
      "Bückeburg",
      "Minden (Westf)",
      "Porta Westfalica",
      "Bad Oeynhausen",
      "Löhne (Westf)",
      "Herford",
      "Bielefeld Hbf"
    ],
    "coordinates": [
      [
        52.252,
        10.54
      ],
      [
        52.32,
        10.235
      ],
      [
        52.373,
        9.978
      ],
      [
        52.3768,
        9.7408
      ],
      [
        52.42,
        9.43
      ],
      [
        52.38,
        9.39
      ],
      [
        52.325,
        9.21
      ],
      [
        52.261,
        9.05
      ],
      [
        52.29,
        8.935
      ],
      [
        52.245,
        8.92
      ],
      [
        52.205,
        8.805
      ],
      [
        52.2,
        8.715
      ],
      [
        52.12,
        8.67
      ],
      [
        52.03,
        8.535
      ]
    ]
  },
  "RB38": {
    "id": "line-rb38",
    "ref": "RB38",
    "name": "Regionalbahn RB38 Heidebahn (DB Regio)",
    "type": "sbahn",
    "color": "#84cc16",
    "from": "Hannover Hbf",
    "to": "Buchholz (Nordheide)",
    "stops": [
      "Hannover Hbf",
      "Langenhagen Mitte",
      "Mellendorf",
      "Lindwedel",
      "Schwarmstedt",
      "Hodenhagen",
      "Walsrode",
      "Bad Fallingbostel",
      "Dorfmark",
      "Soltau (Han)",
      "Schneverdingen",
      "Wintermoor",
      "Handeloh",
      "Büsenbachtal",
      "Holm-Seppensen",
      "Suerhop",
      "Buchholz (Nordheide)"
    ],
    "coordinates": [
      [
        52.3768,
        9.7408
      ],
      [
        52.443,
        9.735
      ],
      [
        52.548,
        9.742
      ],
      [
        52.61,
        9.68
      ],
      [
        52.68,
        9.615
      ],
      [
        52.76,
        9.595
      ],
      [
        52.86,
        9.595
      ],
      [
        52.87,
        9.705
      ],
      [
        52.905,
        9.755
      ],
      [
        52.985,
        9.845
      ],
      [
        53.115,
        9.79
      ],
      [
        53.18,
        9.835
      ],
      [
        53.245,
        9.825
      ],
      [
        53.265,
        9.835
      ],
      [
        53.295,
        9.855
      ],
      [
        53.315,
        9.865
      ],
      [
        53.325,
        9.875
      ]
    ]
  }
};

export const HAMBURG_TRANSIT_ROUTES: Record<string, TransitLineRoute> = {
  "4": {
    "id": "hh-line-mb4",
    "ref": "4",
    "name": "Metrobus 4",
    "type": "bus",
    "color": "#f97316",
    "from": "Wildacker",
    "to": "Hauptbahnhof / ZOB",
    "stops": [
      "Wildacker",
      "Eidelstedter Platz",
      "Stellingen",
      "Osterstraße",
      "Schlump",
      "Dammtor Bahnhof",
      "Jungfernstieg",
      "Hauptbahnhof / ZOB"
    ],
    "coordinates": [
      [
        53.612,
        9.885
      ],
      [
        53.605,
        9.905
      ],
      [
        53.59,
        9.935
      ],
      [
        53.575,
        9.954
      ],
      [
        53.5678,
        9.9698
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.5534,
        9.993
      ],
      [
        53.5531,
        10.0067
      ]
    ]
  },
  "5": {
    "id": "hh-line-mb5",
    "ref": "5",
    "name": "Metrobus 5 (Europas meistgenutzte Buslinie)",
    "type": "bus",
    "color": "#84cc16",
    "from": "Burgwedel",
    "to": "Hauptbahnhof / ZOB",
    "stops": [
      "Burgwedel",
      "Niendorf Markt",
      "Nedderfeld",
      "Gärtnerstraße",
      "Hoheluftbrücke",
      "Bezirksamt Eimsbüttel",
      "Grindelhof",
      "Dammtor Bahnhof",
      "Gänsemarkt",
      "Jungfernstieg",
      "Hauptbahnhof / ZOB"
    ],
    "coordinates": [
      [
        53.645,
        9.915
      ],
      [
        53.62,
        9.95
      ],
      [
        53.598,
        9.97
      ],
      [
        53.585,
        9.975
      ],
      [
        53.578,
        9.976
      ],
      [
        53.571,
        9.98
      ],
      [
        53.566,
        9.984
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.5555,
        9.987
      ],
      [
        53.5534,
        9.993
      ],
      [
        53.5531,
        10.0067
      ]
    ]
  },
  "6": {
    "id": "hh-line-mb6",
    "ref": "6",
    "name": "Metrobus 6",
    "type": "bus",
    "color": "#3b82f6",
    "from": "Borgweg (Stadtpark)",
    "to": "Feldstraße (Heiligengeistfeld)",
    "stops": [
      "Borgweg",
      "Mühlenkamp / Hofweg",
      "Hauptbahnhof",
      "Speicherstadt",
      "Landungsbrücken",
      "Feldstraße"
    ],
    "coordinates": [
      [
        53.591,
        10.015
      ],
      [
        53.578,
        10.012
      ],
      [
        53.5531,
        10.0067
      ],
      [
        53.544,
        9.998
      ],
      [
        53.5458,
        9.9692
      ],
      [
        53.556,
        9.968
      ]
    ]
  },
  "17": {
    "id": "hh-line-mb17",
    "ref": "17",
    "name": "Metrobus 17",
    "type": "bus",
    "color": "#8b5cf6",
    "from": "U Berne",
    "to": "Hauptbahnhof / ZOB",
    "stops": [
      "Berne",
      "Farmsen",
      "Wandsbek Markt",
      "Hauptbahnhof / ZOB"
    ],
    "coordinates": [
      [
        53.635,
        10.145
      ],
      [
        53.608,
        10.118
      ],
      [
        53.5718,
        10.0682
      ],
      [
        53.5531,
        10.0067
      ]
    ]
  },
  "19": {
    "id": "hh-line-mb19",
    "ref": "19",
    "name": "Metrobus 19",
    "type": "bus",
    "color": "#14b8a6",
    "from": "Alsterdorf",
    "to": "Hauptbahnhof / ZOB",
    "stops": [
      "Alsterdorf",
      "Winterhuder Marktplatz",
      "Harvestehude",
      "Dammtor Bahnhof",
      "Hauptbahnhof / ZOB"
    ],
    "coordinates": [
      [
        53.608,
        10.022
      ],
      [
        53.595,
        9.995
      ],
      [
        53.578,
        9.99
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.5531,
        10.0067
      ]
    ]
  },
  "61": {
    "id": "hh-line-f61",
    "ref": "61",
    "name": "HADAG Fähre 61",
    "type": "tram",
    "color": "#0284c7",
    "from": "Landungsbrücken (Brücke 2)",
    "to": "Neuhof (Köhlbrand)",
    "stops": [
      "Landungsbrücken",
      "Altona Fischmarkt",
      "Dockland",
      "Waltershof",
      "Neuhof"
    ],
    "coordinates": [
      [
        53.5458,
        9.9692
      ],
      [
        53.5445,
        9.938
      ],
      [
        53.5438,
        9.931
      ],
      [
        53.532,
        9.928
      ],
      [
        53.518,
        9.949
      ]
    ]
  },
  "62": {
    "id": "hh-line-f62",
    "ref": "62",
    "name": "HADAG Fähre 62",
    "type": "tram",
    "color": "#06b6d4",
    "from": "Landungsbrücken (Brücke 3)",
    "to": "Finkenwerder (Airbus)",
    "stops": [
      "Landungsbrücken",
      "Altona (Fischmarkt)",
      "Dockland (Fischereihafen)",
      "Övelgönne (Museumshafen)",
      "Bubendey-Ufer",
      "Finkenwerder"
    ],
    "coordinates": [
      [
        53.5458,
        9.9692
      ],
      [
        53.5445,
        9.938
      ],
      [
        53.5438,
        9.931
      ],
      [
        53.543,
        9.914
      ],
      [
        53.541,
        9.895
      ],
      [
        53.542,
        9.873
      ]
    ]
  },
  "72": {
    "id": "hh-line-f72",
    "ref": "72",
    "name": "HADAG Fähre 72",
    "type": "tram",
    "color": "#f59e0b",
    "from": "Landungsbrücken (Brücke 1)",
    "to": "Elbphilharmonie (Kaiserkai)",
    "stops": [
      "Landungsbrücken",
      "Arningstraße",
      "Elbphilharmonie"
    ],
    "coordinates": [
      [
        53.5458,
        9.9692
      ],
      [
        53.539,
        9.975
      ],
      [
        53.5425,
        9.9835
      ]
    ]
  },
  "73": {
    "id": "hh-line-f73",
    "ref": "73",
    "name": "HADAG Fähre 73",
    "type": "tram",
    "color": "#10b981",
    "from": "Landungsbrücken (Brücke 1)",
    "to": "Ernst-August-Schleuse",
    "stops": [
      "Landungsbrücken",
      "Theater im Hafen",
      "Argentinienbrücke",
      "Ernst-August-Schleuse"
    ],
    "coordinates": [
      [
        53.5458,
        9.9692
      ],
      [
        53.5395,
        9.974
      ],
      [
        53.531,
        9.978
      ],
      [
        53.525,
        9.982
      ]
    ]
  },
  "75": {
    "id": "hh-line-f75",
    "ref": "75",
    "name": "HADAG Fähre 75",
    "type": "tram",
    "color": "#ec4899",
    "from": "Landungsbrücken",
    "to": "Steinwerder",
    "stops": [
      "Landungsbrücken",
      "Steinwerder (Alter Elbtunnel)"
    ],
    "coordinates": [
      [
        53.5458,
        9.9692
      ],
      [
        53.5385,
        9.967
      ]
    ]
  },
  "U1": {
    "id": "hh-line-u1",
    "ref": "U1",
    "name": "U-Bahn U1",
    "type": "subway",
    "color": "#0284c7",
    "from": "Norderstedt Mitte",
    "to": "Großhansdorf / Ohlstedt",
    "stops": [
      "Norderstedt Mitte",
      "Garstedt",
      "Ochsenzoll",
      "Fuhlsbüttel Nord",
      "Fuhlsbüttel",
      "Klein Borstel",
      "Ohlsdorf",
      "Sengelmannstraße",
      "Alsterdorf",
      "Lattenkamp",
      "Hudtwalckerstraße",
      "Kellinghusenstraße",
      "Klosterstern",
      "Hallerstraße",
      "Stephansplatz",
      "Jungfernstieg",
      "Meßberg",
      "Steinstraße",
      "Hauptbahnhof Süd",
      "Lohmühlenstraße",
      "Lübecker Straße",
      "Wartenau",
      "Ritterstraße",
      "Wandsbeker Chaussee",
      "Wandsbek Markt",
      "Straßburger Straße",
      "Alter Teichweg",
      "Wandsbek-Gartenstadt",
      "Trabrennbahn",
      "Farmsen",
      "Berne",
      "Volksdorf",
      "Großhansdorf"
    ],
    "coordinates": [
      [
        53.7067,
        9.9908
      ],
      [
        53.682,
        9.998
      ],
      [
        53.665,
        10.007
      ],
      [
        53.6402,
        10.021
      ],
      [
        53.63,
        10.027
      ],
      [
        53.6205,
        10.0325
      ],
      [
        53.608,
        10.022
      ],
      [
        53.598,
        10.015
      ],
      [
        53.593,
        9.998
      ],
      [
        53.5885,
        9.991
      ],
      [
        53.581,
        9.988
      ],
      [
        53.571,
        9.991
      ],
      [
        53.5585,
        9.9885
      ],
      [
        53.5534,
        9.993
      ],
      [
        53.548,
        10.001
      ],
      [
        53.5515,
        10.0075
      ],
      [
        53.556,
        10.019
      ],
      [
        53.559,
        10.029
      ],
      [
        53.565,
        10.045
      ],
      [
        53.5718,
        10.0682
      ],
      [
        53.582,
        10.075
      ],
      [
        53.592,
        10.075
      ],
      [
        53.608,
        10.118
      ],
      [
        53.635,
        10.145
      ],
      [
        53.652,
        10.165
      ],
      [
        53.664,
        10.288
      ]
    ]
  },
  "U2": {
    "id": "hh-line-u2",
    "ref": "U2",
    "name": "U-Bahn U2",
    "type": "subway",
    "color": "#dc2626",
    "from": "Niendorf Nord",
    "to": "Mümmelmannsberg",
    "stops": [
      "Niendorf Nord",
      "Schippelsweg",
      "Joachim-Mähl-Straße",
      "Niendorf Markt",
      "Hagendeel",
      "Hagenbecks Tierpark",
      "Lutterothstraße",
      "Osterstraße",
      "Emilienstraße",
      "Christuskirche",
      "Schlump",
      "Messehallen",
      "Gänsemarkt",
      "Jungfernstieg",
      "Hauptbahnhof Nord",
      "Berliner Tor",
      "Burgstraße",
      "Hammer Kirche",
      "Rauhes Haus",
      "Horner Rennbahn",
      "Legienstraße",
      "Billstedt",
      "Merkenstraße",
      "Steinfurther Allee",
      "Mümmelmannsberg"
    ],
    "coordinates": [
      [
        53.6285,
        9.949
      ],
      [
        53.62,
        9.95
      ],
      [
        53.608,
        9.951
      ],
      [
        53.593,
        9.943
      ],
      [
        53.584,
        9.947
      ],
      [
        53.575,
        9.954
      ],
      [
        53.5678,
        9.9698
      ],
      [
        53.558,
        9.976
      ],
      [
        53.5555,
        9.987
      ],
      [
        53.5534,
        9.993
      ],
      [
        53.554,
        10.007
      ],
      [
        53.5528,
        10.0245
      ],
      [
        53.5545,
        10.042
      ],
      [
        53.555,
        10.057
      ],
      [
        53.554,
        10.082
      ],
      [
        53.541,
        10.107
      ],
      [
        53.535,
        10.132
      ],
      [
        53.528,
        10.151
      ]
    ]
  },
  "U3": {
    "id": "hh-line-u3",
    "ref": "U3",
    "name": "U-Bahn U3 (Ring)",
    "type": "subway",
    "color": "#eab308",
    "from": "Barmbek",
    "to": "Barmbek (Ring via Hafen & Viadukt)",
    "stops": [
      "Barmbek",
      "Dehnhaide",
      "Hamburger Straße",
      "Mundsburg",
      "Uhlandstraße",
      "Lübecker Straße",
      "Berliner Tor",
      "Hauptbahnhof Süd",
      "Mönckebergstraße",
      "Rathaus",
      "Rödingsmarkt",
      "Baumwall (Elbphilharmonie)",
      "Landungsbrücken",
      "St. Pauli",
      "Feldstraße",
      "Sternschanze",
      "Schlump",
      "Hoheluftbrücke",
      "Eppendorfer Baum",
      "Kellinghusenstraße",
      "Sierichstraße",
      "Borgweg",
      "Saarlandstraße",
      "Barmbek"
    ],
    "coordinates": [
      [
        53.587,
        10.045
      ],
      [
        53.578,
        10.038
      ],
      [
        53.57,
        10.03
      ],
      [
        53.562,
        10.025
      ],
      [
        53.559,
        10.029
      ],
      [
        53.5528,
        10.0245
      ],
      [
        53.5515,
        10.0075
      ],
      [
        53.551,
        10.001
      ],
      [
        53.55,
        9.993
      ],
      [
        53.5475,
        9.986
      ],
      [
        53.5435,
        9.981
      ],
      [
        53.5458,
        9.9692
      ],
      [
        53.5505,
        9.9665
      ],
      [
        53.556,
        9.968
      ],
      [
        53.563,
        9.9675
      ],
      [
        53.5678,
        9.9698
      ],
      [
        53.578,
        9.976
      ],
      [
        53.584,
        9.984
      ],
      [
        53.5885,
        9.991
      ],
      [
        53.59,
        10.005
      ],
      [
        53.591,
        10.015
      ],
      [
        53.589,
        10.03
      ],
      [
        53.587,
        10.045
      ]
    ]
  },
  "U4": {
    "id": "hh-line-u4",
    "ref": "U4",
    "name": "U-Bahn U4 (HafenCity Line)",
    "type": "subway",
    "color": "#06b6d4",
    "from": "Elbbrücken",
    "to": "Billstedt",
    "stops": [
      "Elbbrücken",
      "HafenCity Universität",
      "Überseequartier",
      "Jungfernstieg",
      "Hauptbahnhof Nord",
      "Berliner Tor",
      "Burgstraße",
      "Hammer Kirche",
      "Rauhes Haus",
      "Horner Rennbahn",
      "Legienstraße",
      "Billstedt"
    ],
    "coordinates": [
      [
        53.535,
        10.024
      ],
      [
        53.5395,
        10.0105
      ],
      [
        53.541,
        9.996
      ],
      [
        53.5534,
        9.993
      ],
      [
        53.554,
        10.007
      ],
      [
        53.5528,
        10.0245
      ],
      [
        53.5545,
        10.042
      ],
      [
        53.555,
        10.057
      ],
      [
        53.554,
        10.082
      ],
      [
        53.541,
        10.107
      ]
    ]
  },
  "S1": {
    "id": "hh-line-s1",
    "ref": "S1",
    "name": "S-Bahn S1",
    "type": "sbahn",
    "color": "#10b981",
    "from": "Wedel (Holst)",
    "to": "Hamburg Airport / Poppenbüttel",
    "stops": [
      "Wedel",
      "Rissen",
      "Sülldorf",
      "Iserbrook",
      "Blankenese",
      "Hochkamp",
      "Klein Flottbek",
      "Othmarschen",
      "Bahrenfeld",
      "Hamburg-Altona",
      "Königstraße",
      "Reeperbahn",
      "Landungsbrücken",
      "Stadthausbrücke",
      "Jungfernstieg",
      "Hamburg Hbf",
      "Berliner Tor",
      "Landwehr",
      "Hasselbrook",
      "Wandsbeker Chaussee",
      "Friedrichsberg",
      "Barmbek",
      "Alte Wöhr",
      "Rübenkamp",
      "Ohlsdorf",
      "Hamburg Airport"
    ],
    "coordinates": [
      [
        53.581,
        9.705
      ],
      [
        53.578,
        9.755
      ],
      [
        53.575,
        9.79
      ],
      [
        53.5585,
        9.813
      ],
      [
        53.556,
        9.842
      ],
      [
        53.554,
        9.865
      ],
      [
        53.56,
        9.892
      ],
      [
        53.561,
        9.912
      ],
      [
        53.5527,
        9.9352
      ],
      [
        53.5495,
        9.957
      ],
      [
        53.5458,
        9.9692
      ],
      [
        53.551,
        9.985
      ],
      [
        53.5534,
        9.993
      ],
      [
        53.5531,
        10.0067
      ],
      [
        53.5528,
        10.0245
      ],
      [
        53.56,
        10.04
      ],
      [
        53.565,
        10.06
      ],
      [
        53.5718,
        10.0682
      ],
      [
        53.578,
        10.055
      ],
      [
        53.587,
        10.045
      ],
      [
        53.598,
        10.038
      ],
      [
        53.605,
        10.035
      ],
      [
        53.6205,
        10.0325
      ],
      [
        53.6325,
        10.0065
      ]
    ]
  },
  "S2": {
    "id": "hh-line-s2",
    "ref": "S2",
    "name": "S-Bahn S2 (Aktuell Gesamtausfall)",
    "type": "sbahn",
    "color": "#dc2626",
    "from": "Hamburg-Altona",
    "to": "Aumühle",
    "stops": [
      "Hamburg-Altona",
      "Holstenstraße",
      "Sternschanze",
      "Dammtor",
      "Hamburg Hbf",
      "Berliner Tor",
      "Rothenburgsort",
      "Tiefstack",
      "Billwerder-Moorfleet",
      "Mittlerer Landweg",
      "Allermöhe",
      "Nettelnburg",
      "Hamburg-Bergedorf",
      "Reinbek",
      "Wohltorf",
      "Aumühle"
    ],
    "coordinates": [
      [
        53.5527,
        9.9352
      ],
      [
        53.562,
        9.951
      ],
      [
        53.563,
        9.9675
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.5531,
        10.0067
      ],
      [
        53.5528,
        10.0245
      ],
      [
        53.5355,
        10.043
      ],
      [
        53.527,
        10.063
      ],
      [
        53.518,
        10.102
      ],
      [
        53.508,
        10.138
      ],
      [
        53.498,
        10.165
      ],
      [
        53.492,
        10.185
      ],
      [
        53.4892,
        10.2085
      ],
      [
        53.508,
        10.248
      ],
      [
        53.521,
        10.278
      ],
      [
        53.531,
        10.315
      ]
    ]
  },
  "S2EV": {
    "id": "hh-line-s2ev",
    "ref": "S2EV",
    "name": "Ersatzverkehr S2EV (Altona ⇄ Bergedorf)",
    "type": "bus",
    "color": "#ff8000",
    "from": "Hamburg-Altona",
    "to": "Hamburg-Bergedorf",
    "stops": [
      "Hamburg-Altona",
      "Holstenstraße",
      "Dammtor",
      "Hamburg Hbf / Steintorwall",
      "Berliner Tor",
      "Rothenburgsort",
      "Tiefstack",
      "Billwerder-Moorfleet",
      "Allermöhe",
      "Nettelnburg",
      "Hamburg-Bergedorf"
    ],
    "coordinates": [
      [
        53.5527,
        9.9352
      ],
      [
        53.562,
        9.951
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.5531,
        10.0067
      ],
      [
        53.5528,
        10.0245
      ],
      [
        53.5355,
        10.043
      ],
      [
        53.527,
        10.063
      ],
      [
        53.518,
        10.102
      ],
      [
        53.498,
        10.165
      ],
      [
        53.492,
        10.185
      ],
      [
        53.4892,
        10.2085
      ]
    ]
  },
  "S3": {
    "id": "hh-line-s3",
    "ref": "S3",
    "name": "S-Bahn S3",
    "type": "sbahn",
    "color": "#8b5cf6",
    "from": "Pinneberg",
    "to": "Neugraben",
    "stops": [
      "Pinneberg",
      "Thesdorf",
      "Halstenbek",
      "Krupunder",
      "Elbgaustraße",
      "Eidelstedt",
      "Stellingen",
      "Langenfelde",
      "Diebsteich",
      "Hamburg-Altona",
      "Königstraße",
      "Reeperbahn",
      "Landungsbrücken",
      "Stadthausbrücke",
      "Jungfernstieg",
      "Hamburg Hbf",
      "Hammerbrook",
      "Elbbrücken",
      "Veddel",
      "Wilhelmsburg",
      "Hamburg-Harburg",
      "Harburg Rathaus",
      "Heimfeld",
      "Neuwiedenthal",
      "Neugraben"
    ],
    "coordinates": [
      [
        53.655,
        9.795
      ],
      [
        53.642,
        9.825
      ],
      [
        53.63,
        9.852
      ],
      [
        53.602,
        9.902
      ],
      [
        53.59,
        9.915
      ],
      [
        53.579,
        9.928
      ],
      [
        53.569,
        9.932
      ],
      [
        53.5527,
        9.9352
      ],
      [
        53.5458,
        9.9692
      ],
      [
        53.5534,
        9.993
      ],
      [
        53.5531,
        10.0067
      ],
      [
        53.545,
        10.022
      ],
      [
        53.5348,
        10.0235
      ],
      [
        53.521,
        10.018
      ],
      [
        53.498,
        10.006
      ],
      [
        53.4562,
        9.9912
      ],
      [
        53.459,
        9.979
      ],
      [
        53.468,
        9.952
      ],
      [
        53.472,
        9.855
      ]
    ]
  },
  "S5": {
    "id": "hh-line-s5",
    "ref": "S5",
    "name": "S-Bahn S5",
    "type": "sbahn",
    "color": "#059669",
    "from": "Elbgaustraße",
    "to": "Stade",
    "stops": [
      "Elbgaustraße",
      "Eidelstedt",
      "Stellingen",
      "Langenfelde",
      "Diebsteich",
      "Holstenstraße",
      "Sternschanze",
      "Dammtor",
      "Hamburg Hbf",
      "Hammerbrook",
      "Elbbrücken",
      "Veddel",
      "Wilhelmsburg",
      "Hamburg-Harburg",
      "Harburg Rathaus",
      "Neugraben",
      "Fischbek",
      "Neu Wulmstorf",
      "Buxtehude",
      "Neukloster",
      "Horneburg",
      "Dollern",
      "Agathenburg",
      "Stade"
    ],
    "coordinates": [
      [
        53.602,
        9.902
      ],
      [
        53.59,
        9.915
      ],
      [
        53.569,
        9.932
      ],
      [
        53.562,
        9.951
      ],
      [
        53.563,
        9.9675
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.5531,
        10.0067
      ],
      [
        53.545,
        10.022
      ],
      [
        53.5348,
        10.0235
      ],
      [
        53.521,
        10.018
      ],
      [
        53.498,
        10.006
      ],
      [
        53.4562,
        9.9912
      ],
      [
        53.459,
        9.979
      ],
      [
        53.472,
        9.855
      ],
      [
        53.47,
        9.805
      ],
      [
        53.468,
        9.755
      ],
      [
        53.471,
        9.696
      ],
      [
        53.498,
        9.635
      ],
      [
        53.508,
        9.585
      ],
      [
        53.535,
        9.545
      ],
      [
        53.562,
        9.515
      ],
      [
        53.595,
        9.482
      ]
    ]
  },
  "RE1": {
    "id": "hh-line-re1",
    "ref": "RE1",
    "name": "Regional-Express RE1 Hanse-Express",
    "type": "sbahn",
    "color": "#ef4444",
    "from": "Hamburg Hbf",
    "to": "Rostock Hbf",
    "stops": [
      "Hamburg Hbf",
      "Hamburg-Bergedorf",
      "Schwarzenbek",
      "Müssen",
      "Büchen",
      "Schwanheide",
      "Boizenburg (Elbe)",
      "Brahlstorf",
      "Pritzier",
      "Hagenow Land",
      "Schwerin Süd",
      "Schwerin Hbf",
      "Bad Kleinen",
      "Bützow",
      "Rostock Hbf"
    ],
    "coordinates": [
      [
        53.5531,
        10.0067
      ],
      [
        53.4892,
        10.2085
      ],
      [
        53.502,
        10.485
      ],
      [
        53.495,
        10.55
      ],
      [
        53.475,
        10.62
      ],
      [
        53.45,
        10.75
      ],
      [
        53.385,
        10.73
      ],
      [
        53.375,
        10.93
      ],
      [
        53.355,
        11.08
      ],
      [
        53.435,
        11.2
      ],
      [
        53.585,
        11.41
      ],
      [
        53.635,
        11.415
      ],
      [
        53.775,
        11.47
      ],
      [
        53.845,
        11.98
      ],
      [
        54.08,
        12.13
      ]
    ]
  },
  "RE3": {
    "id": "hh-line-re3",
    "ref": "RE3",
    "name": "Regional-Express RE3 (metronom)",
    "type": "sbahn",
    "color": "#eab308",
    "from": "Hamburg Hbf",
    "to": "Uelzen / Hannover Hbf",
    "stops": [
      "Hamburg Hbf",
      "Hamburg-Harburg",
      "Winsen (Luhe)",
      "Lüneburg",
      "Bienenbüttel",
      "Bad Bevensen",
      "Uelzen"
    ],
    "coordinates": [
      [
        53.5531,
        10.0067
      ],
      [
        53.4562,
        9.9912
      ],
      [
        53.36,
        10.215
      ],
      [
        53.25,
        10.415
      ],
      [
        53.14,
        10.49
      ],
      [
        53.08,
        10.585
      ],
      [
        52.965,
        10.555
      ]
    ]
  },
  "RE5": {
    "id": "hh-line-re5",
    "ref": "RE5",
    "name": "Regional-Express RE5 (Start Unterelbe)",
    "type": "sbahn",
    "color": "#0284c7",
    "from": "Hamburg Hbf",
    "to": "Cuxhaven",
    "stops": [
      "Hamburg Hbf",
      "Hamburg-Harburg",
      "Buxtehude",
      "Horneburg",
      "Stade",
      "Hammah",
      "Himmelpforten",
      "Hechthausen",
      "Hemmoor",
      "Wingst",
      "Cadenberge",
      "Otterndorf",
      "Cuxhaven"
    ],
    "coordinates": [
      [
        53.5531,
        10.0067
      ],
      [
        53.4562,
        9.9912
      ],
      [
        53.471,
        9.696
      ],
      [
        53.508,
        9.585
      ],
      [
        53.595,
        9.482
      ],
      [
        53.63,
        9.38
      ],
      [
        53.62,
        9.305
      ],
      [
        53.645,
        9.24
      ],
      [
        53.685,
        9.145
      ],
      [
        53.74,
        9.075
      ],
      [
        53.775,
        9.055
      ],
      [
        53.805,
        8.905
      ],
      [
        53.865,
        8.705
      ]
    ]
  },
  "RE7": {
    "id": "hh-line-re7",
    "ref": "RE7",
    "name": "Regional-Express RE7 (DB Regio)",
    "type": "sbahn",
    "color": "#10b981",
    "from": "Hamburg Hbf",
    "to": "Flensburg / Kiel Hbf",
    "stops": [
      "Hamburg Hbf",
      "Hamburg Dammtor",
      "Elmshorn",
      "Neumünster",
      "Rendsburg",
      "Schleswig",
      "Flensburg"
    ],
    "coordinates": [
      [
        53.5531,
        10.0067
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.755,
        9.655
      ],
      [
        54.075,
        9.985
      ],
      [
        54.305,
        9.67
      ],
      [
        54.51,
        9.545
      ],
      [
        54.775,
        9.435
      ]
    ]
  },
  "RE70": {
    "id": "hh-line-re70",
    "ref": "RE70",
    "name": "Regional-Express RE70 (DB Regio)",
    "type": "sbahn",
    "color": "#06b6d4",
    "from": "Hamburg Hbf",
    "to": "Kiel Hbf",
    "stops": [
      "Hamburg Hbf",
      "Hamburg Dammtor",
      "Elmshorn",
      "Wrist",
      "Brokstedt",
      "Neumünster",
      "Bordesholm",
      "Kiel Hbf"
    ],
    "coordinates": [
      [
        53.5531,
        10.0067
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.755,
        9.655
      ],
      [
        53.93,
        9.75
      ],
      [
        53.995,
        9.82
      ],
      [
        54.075,
        9.985
      ],
      [
        54.175,
        10.01
      ],
      [
        54.315,
        10.13
      ]
    ]
  },
  "RB31": {
    "id": "hh-line-rb31",
    "ref": "RB31",
    "name": "Regionalbahn RB31 (metronom)",
    "type": "sbahn",
    "color": "#f59e0b",
    "from": "Hamburg Hbf",
    "to": "Lüneburg",
    "stops": [
      "Hamburg Hbf",
      "Hamburg-Harburg",
      "Meckelfeld",
      "Maschen",
      "Stelle",
      "Ashausen",
      "Winsen (Luhe)",
      "Radbruch",
      "Bardowick",
      "Lüneburg"
    ],
    "coordinates": [
      [
        53.5531,
        10.0067
      ],
      [
        53.4562,
        9.9912
      ],
      [
        53.425,
        10.025
      ],
      [
        53.395,
        10.045
      ],
      [
        53.375,
        10.115
      ],
      [
        53.365,
        10.155
      ],
      [
        53.36,
        10.215
      ],
      [
        53.31,
        10.285
      ],
      [
        53.295,
        10.385
      ],
      [
        53.25,
        10.415
      ]
    ]
  },
  "RB61": {
    "id": "hh-line-rb61",
    "ref": "RB61",
    "name": "Regionalbahn RB61 (nordbahn)",
    "type": "sbahn",
    "color": "#3b82f6",
    "from": "Hamburg Hbf",
    "to": "Itzehoe",
    "stops": [
      "Hamburg Hbf",
      "Hamburg Dammtor",
      "Pinneberg",
      "Prisdorf",
      "Tornesch",
      "Elmshorn",
      "Herzhorn",
      "Glückstadt",
      "Krempe",
      "Kremperheide",
      "Itzehoe"
    ],
    "coordinates": [
      [
        53.5531,
        10.0067
      ],
      [
        53.5607,
        9.9895
      ],
      [
        53.655,
        9.795
      ],
      [
        53.68,
        9.765
      ],
      [
        53.7,
        9.715
      ],
      [
        53.755,
        9.655
      ],
      [
        53.79,
        9.485
      ],
      [
        53.795,
        9.425
      ],
      [
        53.835,
        9.495
      ],
      [
        53.885,
        9.49
      ],
      [
        53.925,
        9.515
      ]
    ]
  },
  "RB81": {
    "id": "hh-line-rb81",
    "ref": "RB81",
    "name": "Regionalbahn RB81 (DB Regio)",
    "type": "sbahn",
    "color": "#8b5cf6",
    "from": "Hamburg Hbf",
    "to": "Bad Oldesloe",
    "stops": [
      "Hamburg Hbf",
      "Hamburg-Hasselbrook",
      "Hamburg-Tonndorf",
      "Hamburg-Rahlstedt",
      "Ahrensburg",
      "Ahrensburg-Gartenholz",
      "Bargteheide",
      "Kupfermühle",
      "Bad Oldesloe"
    ],
    "coordinates": [
      [
        53.5531,
        10.0067
      ],
      [
        53.565,
        10.06
      ],
      [
        53.585,
        10.115
      ],
      [
        53.605,
        10.155
      ],
      [
        53.675,
        10.235
      ],
      [
        53.695,
        10.255
      ],
      [
        53.725,
        10.265
      ],
      [
        53.775,
        10.335
      ],
      [
        53.81,
        10.375
      ]
    ]
  },
  "A1": {
    "id": "hh-line-a1",
    "ref": "A1",
    "name": "AKN Eisenbahn A1",
    "type": "sbahn",
    "color": "#f97316",
    "from": "Eidelstedt",
    "to": "Neumünster",
    "stops": [
      "Eidelstedt",
      "Eidelstedt Zentrum",
      "Hörgensweg",
      "Schnelsen",
      "Burgwedel",
      "Bönningstedt",
      "Hasloh",
      "Quickborn Süd",
      "Quickborn",
      "Ellerau",
      "Tanneneck",
      "Ulzburg Süd",
      "Henstedt-Ulzburg",
      "Kaltenkirchen",
      "Bad Bramstedt",
      "Neumünster"
    ],
    "coordinates": [
      [
        53.59,
        9.915
      ],
      [
        53.605,
        9.915
      ],
      [
        53.618,
        9.916
      ],
      [
        53.63,
        9.918
      ],
      [
        53.645,
        9.915
      ],
      [
        53.665,
        9.905
      ],
      [
        53.695,
        9.915
      ],
      [
        53.725,
        9.905
      ],
      [
        53.735,
        9.9
      ],
      [
        53.755,
        9.915
      ],
      [
        53.785,
        9.945
      ],
      [
        53.795,
        9.965
      ],
      [
        53.835,
        9.965
      ],
      [
        53.92,
        9.885
      ],
      [
        54.075,
        9.985
      ]
    ]
  },
  "A2": {
    "id": "hh-line-a2",
    "ref": "A2",
    "name": "AKN Eisenbahn A2",
    "type": "sbahn",
    "color": "#84cc16",
    "from": "Norderstedt Mitte",
    "to": "Ulzburg Süd",
    "stops": [
      "Norderstedt Mitte",
      "Moorbekhalle",
      "Friedrichsgabe",
      "Quickborner Straße",
      "Ulzburg Süd"
    ],
    "coordinates": [
      [
        53.7067,
        9.9908
      ],
      [
        53.718,
        9.985
      ],
      [
        53.735,
        9.98
      ],
      [
        53.755,
        9.97
      ],
      [
        53.785,
        9.945
      ]
    ]
  },
  "A3": {
    "id": "hh-line-a3",
    "ref": "A3",
    "name": "AKN Eisenbahn A3",
    "type": "sbahn",
    "color": "#06b6d4",
    "from": "Elmshorn",
    "to": "Ulzburg Süd",
    "stops": [
      "Elmshorn",
      "Sparrieshoop",
      "Offenau",
      "Barmstedt",
      "Barmstedt Brunnenstraße",
      "Voßloch",
      "Bokholt",
      "Barmstedt",
      "Henstedt-Ulzburg",
      "Ulzburg Süd"
    ],
    "coordinates": [
      [
        53.755,
        9.655
      ],
      [
        53.775,
        9.685
      ],
      [
        53.785,
        9.715
      ],
      [
        53.79,
        9.775
      ],
      [
        53.805,
        9.835
      ],
      [
        53.795,
        9.965
      ],
      [
        53.785,
        9.945
      ]
    ]
  },
  "X35": {
    "id": "hh-line-x35",
    "ref": "X35",
    "name": "Expressbus X35",
    "type": "bus",
    "color": "#ef4444",
    "from": "Groß Borstel",
    "to": "Jenfeld-Zentrum",
    "stops": [
      "Groß Borstel",
      "Eppendorfer Marktplatz",
      "Messehallen",
      "Gänsemarkt",
      "Hauptbahnhof / Spitalerstraße",
      "Wandsbek Markt",
      "Jenfeld-Zentrum"
    ],
    "coordinates": [
      [
        53.61,
        9.975
      ],
      [
        53.592,
        9.985
      ],
      [
        53.558,
        9.976
      ],
      [
        53.5555,
        9.987
      ],
      [
        53.5531,
        10.0067
      ],
      [
        53.5718,
        10.0682
      ],
      [
        53.575,
        10.135
      ]
    ]
  }
};
