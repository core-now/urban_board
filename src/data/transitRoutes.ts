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
      "Großburgwedel (Region Hannover)",
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
      "Großburgwedel (Region Hannover)",
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
      "Großburgwedel (Region Hannover)",
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
"1": {
    "id": "hh-bus-1",
    "ref": "1",
    "name": "Metrobus 1",
    "type": "bus",
    "color": "#ff4d00",
    "from": "S Rissen",
    "to": "Bf. Altona",
    "stops": [
      "S Rissen",
      "Schule Marschweg",
      "Kl\u00f6vensteenweg (S\u00fcd)",
      "Suurheid",
      "Asklepios Westklinikum (West)",
      "Asklepios Westklinikum (Mitte)",
      "Asklepios Westklinikum (Ost)",
      "Bahn\u00fcbergang Sieversst\u00fccken",
      "Sieversst\u00fccken",
      "Wittland (S S\u00fclldorf)",
      "Anne-Frank-Stra\u00dfe",
      "Kr\u00e4henhorst",
      "Karstenstra\u00dfe",
      "S Blankenese",
      "M\u00fchlenberg",
      "Frahmstra\u00dfe",
      "Grotefendweg",
      "Darbovenstieg",
      "S\u00fclldorfer Landstra\u00dfe",
      "Pieperweg",
      "Holtbarg",
      "Schenefelder Holt",
      "Heerbrook",
      "Am Botterbarg",
      "Isfeldstra\u00dfe",
      "Langelohstra\u00dfe (Nord)",
      "Knabeweg",
      "Elbe-Einkaufszentrum",
      "Windm\u00fchlenweg",
      "Flottbeker Drift",
      "Zum H\u00fcnengrab (DESY)",
      "Stutsmoor",
      "Trabrennbahn Bahrenfeld",
      "Ebertallee",
      "B\u00f6cklinstra\u00dfe",
      "S Othmarschen",
      "R\u00f6pers Weide",
      "Behringstra\u00dfe (AK Altona)",
      "AK Altona (Eingang)",
      "Behringstra\u00dfe (AK Altona)",
      "Griegstra\u00dfe",
      "Kreuzkirche Ottensen",
      "Bleickenallee (Kinderkrankenhaus)",
      "Gro\u00dfe Brunnenstra\u00dfe",
      "Bahrenfelder Stra\u00dfe",
      "Bf. Altona"
    ],
    "coordinates": [
      [
        53.58246,
        9.75883
      ],
      [
        53.58498,
        9.76108
      ],
      [
        53.58242,
        9.76422
      ],
      [
        53.58285,
        9.76855
      ],
      [
        53.5823,
        9.7736
      ],
      [
        53.58266,
        9.77891
      ],
      [
        53.58199,
        9.78215
      ],
      [
        53.58127,
        9.78518
      ],
      [
        53.58051,
        9.78567
      ],
      [
        53.57944,
        9.79347
      ],
      [
        53.57052,
        9.78923
      ],
      [
        53.56837,
        9.79266
      ],
      [
        53.56543,
        9.80144
      ],
      [
        53.56347,
        9.81476
      ],
      [
        53.56068,
        9.8231
      ],
      [
        53.56416,
        9.82627
      ],
      [
        53.56657,
        9.82739
      ],
      [
        53.57223,
        9.82442
      ],
      [
        53.57692,
        9.82326
      ],
      [
        53.58029,
        9.82311
      ],
      [
        53.58371,
        9.82249
      ],
      [
        53.5829,
        9.82884
      ],
      [
        53.57956,
        9.82996
      ],
      [
        53.57478,
        9.83495
      ],
      [
        53.57359,
        9.83787
      ],
      [
        53.57279,
        9.8477
      ],
      [
        53.57191,
        9.85585
      ],
      [
        53.57172,
        9.86262
      ],
      [
        53.57114,
        9.87003
      ],
      [
        53.57112,
        9.87664
      ],
      [
        53.57215,
        9.88142
      ],
      [
        53.57273,
        9.88682
      ],
      [
        53.57381,
        9.89231
      ],
      [
        53.56718,
        9.88826
      ],
      [
        53.56304,
        9.88709
      ],
      [
        53.55889,
        9.88711
      ],
      [
        53.55717,
        9.89345
      ],
      [
        53.55658,
        9.9011
      ],
      [
        53.55507,
        9.89831
      ],
      [
        53.55654,
        9.90188
      ],
      [
        53.55427,
        9.9104
      ],
      [
        53.55383,
        9.91635
      ],
      [
        53.551,
        9.91917
      ],
      [
        53.54997,
        9.92567
      ],
      [
        53.54953,
        9.92978
      ],
      [
        53.55155,
        9.93417
      ]
    ]
  },
  "10": {
    "id": "hh-bus-10",
    "ref": "10",
    "name": "Metrobus 10",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Grunewaldstra\u00dfe",
    "to": "U Wandsbek Markt",
    "stops": [
      "Grunewaldstra\u00dfe",
      "Glatzer Stra\u00dfe",
      "Bekkamp",
      "Bekkampsweg",
      "Jenfelder Stra\u00dfe",
      "Jenfeld-Zentrum",
      "Denksteinweg",
      "Schiffbeker Weg",
      "Am Hohen Feld",
      "Universit\u00e4t der Bundeswehr",
      "Osterkamp",
      "AK Wandsbek",
      "Bovestra\u00dfe",
      "Schatzmeisterstra\u00dfe",
      "Zieseni\u00dfstra\u00dfe",
      "U Wandsbek Markt"
    ],
    "coordinates": [
      [
        53.58193,
        10.15121
      ],
      [
        53.57958,
        10.14502
      ],
      [
        53.57626,
        10.14355
      ],
      [
        53.57504,
        10.13861
      ],
      [
        53.57414,
        10.13501
      ],
      [
        53.57117,
        10.13433
      ],
      [
        53.57113,
        10.13093
      ],
      [
        53.57108,
        10.12339
      ],
      [
        53.57107,
        10.11615
      ],
      [
        53.57041,
        10.10447
      ],
      [
        53.56968,
        10.09987
      ],
      [
        53.56873,
        10.09087
      ],
      [
        53.56889,
        10.08696
      ],
      [
        53.56714,
        10.07826
      ],
      [
        53.56765,
        10.07471
      ],
      [
        53.57204,
        10.06936
      ]
    ]
  },
  "11": {
    "id": "hh-bus-11",
    "ref": "11",
    "name": "Metrobus 11",
    "type": "bus",
    "color": "#ff4d00",
    "from": "U Wandsbek Markt",
    "to": "Sorenkoppel",
    "stops": [
      "U Wandsbek Markt",
      "Josephstra\u00dfe",
      "Kedenburgstra\u00dfe",
      "Birtstra\u00dfe",
      "Am Neumarkt 63",
      "Ziethenstra\u00dfe",
      "Schimmelmannstra\u00dfe (Mitte)",
      "Asserstieg",
      "Am Jenfelder Moor",
      "Albert-Schweitzer-Ring",
      "Kuehnstra\u00dfe",
      "K\u00f6penicker Stra\u00dfe",
      "Berliner Platz",
      "Potsdamer Stra\u00dfe",
      "H\u00fcllenkamp",
      "Kinderkrankenhaus Wilhelmstift",
      "Kielkoppelstra\u00dfe",
      "Geesthachter Weg",
      "Am Hegen",
      "Sorenkoppel"
    ],
    "coordinates": [
      [
        53.57188,
        10.06854
      ],
      [
        53.57267,
        10.07826
      ],
      [
        53.57497,
        10.08769
      ],
      [
        53.57535,
        10.09262
      ],
      [
        53.57565,
        10.09679
      ],
      [
        53.57679,
        10.1027
      ],
      [
        53.57327,
        10.10458
      ],
      [
        53.57284,
        10.10669
      ],
      [
        53.57626,
        10.11344
      ],
      [
        53.57941,
        10.1231
      ],
      [
        53.58189,
        10.12631
      ],
      [
        53.58447,
        10.13355
      ],
      [
        53.58397,
        10.14115
      ],
      [
        53.58612,
        10.14927
      ],
      [
        53.58754,
        10.15456
      ],
      [
        53.58946,
        10.1622
      ],
      [
        53.58943,
        10.16813
      ],
      [
        53.58849,
        10.17084
      ],
      [
        53.58908,
        10.18057
      ],
      [
        53.591,
        10.18512
      ]
    ]
  },
  "12": {
    "id": "hh-bus-12",
    "ref": "12",
    "name": "Metrobus 12",
    "type": "bus",
    "color": "#ff4d00",
    "from": "S Blankenese",
    "to": "Osterbrookplatz",
    "stops": [
      "S Blankenese",
      "M\u00fchlenberg",
      "Winckelmannstra\u00dfe",
      "Sieberlingstra\u00dfe",
      "Elbschlo\u00dfstra\u00dfe (Seegerichtshof)",
      "Teufelsbr\u00fcck (F\u00e4hre)",
      "Holztwiete",
      "Zedernweg",
      "Halbmondsweg",
      "Liebermannstra\u00dfe",
      "Hohenzollernring (S\u00fcd)",
      "Fischers Allee",
      "Rothestra\u00dfe",
      "Rathaus Altona",
      "Bf. Altona",
      "Bf. Altona",
      "Altonaer Poststra\u00dfe",
      "Gro\u00dfe Bergstra\u00dfe",
      "Bl\u00fccherstra\u00dfe",
      "S Reeperbahn",
      "Davidstra\u00dfe",
      "U St. Pauli",
      "Museum f\u00fcr Hamburgische Geschichte",
      "Handwerkskammer",
      "Johannes-Brahms-Platz",
      "U Stephansplatz",
      "Kunsthalle",
      "HBF/Spitalerstra\u00dfe",
      "U Steinstra\u00dfe (Deichtorplatz)",
      "Repsoldstra\u00dfe",
      "Albertstra\u00dfe",
      "S Hammerbrook (Nord)",
      "S Hammerbrook (S\u00fcd)",
      "S\u00fcderstra\u00dfe",
      "Ausschl\u00e4ger Weg (LBV)",
      "Luisenweg",
      "Schadesweg",
      "Osterbrookplatz"
    ],
    "coordinates": [
      [
        53.56347,
        9.81476
      ],
      [
        53.56068,
        9.8231
      ],
      [
        53.55516,
        9.83522
      ],
      [
        53.55027,
        9.84548
      ],
      [
        53.54901,
        9.85339
      ],
      [
        53.54761,
        9.86372
      ],
      [
        53.54704,
        9.87429
      ],
      [
        53.54653,
        9.88116
      ],
      [
        53.54644,
        9.88837
      ],
      [
        53.54597,
        9.89897
      ],
      [
        53.54602,
        9.91562
      ],
      [
        53.54809,
        9.9228
      ],
      [
        53.54773,
        9.92942
      ],
      [
        53.54779,
        9.93439
      ],
      [
        53.55155,
        9.93417
      ],
      [
        53.55178,
        9.93386
      ],
      [
        53.55003,
        9.93998
      ],
      [
        53.55117,
        9.94671
      ],
      [
        53.54924,
        9.95058
      ],
      [
        53.54966,
        9.95609
      ],
      [
        53.54943,
        9.9617
      ],
      [
        53.55001,
        9.97078
      ],
      [
        53.55027,
        9.97394
      ],
      [
        53.55327,
        9.97671
      ],
      [
        53.55499,
        9.97882
      ],
      [
        53.55808,
        9.98832
      ],
      [
        53.55497,
        10.0018
      ],
      [
        53.55244,
        10.00534
      ],
      [
        53.54961,
        10.00597
      ],
      [
        53.54823,
        10.01506
      ],
      [
        53.54885,
        10.01896
      ],
      [
        53.54784,
        10.02283
      ],
      [
        53.54524,
        10.02489
      ],
      [
        53.54548,
        10.03122
      ],
      [
        53.54768,
        10.03926
      ],
      [
        53.54817,
        10.0467
      ],
      [
        53.54761,
        10.05245
      ],
      [
        53.54711,
        10.05765
      ]
    ]
  },
  "13": {
    "id": "hh-bus-13",
    "ref": "13",
    "name": "Metrobus 13",
    "type": "bus",
    "color": "#ff4d00",
    "from": "S Veddel",
    "to": "Kirchdorf (S\u00fcd)",
    "stops": [
      "S Veddel",
      "Harburger Chaussee",
      "Werkcentrum Elbinsel",
      "Vogelh\u00fcttendeich",
      "St\u00fcbenplatz",
      "Mannesallee",
      "Veringstra\u00dfe (Mitte)",
      "Veringstra\u00dfe (S\u00fcd)",
      "Rotenh\u00e4user Stra\u00dfe (West)",
      "Mengestra\u00dfe",
      "Rathaus Wilhelmsburg",
      "Dratelnstra\u00dfe",
      "Inselpark",
      "S Wilhelmsburg",
      "Neuenfelder Stra\u00dfe (Schule)",
      "Kirchdorfer Stra\u00dfe (Museum Elbinsel)",
      "Karl-Arnold-Ring",
      "Kirchdorf (S\u00fcd)"
    ],
    "coordinates": [
      [
        53.521,
        10.01347
      ],
      [
        53.52075,
        10.00701
      ],
      [
        53.52,
        9.9983
      ],
      [
        53.51642,
        9.9926
      ],
      [
        53.51683,
        9.98745
      ],
      [
        53.51447,
        9.98714
      ],
      [
        53.5103,
        9.98662
      ],
      [
        53.50686,
        9.98616
      ],
      [
        53.50454,
        9.99188
      ],
      [
        53.50179,
        9.99155
      ],
      [
        53.49923,
        9.99694
      ],
      [
        53.49843,
        9.99986
      ],
      [
        53.4972,
        10.00407
      ],
      [
        53.4975,
        10.00704
      ],
      [
        53.49395,
        10.01244
      ],
      [
        53.49089,
        10.01898
      ],
      [
        53.48566,
        10.01727
      ],
      [
        53.48444,
        10.01932
      ]
    ]
  },
  "15": {
    "id": "hh-bus-15",
    "ref": "15",
    "name": "Metrobus 15",
    "type": "bus",
    "color": "#ff4d00",
    "from": "S Othmarschen",
    "to": "Alsterchaussee",
    "stops": [
      "S Othmarschen",
      "Emkendorfstra\u00dfe",
      "Reventlowstra\u00dfe",
      "Agathe-Lasch-Weg",
      "Ernst-August-Stra\u00dfe",
      "Wrangelpark",
      "Philosophenweg",
      "Hohenzollernring",
      "Fischers Allee",
      "Rothestra\u00dfe",
      "Rathaus Altona",
      "Bf. Altona",
      "Bf. Altona",
      "Gerichtstra\u00dfe",
      "Max-Brauer-Allee (Mitte)",
      "Sternbr\u00fccke",
      "Schulterblatt",
      "Weidenallee",
      "U Schlump",
      "Bundesstra\u00dfe",
      "Bezirksamt Eimsb\u00fcttel",
      "Parkallee",
      "U Hallerstra\u00dfe",
      "Alsterchaussee"
    ],
    "coordinates": [
      [
        53.55889,
        9.88711
      ],
      [
        53.55566,
        9.8906
      ],
      [
        53.55236,
        9.89094
      ],
      [
        53.55248,
        9.89348
      ],
      [
        53.54976,
        9.8981
      ],
      [
        53.54971,
        9.90173
      ],
      [
        53.54921,
        9.91026
      ],
      [
        53.54864,
        9.91631
      ],
      [
        53.54809,
        9.9228
      ],
      [
        53.54773,
        9.92942
      ],
      [
        53.54779,
        9.93439
      ],
      [
        53.55155,
        9.93417
      ],
      [
        53.55178,
        9.93386
      ],
      [
        53.5557,
        9.94322
      ],
      [
        53.5587,
        9.94987
      ],
      [
        53.56051,
        9.95359
      ],
      [
        53.56395,
        9.96083
      ],
      [
        53.56515,
        9.96512
      ],
      [
        53.56767,
        9.97107
      ],
      [
        53.56958,
        9.97487
      ],
      [
        53.57232,
        9.97841
      ],
      [
        53.57251,
        9.98364
      ],
      [
        53.57264,
        9.98929
      ],
      [
        53.57256,
        9.99388
      ]
    ]
  },
  "16": {
    "id": "hh-bus-16",
    "ref": "16",
    "name": "Metrobus 16",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Elbe-Einkaufszentrum",
    "to": "Rentenversicherung Nord",
    "stops": [
      "Elbe-Einkaufszentrum",
      "Ostermeyerstra\u00dfe",
      "Hemmingstedter Weg",
      "Bertha-Uhl-Kamp",
      "Flottbeker Kirche",
      "Kalckreuthweg (Mitte)",
      "Osdorfer Weg",
      "Bahrenfelder Marktplatz",
      "H\u00e4ndelstra\u00dfe",
      "S Bahrenfeld",
      "Gr\u00fcnebergstra\u00dfe",
      "Daimlerstra\u00dfe",
      "Zeisehallen",
      "Gro\u00dfe Rainstra\u00dfe",
      "Bf. Altona",
      "Altonaer Poststra\u00dfe",
      "Gro\u00dfe Bergstra\u00dfe",
      "Bl\u00fccherstra\u00dfe",
      "S Reeperbahn",
      "Davidstra\u00dfe",
      "U St. Pauli",
      "Michaeliskirche",
      "Domstra\u00dfe",
      "Speersort",
      "Jakobikirchhof",
      "HBF/Steintordamm",
      "Hauptbahnhof/ZOB",
      "B\u00f6ckmannstra\u00dfe",
      "U Lohm\u00fchlenstra\u00dfe",
      "U L\u00fcbecker Stra\u00dfe",
      "U Wartenau",
      "Richardstra\u00dfe",
      "Eilbeker Weg",
      "Maxstra\u00dfe",
      "Seumestra\u00dfe",
      "S Friedrichsberg",
      "Krausestra\u00dfe",
      "Stra\u00dfburger Platz",
      "U Stra\u00dfburger Stra\u00dfe",
      "Eulenkamp",
      "Friedrich-Ebert-Damm (West)",
      "Stephanstra\u00dfe",
      "Helbingtwiete",
      "Am Stadtrand",
      "Sylter Weg",
      "Rentenversicherung Nord"
    ],
    "coordinates": [
      [
        53.57172,
        9.86262
      ],
      [
        53.568,
        9.86638
      ],
      [
        53.56636,
        9.86625
      ],
      [
        53.56531,
        9.86956
      ],
      [
        53.56536,
        9.87824
      ],
      [
        53.56516,
        9.88829
      ],
      [
        53.56564,
        9.89484
      ],
      [
        53.56455,
        9.90178
      ],
      [
        53.5622,
        9.90571
      ],
      [
        53.55983,
        9.9102
      ],
      [
        53.55797,
        9.91467
      ],
      [
        53.55607,
        9.92133
      ],
      [
        53.55459,
        9.92735
      ],
      [
        53.55329,
        9.93162
      ],
      [
        53.55177,
        9.9348
      ],
      [
        53.55003,
        9.93998
      ],
      [
        53.55117,
        9.94671
      ],
      [
        53.54924,
        9.95058
      ],
      [
        53.54966,
        9.95609
      ],
      [
        53.54943,
        9.9617
      ],
      [
        53.55001,
        9.97078
      ],
      [
        53.54917,
        9.97851
      ],
      [
        53.54819,
        9.99466
      ],
      [
        53.54968,
        9.99743
      ],
      [
        53.55008,
        10.00289
      ],
      [
        53.55201,
        10.00773
      ],
      [
        53.55225,
        10.01129
      ],
      [
        53.55467,
        10.01486
      ],
      [
        53.5569,
        10.01993
      ],
      [
        53.56006,
        10.02878
      ],
      [
        53.56296,
        10.03326
      ],
      [
        53.5673,
        10.04091
      ],
      [
        53.56855,
        10.04356
      ],
      [
        53.57101,
        10.04883
      ],
      [
        53.573,
        10.05474
      ],
      [
        53.57652,
        10.05857
      ],
      [
        53.58009,
        10.05768
      ],
      [
        53.58094,
        10.06204
      ],
      [
        53.58246,
        10.0686
      ],
      [
        53.58328,
        10.07251
      ],
      [
        53.58494,
        10.07949
      ],
      [
        53.58636,
        10.08623
      ],
      [
        53.58777,
        10.09309
      ],
      [
        53.58907,
        10.09963
      ],
      [
        53.59024,
        10.10509
      ],
      [
        53.59195,
        10.10854
      ]
    ]
  },
  "18": {
    "id": "hh-bus-18",
    "ref": "18",
    "name": "Metrobus 18",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Hauptbahnhof/ZOB",
    "to": "Am St\u00fchm-S\u00fcd",
    "stops": [
      "Hauptbahnhof/ZOB",
      "HBF/Kirchenallee",
      "Gurlittstra\u00dfe",
      "AK St. Georg",
      "Graumannsweg",
      "Mundsburger Br\u00fccke",
      "U Mundsburg",
      "Beethovenstra\u00dfe",
      "Bartholom\u00e4us-Therme",
      "Biedermannplatz",
      "Brucknerstra\u00dfe (Arbeitsgerichte)",
      "U Saarlandstra\u00dfe",
      "Burmesterstra\u00dfe",
      "U S Barmbek",
      "Wachtelstra\u00dfe",
      "Habichtstra\u00dfe (Mitte)",
      "Heinrich-Helbing-Stra\u00dfe",
      "Bauernrosenweg",
      "Werner-Otto-Stra\u00dfe",
      "Rahnstra\u00dfe",
      "Steilshooper Allee",
      "Herthastra\u00dfe",
      "Bramfelder Dorfplatz",
      "Berner Chaussee",
      "N\u00fc\u00dflerkamp",
      "Hohnerkamp (Mitte)",
      "Gumbinner Kehre",
      "Am St\u00fchm-S\u00fcd"
    ],
    "coordinates": [
      [
        53.55225,
        10.01129
      ],
      [
        53.55293,
        10.00875
      ],
      [
        53.55734,
        10.0112
      ],
      [
        53.56005,
        10.01476
      ],
      [
        53.56305,
        10.0177
      ],
      [
        53.56612,
        10.02063
      ],
      [
        53.56996,
        10.02721
      ],
      [
        53.57481,
        10.02169
      ],
      [
        53.57778,
        10.02823
      ],
      [
        53.5804,
        10.03228
      ],
      [
        53.58403,
        10.03379
      ],
      [
        53.58776,
        10.03429
      ],
      [
        53.58744,
        10.0368
      ],
      [
        53.58751,
        10.04569
      ],
      [
        53.58846,
        10.05283
      ],
      [
        53.5917,
        10.05637
      ],
      [
        53.59473,
        10.06065
      ],
      [
        53.5982,
        10.06597
      ],
      [
        53.60236,
        10.06956
      ],
      [
        53.60612,
        10.07121
      ],
      [
        53.60926,
        10.07311
      ],
      [
        53.61244,
        10.07497
      ],
      [
        53.61505,
        10.07636
      ],
      [
        53.61952,
        10.081
      ],
      [
        53.62256,
        10.08424
      ],
      [
        53.62277,
        10.09041
      ],
      [
        53.6258,
        10.09235
      ],
      [
        53.62773,
        10.10016
      ]
    ]
  },
  "2": {
    "id": "hh-bus-2",
    "ref": "2",
    "name": "Metrobus 2",
    "type": "bus",
    "color": "#ff4d00",
    "from": "U S Berliner Tor (Beim Strohhause)",
    "to": "Schenefeld, Achterndiek",
    "stops": [
      "U S Berliner Tor (Beim Strohhause)",
      "Kurt-Schumacher-Allee",
      "Hauptbahnhof/ZOB",
      "HBF/Steintordamm",
      "U Steinstra\u00dfe (Deichtorplatz)",
      "Ericusspitze",
      "Singapurstra\u00dfe",
      "Am Sandtorkai",
      "Am Kaiserkai (Elbphilharmonie)",
      "U Baumwall",
      "Rambachstra\u00dfe",
      "U S Landungsbr\u00fccken",
      "St. Pauli Hafenstra\u00dfe",
      "Hafentreppe",
      "Fischmarkt",
      "Behnstra\u00dfe",
      "Rathaus Altona",
      "Bf. Altona",
      "Bf. Altona",
      "Gro\u00dfe Rainstra\u00dfe",
      "Hohenesch",
      "S Ottensen",
      "Celsiusweg",
      "Bornkampsweg",
      "Von-Sauer-Stra\u00dfe",
      "Silcherstra\u00dfe",
      "August-Kirch-Stra\u00dfe",
      "Trabrennbahn Bahrenfeld",
      "Luruper Chaussee (DESY)",
      "Stadionstra\u00dfe",
      "Tannenberg",
      "Rugenbarg (Nord)",
      "Eckhoffplatz (Lurup Center)",
      "Flurstra\u00dfe (Nord)",
      "Luckmoor",
      "Engelbrechtweg",
      "Schenefeld, Schenefelder Platz",
      "Schenefeld, Parkstieg",
      "Schenefeld, Stadtzentrum",
      "Schenefeld, Borgfelde",
      "Schenefeld, Dorfplatz",
      "Schenefeld, In de Masch",
      "Schenefeld, Achterndiek"
    ],
    "coordinates": [
      [
        53.5532,
        10.02131
      ],
      [
        53.55264,
        10.01522
      ],
      [
        53.55234,
        10.01042
      ],
      [
        53.55196,
        10.00686
      ],
      [
        53.54961,
        10.00597
      ],
      [
        53.54602,
        10.00308
      ],
      [
        53.54402,
        9.99714
      ],
      [
        53.54326,
        9.99181
      ],
      [
        53.54282,
        9.98578
      ],
      [
        53.5444,
        9.98167
      ],
      [
        53.54455,
        9.97604
      ],
      [
        53.5457,
        9.97109
      ],
      [
        53.54649,
        9.96255
      ],
      [
        53.54599,
        9.9575
      ],
      [
        53.54645,
        9.95071
      ],
      [
        53.54635,
        9.94201
      ],
      [
        53.54717,
        9.93623
      ],
      [
        53.55155,
        9.93417
      ],
      [
        53.55156,
        9.93343
      ],
      [
        53.55412,
        9.9323
      ],
      [
        53.55525,
        9.92862
      ],
      [
        53.55948,
        9.92785
      ],
      [
        53.56179,
        9.92338
      ],
      [
        53.56424,
        9.91842
      ],
      [
        53.56593,
        9.91086
      ],
      [
        53.56917,
        9.90258
      ],
      [
        53.57153,
        9.89784
      ],
      [
        53.57365,
        9.89198
      ],
      [
        53.57679,
        9.88867
      ],
      [
        53.58085,
        9.88433
      ],
      [
        53.58443,
        9.88056
      ],
      [
        53.58899,
        9.87567
      ],
      [
        53.59151,
        9.87281
      ],
      [
        53.59395,
        9.86974
      ],
      [
        53.59729,
        9.86453
      ],
      [
        53.59815,
        9.85695
      ],
      [
        53.59844,
        9.8499
      ],
      [
        53.59965,
        9.84397
      ],
      [
        53.60128,
        9.83619
      ],
      [
        53.59987,
        9.82962
      ],
      [
        53.60048,
        9.82473
      ],
      [
        53.60312,
        9.82461
      ],
      [
        53.60637,
        9.83018
      ]
    ]
  },
  "20": {
    "id": "hh-bus-20",
    "ref": "20",
    "name": "Metrobus 20",
    "type": "bus",
    "color": "#ff4d00",
    "from": "S R\u00fcbenkamp",
    "to": "Bf. Altona",
    "stops": [
      "S R\u00fcbenkamp",
      "Kapstadtring",
      "Dakarweg",
      "\u00dcberseering (West)",
      "Jahnring (Mitte)",
      "Ohlsdorfer Stra\u00dfe (Planetarium)",
      "Winterhuder Marktplatz",
      "U Hudtwalckerstra\u00dfe",
      "Eppendorfer Marktplatz",
      "Julius-Reincke-Stieg (Bethanien)",
      "Eppendorfer Park (UKE)",
      "UK Eppendorf",
      "L\u00f6wenstra\u00dfe (Facharztklinik)",
      "G\u00e4rtnerstra\u00dfe",
      "Kottwitzstra\u00dfe",
      "Goebenstra\u00dfe",
      "Schulweg",
      "Fruchtallee (Hamburg-Haus)",
      "Alsenplatz",
      "S Holstenstra\u00dfe",
      "Max-Brauer-Allee (Mitte)",
      "Gerichtstra\u00dfe",
      "Bf. Altona"
    ],
    "coordinates": [
      [
        53.60762,
        10.03316
      ],
      [
        53.60468,
        10.02493
      ],
      [
        53.60271,
        10.02498
      ],
      [
        53.60037,
        10.01636
      ],
      [
        53.59995,
        10.01216
      ],
      [
        53.59899,
        10.00566
      ],
      [
        53.59472,
        9.99938
      ],
      [
        53.59412,
        9.9962
      ],
      [
        53.59286,
        9.98875
      ],
      [
        53.59205,
        9.98319
      ],
      [
        53.5905,
        9.97957
      ],
      [
        53.58885,
        9.97559
      ],
      [
        53.58738,
        9.97165
      ],
      [
        53.5852,
        9.9689
      ],
      [
        53.58068,
        9.9646
      ],
      [
        53.57813,
        9.96246
      ],
      [
        53.57494,
        9.95941
      ],
      [
        53.57159,
        9.95704
      ],
      [
        53.56661,
        9.95152
      ],
      [
        53.56193,
        9.94823
      ],
      [
        53.55842,
        9.94843
      ],
      [
        53.5557,
        9.94273
      ],
      [
        53.55155,
        9.93417
      ]
    ]
  },
  "21": {
    "id": "hh-bus-21",
    "ref": "21",
    "name": "Metrobus 21",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Teufelsbr\u00fcck (F\u00e4hre)",
    "to": "U Niendorf Nord",
    "stops": [
      "Teufelsbr\u00fcck (F\u00e4hre)",
      "Ohnsorgweg",
      "Marxsenweg",
      "Baron-Voght-Stra\u00dfe (Mitte)",
      "S Klein Flottbek",
      "Langkamp",
      "Hemmingstedter Weg",
      "Ostermeyerstra\u00dfe",
      "Elbe-Einkaufszentrum",
      "Knabeweg",
      "Langelohstra\u00dfe (Nord)",
      "Sandort",
      "Rugenfeld",
      "Grubenstieg",
      "Immenbusch",
      "Achtern Born",
      "B\u00f6ttcherkamp",
      "Schenefeld, Schenefelder Platz",
      "Engelbrechtweg",
      "Trebelstra\u00dfe",
      "Recknitzstra\u00dfe",
      "Jevenstedter Stra\u00dfe",
      "Franzosenkoppel",
      "Katzbachstra\u00dfe",
      "Fangdieckstra\u00dfe",
      "Langbargheide (Nord)",
      "L\u00fcdersring",
      "Langbargheide (S\u00fcd)",
      "A S Eidelstedt",
      "M\u00fchlenauweg",
      "Eidelstedter Platz",
      "Wiebischenkamp",
      "Deepenbrook (M\u00f6bel H\u00f6ffner)",
      "Eidelstedter Brook",
      "Spanische Furt",
      "Graf-Johann-Weg",
      "W\u00e4hlingsweg",
      "Frohmestra\u00dfe (Mitte)",
      "Oldesloer Stra\u00dfe",
      "Modering",
      "Vielohwisch",
      "Wagrierweg",
      "Vielohweg (Mitte)",
      "U Niendorf Nord"
    ],
    "coordinates": [
      [
        53.54761,
        9.86372
      ],
      [
        53.55489,
        9.86948
      ],
      [
        53.55531,
        9.86525
      ],
      [
        53.55745,
        9.86506
      ],
      [
        53.55846,
        9.86166
      ],
      [
        53.5634,
        9.86586
      ],
      [
        53.56619,
        9.86646
      ],
      [
        53.56921,
        9.86631
      ],
      [
        53.57197,
        9.86175
      ],
      [
        53.57211,
        9.85587
      ],
      [
        53.57325,
        9.84689
      ],
      [
        53.5754,
        9.84705
      ],
      [
        53.57849,
        9.85011
      ],
      [
        53.58246,
        9.85767
      ],
      [
        53.58441,
        9.85266
      ],
      [
        53.5882,
        9.85211
      ],
      [
        53.59269,
        9.85293
      ],
      [
        53.59864,
        9.84974
      ],
      [
        53.59812,
        9.85509
      ],
      [
        53.59848,
        9.86117
      ],
      [
        53.59939,
        9.86792
      ],
      [
        53.60053,
        9.87467
      ],
      [
        53.60095,
        9.88148
      ],
      [
        53.60103,
        9.88375
      ],
      [
        53.60076,
        9.88881
      ],
      [
        53.59867,
        9.88658
      ],
      [
        53.59631,
        9.88483
      ],
      [
        53.59312,
        9.8926
      ],
      [
        53.59518,
        9.90493
      ],
      [
        53.60487,
        9.90961
      ],
      [
        53.60838,
        9.9043
      ],
      [
        53.61532,
        9.90673
      ],
      [
        53.62095,
        9.90845
      ],
      [
        53.62316,
        9.91021
      ],
      [
        53.62501,
        9.91705
      ],
      [
        53.62775,
        9.91932
      ],
      [
        53.6316,
        9.9201
      ],
      [
        53.63249,
        9.92121
      ],
      [
        53.63533,
        9.91863
      ],
      [
        53.63768,
        9.92039
      ],
      [
        53.63937,
        9.93193
      ],
      [
        53.63895,
        9.94264
      ],
      [
        53.63859,
        9.94528
      ],
      [
        53.64045,
        9.94951
      ]
    ]
  },
  "22": {
    "id": "hh-bus-22",
    "ref": "22",
    "name": "Metrobus 22",
    "type": "bus",
    "color": "#ff4d00",
    "from": "S Blankenese",
    "to": "U Kellinghusenstra\u00dfe",
    "stops": [
      "S Blankenese",
      "M\u00fchlenberg",
      "Frahmstra\u00dfe",
      "Tietzestra\u00dfe",
      "D\u00fcpenautal",
      "Am Isfeld",
      "Langelohstra\u00dfe (Nord)",
      "Knabeweg",
      "Elbe-Einkaufszentrum",
      "Flurkamp",
      "Geranienweg",
      "Achtern Styg",
      "Flurstra\u00dfe/Rugenbarg",
      "Kressenweg",
      "Rugenbarg (Nord)",
      "Vorhornweg",
      "Langbargheide (S\u00fcd)",
      "Hellgrundweg (Arenen)",
      "Schnackenburgallee",
      "S Stellingen",
      "Volksparkstra\u00dfe",
      "Rathaus Stellingen",
      "U Hagenbecks Tierpark",
      "Schillingsbekweg",
      "Oddernskamp",
      "Behrmannplatz",
      "Siemersplatz",
      "Offakamp",
      "Frickestra\u00dfe",
      "Tarpenbekstra\u00dfe",
      "Eppendorfer Marktplatz",
      "U Kellinghusenstra\u00dfe"
    ],
    "coordinates": [
      [
        53.56347,
        9.81476
      ],
      [
        53.56068,
        9.8231
      ],
      [
        53.56416,
        9.82627
      ],
      [
        53.56704,
        9.83303
      ],
      [
        53.56848,
        9.83459
      ],
      [
        53.57157,
        9.84064
      ],
      [
        53.57279,
        9.8477
      ],
      [
        53.57191,
        9.85585
      ],
      [
        53.57172,
        9.86262
      ],
      [
        53.57272,
        9.86498
      ],
      [
        53.5779,
        9.86604
      ],
      [
        53.58202,
        9.86673
      ],
      [
        53.58553,
        9.86751
      ],
      [
        53.58643,
        9.87305
      ],
      [
        53.58861,
        9.87629
      ],
      [
        53.5925,
        9.88189
      ],
      [
        53.59312,
        9.8926
      ],
      [
        53.59267,
        9.89967
      ],
      [
        53.59187,
        9.9057
      ],
      [
        53.59001,
        9.91884
      ],
      [
        53.59226,
        9.92991
      ],
      [
        53.59257,
        9.93462
      ],
      [
        53.59331,
        9.94421
      ],
      [
        53.59483,
        9.94828
      ],
      [
        53.59882,
        9.95359
      ],
      [
        53.59911,
        9.9576
      ],
      [
        53.59955,
        9.96473
      ],
      [
        53.59844,
        9.97254
      ],
      [
        53.59784,
        9.97737
      ],
      [
        53.59482,
        9.98389
      ],
      [
        53.59305,
        9.98903
      ],
      [
        53.58821,
        9.99131
      ]
    ]
  },
  "23": {
    "id": "hh-bus-23",
    "ref": "23",
    "name": "Metrobus 23",
    "type": "bus",
    "color": "#ff4d00",
    "from": "U Billstedt",
    "to": "Lufthansa-Basis (Haupteingang)",
    "stops": [
      "U Billstedt",
      "\u00d6jendorfer Weg",
      "Schiffbeker H\u00f6he",
      "Kattensteert",
      "Querkamp",
      "Stengelestra\u00dfe",
      "Hasencleverstra\u00dfe",
      "U Horner Rennbahn",
      "Trib\u00fcnenweg",
      "Am Husarendenkmal",
      "Zieseni\u00dfstra\u00dfe",
      "U Wandsbek Markt",
      "U Wandsbek Markt",
      "Wandsbeker Allee",
      "U Stra\u00dfburger Stra\u00dfe",
      "U Alter Teichweg",
      "Olivaer Stra\u00dfe",
      "L\u00e4mmersieth (Mitte)",
      "U S Barmbek",
      "Genslerstra\u00dfe",
      "S Alte W\u00f6hr",
      "Lauensteinstra\u00dfe",
      "Dakarweg",
      "Kapstadtring",
      "Manilabr\u00fccke",
      "Sydneystra\u00dfe",
      "U Alsterdorf",
      "Traute-Lafrenz-Stra\u00dfe",
      "Brabandstra\u00dfe",
      "Alsterkrugchaussee (Mitte)",
      "Heselst\u00fccken",
      "Lufthansa-Basis (Haupteingang)"
    ],
    "coordinates": [
      [
        53.54267,
        10.10726
      ],
      [
        53.54561,
        10.1142
      ],
      [
        53.54786,
        10.10647
      ],
      [
        53.5498,
        10.09987
      ],
      [
        53.55133,
        10.09445
      ],
      [
        53.54922,
        10.09094
      ],
      [
        53.55127,
        10.08847
      ],
      [
        53.5545,
        10.08459
      ],
      [
        53.55958,
        10.08107
      ],
      [
        53.56513,
        10.07766
      ],
      [
        53.56765,
        10.07471
      ],
      [
        53.57204,
        10.06936
      ],
      [
        53.57204,
        10.06936
      ],
      [
        53.57996,
        10.06946
      ],
      [
        53.58292,
        10.06744
      ],
      [
        53.58625,
        10.06373
      ],
      [
        53.58374,
        10.05782
      ],
      [
        53.5851,
        10.05305
      ],
      [
        53.58696,
        10.04398
      ],
      [
        53.59338,
        10.03808
      ],
      [
        53.59813,
        10.03671
      ],
      [
        53.59988,
        10.03616
      ],
      [
        53.60255,
        10.02526
      ],
      [
        53.60604,
        10.02491
      ],
      [
        53.60712,
        10.02259
      ],
      [
        53.6052,
        10.01521
      ],
      [
        53.60716,
        10.01244
      ],
      [
        53.60885,
        10.01214
      ],
      [
        53.61149,
        10.00885
      ],
      [
        53.61791,
        10.00535
      ],
      [
        53.61905,
        9.9992
      ],
      [
        53.6212,
        9.99687
      ]
    ]
  },
  "24": {
    "id": "hh-bus-24",
    "ref": "24",
    "name": "Metrobus 24",
    "type": "bus",
    "color": "#ff4d00",
    "from": "U Niendorf Markt",
    "to": "Bf. Rahlstedt (Doberaner Weg)",
    "stops": [
      "U Niendorf Markt",
      "Fuhlsb\u00fctteler Weg",
      "An der Lohe",
      "Herzog-Bruno-Weg",
      "Graf-Anton-Weg",
      "Wendlohstra\u00dfe",
      "Vietinghoffweg",
      "Gottschalkweg",
      "Vielohweg (Mitte)",
      "U Niendorf Nord",
      "Pommernweg",
      "Keltenweg",
      "Sperlingsweg",
      "Krohnstiegtunnel",
      "Ermlandweg",
      "Wrangelkoppel",
      "Samlandweg",
      "Rittmerskamp",
      "U Langenhorn Markt (Krohnstieg)",
      "Am Schulwald",
      "Lademannbogen",
      "Glash\u00fctter Landstra\u00dfe",
      "Brillkamp",
      "Am Hehsel",
      "Ruscheweyhstra\u00dfe",
      "Norbert-Schmid-Platz",
      "Goldr\u00f6schenweg",
      "Alte Landstra\u00dfe (Nord)",
      "Schulbergredder",
      "Alstertal-Einkaufszentrum",
      "S Poppenb\u00fcttel (Wentzelplatz)",
      "S Poppenb\u00fcttel (Wentzelplatz)",
      "Alstertal-Einkaufszentrum",
      "Stadtbahnstra\u00dfe (Nord)",
      "Saseler Markt",
      "Op de Elg",
      "Steinwegel",
      "Saselbekstra\u00dfe",
      "H\u00fcltkoppel",
      "R\u00f6genfeld",
      "Halenreie",
      "U Volksdorf",
      "Eulenkrugstra\u00dfe",
      "U Meiendorfer Weg",
      "Ringstra\u00dfe",
      "Von-Supp\u00e9-Stra\u00dfe",
      "Lapplandring",
      "Offenbachweg",
      "Skaldenweg",
      "Hellmesbergerweg",
      "Wildschwanbrook (Mitte)",
      "Wildschwanbrook",
      "Saseler Stra\u00dfe",
      "Gerstenwiese",
      "Bargteheider Stra\u00dfe (Nord)",
      "Sandkule",
      "Bf. Rahlstedt (Doberaner Weg)"
    ],
    "coordinates": [
      [
        53.61912,
        9.95204
      ],
      [
        53.62232,
        9.95488
      ],
      [
        53.62396,
        9.95213
      ],
      [
        53.62559,
        9.94693
      ],
      [
        53.62726,
        9.9443
      ],
      [
        53.62986,
        9.93972
      ],
      [
        53.63421,
        9.94138
      ],
      [
        53.63586,
        9.94361
      ],
      [
        53.63859,
        9.94528
      ],
      [
        53.64037,
        9.95059
      ],
      [
        53.64284,
        9.95668
      ],
      [
        53.6462,
        9.95783
      ],
      [
        53.6458,
        9.97584
      ],
      [
        53.64943,
        9.9883
      ],
      [
        53.64904,
        9.99212
      ],
      [
        53.64838,
        9.99625
      ],
      [
        53.64866,
        10.0031
      ],
      [
        53.64814,
        10.00839
      ],
      [
        53.64936,
        10.01755
      ],
      [
        53.65011,
        10.02731
      ],
      [
        53.64873,
        10.03673
      ],
      [
        53.64764,
        10.04206
      ],
      [
        53.64663,
        10.04975
      ],
      [
        53.64731,
        10.05663
      ],
      [
        53.6496,
        10.06089
      ],
      [
        53.65377,
        10.06341
      ],
      [
        53.65144,
        10.06834
      ],
      [
        53.65326,
        10.07797
      ],
      [
        53.65638,
        10.0861
      ],
      [
        53.65413,
        10.09231
      ],
      [
        53.65199,
        10.09299
      ],
      [
        53.65199,
        10.09299
      ],
      [
        53.65478,
        10.09288
      ],
      [
        53.65358,
        10.10602
      ],
      [
        53.65382,
        10.11181
      ],
      [
        53.65519,
        10.11931
      ],
      [
        53.65517,
        10.12419
      ],
      [
        53.65573,
        10.13269
      ],
      [
        53.6528,
        10.14123
      ],
      [
        53.65336,
        10.15204
      ],
      [
        53.65319,
        10.16022
      ],
      [
        53.65022,
        10.16215
      ],
      [
        53.64536,
        10.15858
      ],
      [
        53.63906,
        10.15704
      ],
      [
        53.63645,
        10.16243
      ],
      [
        53.63298,
        10.16462
      ],
      [
        53.63056,
        10.1691
      ],
      [
        53.63255,
        10.17375
      ],
      [
        53.633,
        10.17997
      ],
      [
        53.63025,
        10.17881
      ],
      [
        53.62917,
        10.17591
      ],
      [
        53.62678,
        10.16906
      ],
      [
        53.6222,
        10.16529
      ],
      [
        53.61846,
        10.16044
      ],
      [
        53.61404,
        10.15567
      ],
      [
        53.60739,
        10.14973
      ],
      [
        53.60424,
        10.15299
      ]
    ]
  },
  "25": {
    "id": "hh-bus-25",
    "ref": "25",
    "name": "Metrobus 25",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Bf. Altona",
    "to": "U Burgstra\u00dfe",
    "stops": [
      "Bf. Altona",
      "Gerichtstra\u00dfe",
      "Max-Brauer-Allee (Mitte)",
      "S Holstenstra\u00dfe",
      "Alsenplatz",
      "Fruchtallee (Hamburg-Haus)",
      "Schulweg",
      "Goebenstra\u00dfe",
      "Kottwitzstra\u00dfe",
      "G\u00e4rtnerstra\u00dfe",
      "L\u00f6wenstra\u00dfe (Facharztklinik)",
      "UK Eppendorf",
      "Eppendorfer Park (UKE)",
      "Julius-Reincke-Stieg (Bethanien)",
      "Tarpenbekstra\u00dfe",
      "Lokstedter Weg",
      "Eppendorfer Marktplatz",
      "U Kellinghusenstra\u00dfe",
      "U Hudtwalckerstra\u00dfe",
      "Winterhuder Marktplatz",
      "U Sierichstra\u00dfe",
      "Dorotheenstra\u00dfe",
      "Goldbekplatz",
      "Gertigstra\u00dfe",
      "Hans-Henny-Jahnn-Weg",
      "Hebbelstra\u00dfe",
      "Beethovenstra\u00dfe",
      "U Mundsburg",
      "U Uhlandstra\u00dfe",
      "U Uhlandstra\u00dfe (G\u00fcntherstra\u00dfe)",
      "U Wartenau",
      "S Landwehr (Ramazan-Avci-Platz)",
      "Bethesdastra\u00dfe",
      "U Burgstra\u00dfe"
    ],
    "coordinates": [
      [
        53.55177,
        9.9348
      ],
      [
        53.5557,
        9.94322
      ],
      [
        53.55916,
        9.94911
      ],
      [
        53.56173,
        9.94841
      ],
      [
        53.56666,
        9.952
      ],
      [
        53.57124,
        9.95695
      ],
      [
        53.57435,
        9.95933
      ],
      [
        53.57813,
        9.96246
      ],
      [
        53.58084,
        9.96493
      ],
      [
        53.58487,
        9.96918
      ],
      [
        53.58734,
        9.97176
      ],
      [
        53.58884,
        9.97572
      ],
      [
        53.5905,
        9.97957
      ],
      [
        53.59205,
        9.98319
      ],
      [
        53.59294,
        9.98409
      ],
      [
        53.59521,
        9.98523
      ],
      [
        53.59388,
        9.98961
      ],
      [
        53.58821,
        9.99131
      ],
      [
        53.59413,
        9.99662
      ],
      [
        53.59472,
        9.99938
      ],
      [
        53.5902,
        10.00281
      ],
      [
        53.58699,
        10.00514
      ],
      [
        53.58398,
        10.00977
      ],
      [
        53.58024,
        10.01256
      ],
      [
        53.57867,
        10.01382
      ],
      [
        53.57738,
        10.01845
      ],
      [
        53.57457,
        10.02181
      ],
      [
        53.56872,
        10.02608
      ],
      [
        53.56583,
        10.0246
      ],
      [
        53.56411,
        10.02787
      ],
      [
        53.56383,
        10.03484
      ],
      [
        53.5611,
        10.03734
      ],
      [
        53.55813,
        10.03922
      ],
      [
        53.55564,
        10.04144
      ]
    ]
  },
  "26": {
    "id": "hh-bus-26",
    "ref": "26",
    "name": "Metrobus 26",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Gewerbepark Victoria",
    "to": "S R\u00fcbenkamp",
    "stops": [
      "Gewerbepark Victoria",
      "Victoriaring",
      "Hoffmannstieg",
      "Prehnsweg",
      "Sieker Landstra\u00dfe",
      "Schweriner Stra\u00dfe",
      "Bf. Rahlstedt (Amtsstra\u00dfe)",
      "Liliencronpark",
      "Forum Gymnasium Rahlstedt",
      "Boltenhagener Stra\u00dfe",
      "Scharbeutzer Stra\u00dfe",
      "Rahlstedter Weg (Mitte)",
      "U Farmsen",
      "Tegelweg",
      "Haldesdorfer Stra\u00dfe (Nord)",
      "Ellernreihe (Mitte)",
      "Steilshooper Allee",
      "Fabriciusstra\u00dfe",
      "Gustav-Seitz-Weg",
      "Alfred-Mahlau-Weg",
      "Fritz-Flinte-Ring",
      "Gr\u00fcndgensstra\u00dfe (West)",
      "Eichenlohweg",
      "Hebebrandstra\u00dfe",
      "S R\u00fcbenkamp"
    ],
    "coordinates": [
      [
        53.60359,
        10.19326
      ],
      [
        53.60269,
        10.18791
      ],
      [
        53.60316,
        10.18045
      ],
      [
        53.60458,
        10.17536
      ],
      [
        53.60561,
        10.16855
      ],
      [
        53.60505,
        10.16216
      ],
      [
        53.60384,
        10.1534
      ],
      [
        53.60096,
        10.15324
      ],
      [
        53.6004,
        10.14275
      ],
      [
        53.60009,
        10.13638
      ],
      [
        53.59988,
        10.13184
      ],
      [
        53.60284,
        10.12767
      ],
      [
        53.6072,
        10.11748
      ],
      [
        53.60581,
        10.10599
      ],
      [
        53.60739,
        10.08984
      ],
      [
        53.60847,
        10.07944
      ],
      [
        53.60869,
        10.07126
      ],
      [
        53.60859,
        10.06693
      ],
      [
        53.60872,
        10.05947
      ],
      [
        53.60994,
        10.05367
      ],
      [
        53.61066,
        10.04932
      ],
      [
        53.61178,
        10.04493
      ],
      [
        53.60819,
        10.04438
      ],
      [
        53.6084,
        10.03795
      ],
      [
        53.60762,
        10.03316
      ]
    ]
  },
  "27": {
    "id": "hh-bus-27",
    "ref": "27",
    "name": "Metrobus 27",
    "type": "bus",
    "color": "#ff4d00",
    "from": "S Wellingsb\u00fcttel",
    "to": "U Billstedt",
    "stops": [
      "S Wellingsb\u00fcttel",
      "Rolfinckstra\u00dfe",
      "Waldingstra\u00dfe",
      "Grootmoor",
      "Gut Karlsh\u00f6he",
      "Thomas-Mann-Stra\u00dfe",
      "Buddenbrookweg",
      "Karlsh\u00f6he",
      "Stuhtsweg",
      "Neusurenland",
      "Pflegezentrum Farmsen",
      "Berufsf\u00f6rderungswerk Hamburg",
      "U Farmsen",
      "Rahlstedter Weg (Mitte)",
      "Paracelsusstra\u00dfe",
      "Am Pulverhof (Mitte)",
      "Stemmeshay",
      "Bf. Tonndorf",
      "Studio Hamburg",
      "Wilsonstra\u00dfe",
      "K\u00f6penicker Stra\u00dfe",
      "Berliner Platz",
      "Liegnitzer Stra\u00dfe",
      "Schweidnitzer Stra\u00dfe",
      "Jenfelder Stra\u00dfe",
      "Jenfeld-Zentrum",
      "Denksteinweg",
      "Schiffbeker Weg",
      "Pflegezentrum Holstenhof",
      "R\u00fcbezahlstra\u00dfe",
      "Aschenputtelstra\u00dfe",
      "Fuchsbergredder",
      "Manshardtstra\u00dfe",
      "Prinzenweg",
      "Meriandamm",
      "Schiffbeker H\u00f6he",
      "U Billstedt"
    ],
    "coordinates": [
      [
        53.64074,
        10.08264
      ],
      [
        53.63922,
        10.09441
      ],
      [
        53.63614,
        10.10121
      ],
      [
        53.63226,
        10.10529
      ],
      [
        53.62885,
        10.10784
      ],
      [
        53.62779,
        10.11199
      ],
      [
        53.62669,
        10.11662
      ],
      [
        53.62306,
        10.11125
      ],
      [
        53.61953,
        10.11252
      ],
      [
        53.61601,
        10.11382
      ],
      [
        53.61341,
        10.11496
      ],
      [
        53.61137,
        10.11562
      ],
      [
        53.60669,
        10.11868
      ],
      [
        53.60254,
        10.12771
      ],
      [
        53.59773,
        10.13176
      ],
      [
        53.59407,
        10.13448
      ],
      [
        53.59199,
        10.13107
      ],
      [
        53.58652,
        10.12273
      ],
      [
        53.58638,
        10.12542
      ],
      [
        53.58775,
        10.12902
      ],
      [
        53.58447,
        10.13355
      ],
      [
        53.58332,
        10.14114
      ],
      [
        53.57998,
        10.13752
      ],
      [
        53.57724,
        10.13603
      ],
      [
        53.57414,
        10.13501
      ],
      [
        53.57117,
        10.13433
      ],
      [
        53.57113,
        10.13093
      ],
      [
        53.57023,
        10.12417
      ],
      [
        53.56799,
        10.12289
      ],
      [
        53.56385,
        10.12038
      ],
      [
        53.56213,
        10.11935
      ],
      [
        53.56014,
        10.11818
      ],
      [
        53.55691,
        10.11534
      ],
      [
        53.55475,
        10.11342
      ],
      [
        53.55231,
        10.11129
      ],
      [
        53.54735,
        10.10686
      ],
      [
        53.54267,
        10.10726
      ]
    ]
  },
  "28": {
    "id": "hh-bus-28",
    "ref": "28",
    "name": "Metrobus 28",
    "type": "bus",
    "color": "#ff4d00",
    "from": "U Niendorf Markt",
    "to": "U Wandsbek Markt",
    "stops": [
      "U Niendorf Markt",
      "Vogt-Cordes-Damm",
      "Niendorfer Stra\u00dfe",
      "Bekst\u00fcck",
      "Stavenhagenstra\u00dfe",
      "Warnckesweg",
      "Spreenende",
      "Am Licentiatenberg",
      "Paeplowstieg",
      "Lufthansa-Basis (Haupteingang)",
      "Heselst\u00fccken",
      "Alsterkrugchaussee (Mitte)",
      "Moltrechtweg",
      "Brabandstra\u00dfe",
      "Traute-Lafrenz-Stra\u00dfe",
      "U Alsterdorf",
      "Sydneystra\u00dfe",
      "Manilabr\u00fccke",
      "Kapstadtring",
      "S R\u00fcbenkamp",
      "Jahnbr\u00fccke",
      "Habichtsplatz",
      "U Habichtstra\u00dfe",
      "Habichtstra\u00dfe (Mitte)",
      "L\u00e4mmersieth (Nord)",
      "U Alter Teichweg",
      "U Stra\u00dfburger Stra\u00dfe",
      "Wandsbeker Allee",
      "U Wandsbek Markt"
    ],
    "coordinates": [
      [
        53.61888,
        9.95209
      ],
      [
        53.61371,
        9.95191
      ],
      [
        53.60997,
        9.96094
      ],
      [
        53.60991,
        9.96586
      ],
      [
        53.60967,
        9.9687
      ],
      [
        53.61092,
        9.97429
      ],
      [
        53.61285,
        9.97482
      ],
      [
        53.61425,
        9.98378
      ],
      [
        53.61634,
        9.98733
      ],
      [
        53.6212,
        9.99687
      ],
      [
        53.61843,
        9.9997
      ],
      [
        53.61788,
        10.00524
      ],
      [
        53.61586,
        10.00754
      ],
      [
        53.61147,
        10.00913
      ],
      [
        53.60844,
        10.0116
      ],
      [
        53.60716,
        10.01244
      ],
      [
        53.60579,
        10.01825
      ],
      [
        53.60695,
        10.02227
      ],
      [
        53.60566,
        10.02625
      ],
      [
        53.60741,
        10.03294
      ],
      [
        53.60169,
        10.03552
      ],
      [
        53.59575,
        10.04693
      ],
      [
        53.59282,
        10.05266
      ],
      [
        53.59116,
        10.05632
      ],
      [
        53.589,
        10.06106
      ],
      [
        53.58612,
        10.06496
      ],
      [
        53.58183,
        10.06789
      ],
      [
        53.57892,
        10.0697
      ],
      [
        53.57204,
        10.06936
      ]
    ]
  },
  "29": {
    "id": "hh-bus-29",
    "ref": "29",
    "name": "Metrobus 29",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Gewerbepark Merkur",
    "to": "Bf. Bergedorf",
    "stops": [
      "Gewerbepark Merkur",
      "Neuer H\u00f6ltigbaum",
      "Naturschutzgebiet H\u00f6ltigbaum",
      "Neurahlstedter Graben",
      "Waterbl\u00f6ckenwiese",
      "Heckende",
      "Pahlbl\u00f6ckensstieg",
      "Schweriner Stra\u00dfe",
      "Rahlstedt Center",
      "Bf. Rahlstedt (Amtsstra\u00dfe)",
      "Bf. Rahlstedt (Amtsstra\u00dfe)",
      "Altes Rathaus Rahlstedt",
      "Buchwaldstra\u00dfe",
      "Amtsstra\u00dfe",
      "Am Ohlendorffturm",
      "Immenseeweg",
      "Brunskamp",
      "Sorenkoppel",
      "Am Hegen",
      "Geesthachter Weg",
      "Kielkoppelstra\u00dfe",
      "Kinderkrankenhaus Wilhelmstift",
      "H\u00fcllenkamp",
      "Potsdamer Stra\u00dfe",
      "Berliner Platz",
      "K\u00f6penicker Stra\u00dfe",
      "Kaskadenpark",
      "Otto-Hahn-Schule Jenfeld",
      "Jenfelder Allee",
      "Jenfelder Stra\u00dfe",
      "Jenfeld-Zentrum",
      "Hans-Rubbert-Stra\u00dfe",
      "Fuchsbergweg",
      "Rispengrasweg",
      "Rehkoppel",
      "Fuchsbergredder",
      "Manshardtstra\u00dfe",
      "Prinzenweg",
      "Meriandamm",
      "Schiffbeker H\u00f6he",
      "U Billstedt",
      "U Billstedt",
      "Frobeniusweg",
      "Billstedter M\u00fchlenweg",
      "Lohkamp",
      "Kirchsteinbek",
      "Havighorster Redder (West)",
      "M\u00fcnterweg",
      "U M\u00fcmmelmannsberg",
      "Steinbeker Grenzdamm",
      "Boberg",
      "BG Klinikum Boberg",
      "Grandkoppel (West)",
      "Grandkoppel",
      "Emilie-G\u00fcnther-Weg",
      "An der Bergkoppel",
      "Lohbr\u00fcgger Kirchstra\u00dfe",
      "Lohbr\u00fcgger Markt",
      "Alte Holstenstra\u00dfe",
      "Bf. Bergedorf"
    ],
    "coordinates": [
      [
        53.60771,
        10.18875
      ],
      [
        53.60826,
        10.18539
      ],
      [
        53.6112,
        10.18353
      ],
      [
        53.61042,
        10.17725
      ],
      [
        53.60812,
        10.17578
      ],
      [
        53.60704,
        10.17412
      ],
      [
        53.6064,
        10.16868
      ],
      [
        53.60505,
        10.16216
      ],
      [
        53.60428,
        10.15826
      ],
      [
        53.60376,
        10.15339
      ],
      [
        53.60367,
        10.15397
      ],
      [
        53.60217,
        10.15927
      ],
      [
        53.59895,
        10.1628
      ],
      [
        53.59605,
        10.1648
      ],
      [
        53.59529,
        10.16826
      ],
      [
        53.59421,
        10.1754
      ],
      [
        53.59384,
        10.18224
      ],
      [
        53.59097,
        10.18503
      ],
      [
        53.58912,
        10.18048
      ],
      [
        53.58854,
        10.17096
      ],
      [
        53.59014,
        10.16641
      ],
      [
        53.58895,
        10.1599
      ],
      [
        53.58783,
        10.15551
      ],
      [
        53.58573,
        10.14826
      ],
      [
        53.58403,
        10.1406
      ],
      [
        53.58393,
        10.13324
      ],
      [
        53.58064,
        10.13166
      ],
      [
        53.5788,
        10.12797
      ],
      [
        53.57481,
        10.12682
      ],
      [
        53.57414,
        10.13501
      ],
      [
        53.57054,
        10.13564
      ],
      [
        53.56506,
        10.13303
      ],
      [
        53.56296,
        10.1327
      ],
      [
        53.56081,
        10.12628
      ],
      [
        53.56034,
        10.11995
      ],
      [
        53.56014,
        10.11818
      ],
      [
        53.55691,
        10.11534
      ],
      [
        53.55475,
        10.11342
      ],
      [
        53.55231,
        10.11129
      ],
      [
        53.54735,
        10.10686
      ],
      [
        53.54267,
        10.10726
      ],
      [
        53.54267,
        10.10726
      ],
      [
        53.53701,
        10.10866
      ],
      [
        53.53293,
        10.11601
      ],
      [
        53.53141,
        10.12223
      ],
      [
        53.52926,
        10.12747
      ],
      [
        53.52737,
        10.13654
      ],
      [
        53.52745,
        10.14506
      ],
      [
        53.52697,
        10.14979
      ],
      [
        53.52381,
        10.14905
      ],
      [
        53.51415,
        10.16725
      ],
      [
        53.50732,
        10.18042
      ],
      [
        53.50557,
        10.18643
      ],
      [
        53.50364,
        10.19168
      ],
      [
        53.50262,
        10.19436
      ],
      [
        53.50076,
        10.19843
      ],
      [
        53.4989,
        10.2024
      ],
      [
        53.49473,
        10.20778
      ],
      [
        53.49054,
        10.20818
      ],
      [
        53.48938,
        10.20672
      ]
    ]
  },
  "3": {
    "id": "hh-bus-3",
    "ref": "3",
    "name": "Metrobus 3",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Kraftwerk Tiefstack",
    "to": "Schenefeld, Schenefelder Platz",
    "stops": [
      "Kraftwerk Tiefstack",
      "S Tiefstack",
      "Ausschl\u00e4ger Allee (Kfz-Verwahrstelle)",
      "Rothenburgstra\u00dfe",
      "Zollvereinsstra\u00dfe",
      "Thiedingreihe",
      "Billhorner Deich",
      "Rothenburgsorter Marktplatz",
      "Billhorner M\u00fchlenweg",
      "Billhorner Br\u00fcckenstra\u00dfe",
      "Nagelsweg",
      "Lippeltstra\u00dfe",
      "Spaldingstra\u00dfe",
      "U Steinstra\u00dfe (Deichtorplatz)",
      "HBF/Steintordamm",
      "Hauptbahnhof/ZOB",
      "Hauptbahnhof/ZOB",
      "HBF/Steintordamm",
      "HBF/M\u00f6nckebergstra\u00dfe",
      "Gerhart-Hauptmann-Platz",
      "Rathausmarkt",
      "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
      "Axel-Springer-Platz",
      "Bezirksamt Hamburg-Mitte",
      "Sievekingplatz",
      "U Feldstra\u00dfe",
      "Neuer Pferdemarkt",
      "Bernstorffstra\u00dfe",
      "Sternbr\u00fccke",
      "S Holstenstra\u00dfe",
      "Kaltenkircher Platz",
      "Sch\u00fctzenstra\u00dfe (Mitte)",
      "Bornkampsweg",
      "Von-Sauer-Stra\u00dfe",
      "Silcherstra\u00dfe",
      "August-Kirch-Stra\u00dfe",
      "Trabrennbahn Bahrenfeld",
      "Luruper Chaussee (DESY)",
      "Stadionstra\u00dfe",
      "Tannenberg",
      "Rugenbarg (Nord)",
      "Eckhoffplatz (Lurup Center)",
      "Flurstra\u00dfe (Nord)",
      "Luckmoor",
      "Engelbrechtweg",
      "Schenefeld, Schenefelder Platz"
    ],
    "coordinates": [
      [
        53.52798,
        10.06888
      ],
      [
        53.53062,
        10.06445
      ],
      [
        53.53107,
        10.05987
      ],
      [
        53.53157,
        10.0565
      ],
      [
        53.53268,
        10.05098
      ],
      [
        53.53381,
        10.04565
      ],
      [
        53.53422,
        10.04283
      ],
      [
        53.53473,
        10.03854
      ],
      [
        53.53651,
        10.03498
      ],
      [
        53.54064,
        10.03169
      ],
      [
        53.54384,
        10.02098
      ],
      [
        53.54572,
        10.01605
      ],
      [
        53.54779,
        10.01281
      ],
      [
        53.54895,
        10.00644
      ],
      [
        53.55201,
        10.00773
      ],
      [
        53.55225,
        10.01129
      ],
      [
        53.55225,
        10.01129
      ],
      [
        53.55196,
        10.00686
      ],
      [
        53.5515,
        10.00347
      ],
      [
        53.55077,
        9.99806
      ],
      [
        53.55101,
        9.99385
      ],
      [
        53.54843,
        9.98983
      ],
      [
        53.55257,
        9.98479
      ],
      [
        53.55482,
        9.98107
      ],
      [
        53.55616,
        9.97734
      ],
      [
        53.55742,
        9.96777
      ],
      [
        53.55866,
        9.9631
      ],
      [
        53.5604,
        9.95931
      ],
      [
        53.56081,
        9.95757
      ],
      [
        53.56237,
        9.94926
      ],
      [
        53.56367,
        9.94033
      ],
      [
        53.56354,
        9.92858
      ],
      [
        53.56424,
        9.91842
      ],
      [
        53.56593,
        9.91086
      ],
      [
        53.56917,
        9.90258
      ],
      [
        53.57153,
        9.89784
      ],
      [
        53.57373,
        9.89254
      ],
      [
        53.57679,
        9.88867
      ],
      [
        53.58085,
        9.88433
      ],
      [
        53.58443,
        9.88056
      ],
      [
        53.58899,
        9.87567
      ],
      [
        53.59151,
        9.87281
      ],
      [
        53.59395,
        9.86974
      ],
      [
        53.59729,
        9.86453
      ],
      [
        53.59815,
        9.85695
      ],
      [
        53.59844,
        9.8499
      ]
    ]
  },
  "7": {
    "id": "hh-bus-7",
    "ref": "7",
    "name": "Metrobus 7",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Borchertring",
    "to": "U S Barmbek",
    "stops": [
      "Borchertring",
      "Gr\u00fcndgensstra\u00dfe (Ost)",
      "Erich-Ziegel-Ring",
      "Gr\u00fcndgensstra\u00dfe (Mitte)",
      "Gustav-Seitz-Weg",
      "Alfred-Mahlau-Weg",
      "Schwarzer Weg",
      "Richeystra\u00dfe",
      "Langenfort",
      "U Habichtstra\u00dfe (Steilshooper Stra\u00dfe)",
      "Harzensweg",
      "Hellbrookstra\u00dfe",
      "U S Barmbek"
    ],
    "coordinates": [
      [
        53.61492,
        10.06757
      ],
      [
        53.61375,
        10.06596
      ],
      [
        53.61174,
        10.06323
      ],
      [
        53.61019,
        10.06188
      ],
      [
        53.60872,
        10.05947
      ],
      [
        53.60943,
        10.05412
      ],
      [
        53.60618,
        10.05533
      ],
      [
        53.60343,
        10.05186
      ],
      [
        53.59974,
        10.05068
      ],
      [
        53.59541,
        10.05011
      ],
      [
        53.59164,
        10.04797
      ],
      [
        53.59088,
        10.04365
      ],
      [
        53.58799,
        10.04325
      ]
    ]
  },
  "8": {
    "id": "hh-bus-8",
    "ref": "8",
    "name": "Metrobus 8",
    "type": "bus",
    "color": "#ff4d00",
    "from": "U Wandsbek Markt",
    "to": "S Poppenb\u00fcttel (Wentzelplatz)",
    "stops": [
      "U Wandsbek Markt",
      "Wendemuthstra\u00dfe",
      "Hogrevestra\u00dfe",
      "Gladowstra\u00dfe",
      "Waldd\u00f6rferstra\u00dfe",
      "Friedrich-Ebert-Damm (West)",
      "Tilsiter Stra\u00dfe",
      "U Wandsbek-Gartenstadt",
      "Haldesdorfer Stra\u00dfe",
      "Werner-Otto-Stra\u00dfe (Mitte)",
      "Werner-Otto-Stra\u00dfe",
      "Rahnstra\u00dfe",
      "Steilshooper Allee",
      "Herthastra\u00dfe",
      "Bramfelder Dorfplatz",
      "Berner Chaussee",
      "K\u00f6nigsberger Stra\u00dfe",
      "Maisredder",
      "Am Damm",
      "Rolfinckstra\u00dfe",
      "Pfeilshofer Weg",
      "Frahmredder",
      "Stadtbahnstra\u00dfe (Mitte)",
      "S Poppenb\u00fcttel (Wentzelplatz)"
    ],
    "coordinates": [
      [
        53.57204,
        10.06936
      ],
      [
        53.57433,
        10.07373
      ],
      [
        53.57694,
        10.07279
      ],
      [
        53.57941,
        10.07563
      ],
      [
        53.5804,
        10.08104
      ],
      [
        53.5855,
        10.07822
      ],
      [
        53.58997,
        10.07793
      ],
      [
        53.5923,
        10.07579
      ],
      [
        53.59663,
        10.07235
      ],
      [
        53.60001,
        10.06981
      ],
      [
        53.60236,
        10.06956
      ],
      [
        53.60612,
        10.07121
      ],
      [
        53.60926,
        10.07311
      ],
      [
        53.61244,
        10.07497
      ],
      [
        53.61505,
        10.07636
      ],
      [
        53.61952,
        10.081
      ],
      [
        53.62339,
        10.08437
      ],
      [
        53.62717,
        10.08558
      ],
      [
        53.63244,
        10.08961
      ],
      [
        53.63959,
        10.09534
      ],
      [
        53.64173,
        10.09739
      ],
      [
        53.64745,
        10.10159
      ],
      [
        53.64944,
        10.09852
      ],
      [
        53.65199,
        10.09299
      ]
    ]
  },
  "9": {
    "id": "hh-bus-9",
    "ref": "9",
    "name": "Metrobus 9",
    "type": "bus",
    "color": "#ff4d00",
    "from": "Bf. Rahlstedt (Amtsstra\u00dfe)",
    "to": "U Wandsbek Markt",
    "stops": [
      "Bf. Rahlstedt (Amtsstra\u00dfe)",
      "Wilhelm-Grimm-Stra\u00dfe",
      "Brockdorffstra\u00dfe",
      "Loher Stra\u00dfe",
      "Am Pulverhof (S\u00fcd)",
      "Martensallee",
      "Wilsonstra\u00dfe",
      "Studio Hamburg",
      "Bf. Tonndorf (Tonndorfer Hauptstra\u00dfe)",
      "Friedhof Tonndorf",
      "Nordmarkstra\u00dfe",
      "\u00d6lm\u00fchlenweg (S\u00fcd)",
      "Kurf\u00fcrstenstra\u00dfe",
      "Eichtalstra\u00dfe",
      "Holzm\u00fchlenstra\u00dfe",
      "Wendemuthstra\u00dfe",
      "U Wandsbek Markt"
    ],
    "coordinates": [
      [
        53.60381,
        10.15397
      ],
      [
        53.6004,
        10.15622
      ],
      [
        53.59698,
        10.15292
      ],
      [
        53.59405,
        10.14502
      ],
      [
        53.59199,
        10.13605
      ],
      [
        53.59055,
        10.13372
      ],
      [
        53.58817,
        10.12984
      ],
      [
        53.58638,
        10.12542
      ],
      [
        53.58568,
        10.12335
      ],
      [
        53.58293,
        10.11348
      ],
      [
        53.58193,
        10.10962
      ],
      [
        53.57993,
        10.10129
      ],
      [
        53.57881,
        10.09497
      ],
      [
        53.57798,
        10.08903
      ],
      [
        53.57661,
        10.0817
      ],
      [
        53.57433,
        10.07373
      ],
      [
        53.57204,
        10.06936
      ]
    ]
  },
  "X22": {
    "id": "hh-bus-x22",
    "ref": "X22",
    "name": "Expressbus X22",
    "type": "bus",
    "color": "#009944",
    "from": "U Hagenbecks Tierpark",
    "to": "Jenfeld-Zentrum",
    "stops": [
      "U Hagenbecks Tierpark",
      "Siemersplatz",
      "Lokstedter Weg",
      "Eppendorfer Marktplatz",
      "U Hudtwalckerstra\u00dfe",
      "Winterhuder Marktplatz",
      "Maria-Louisen-Stra\u00dfe (Nord)",
      "Semperstra\u00dfe",
      "Flotowstra\u00dfe",
      "Biedermannplatz",
      "U Hamburger Stra\u00dfe",
      "Eilbeker Weg",
      "U S Wandsbeker Chaussee",
      "U Wandsbek Markt",
      "Universit\u00e4t der Bundeswehr",
      "Schiffbeker Weg",
      "Jenfeld-Zentrum"
    ],
    "coordinates": [
      [
        53.59331,
        9.94421
      ],
      [
        53.59955,
        9.96473
      ],
      [
        53.59521,
        9.98523
      ],
      [
        53.59388,
        9.98961
      ],
      [
        53.59413,
        9.99662
      ],
      [
        53.59472,
        9.99938
      ],
      [
        53.59137,
        10.00731
      ],
      [
        53.58641,
        10.01752
      ],
      [
        53.5806,
        10.02621
      ],
      [
        53.57887,
        10.03228
      ],
      [
        53.5746,
        10.03614
      ],
      [
        53.56855,
        10.04356
      ],
      [
        53.56992,
        10.05847
      ],
      [
        53.57204,
        10.06936
      ],
      [
        53.57056,
        10.10622
      ],
      [
        53.57098,
        10.12575
      ],
      [
        53.57087,
        10.13691
      ]
    ]
  },
  "X3": {
    "id": "hh-bus-x3",
    "ref": "X3",
    "name": "Expressbus X3",
    "type": "bus",
    "color": "#009944",
    "from": "U Me\u00dfberg",
    "to": "Schenefeld, Schenefelder Platz",
    "stops": [
      "U Me\u00dfberg",
      "Speersort",
      "U S Jungfernstieg",
      "U G\u00e4nsemarkt",
      "U Feldstra\u00dfe",
      "S Holstenstra\u00dfe",
      "Sch\u00fctzenstra\u00dfe (Mitte)",
      "Von-Sauer-Stra\u00dfe",
      "Trabrennbahn Bahrenfeld",
      "Luruper Chaussee (DESY)",
      "Stadionstra\u00dfe",
      "Kressenweg",
      "Immenbusch",
      "Achtern Born",
      "B\u00f6ttcherkamp",
      "Schenefeld, Schenefelder Platz"
    ],
    "coordinates": [
      [
        53.54756,
        10.00332
      ],
      [
        53.54966,
        9.99627
      ],
      [
        53.554,
        9.99143
      ],
      [
        53.55533,
        9.98865
      ],
      [
        53.55742,
        9.96777
      ],
      [
        53.56237,
        9.94926
      ],
      [
        53.56354,
        9.92858
      ],
      [
        53.56593,
        9.91086
      ],
      [
        53.57365,
        9.89198
      ],
      [
        53.57679,
        9.88867
      ],
      [
        53.58085,
        9.88433
      ],
      [
        53.58656,
        9.87289
      ],
      [
        53.58441,
        9.85266
      ],
      [
        53.5882,
        9.85211
      ],
      [
        53.59269,
        9.85293
      ],
      [
        53.59873,
        9.84992
      ]
    ]
  },
  "X30": {
    "id": "hh-bus-x30",
    "ref": "X30",
    "name": "Expressbus X30",
    "type": "bus",
    "color": "#009944",
    "from": "S Harburg Rathaus (H\u00f6lertwiete)",
    "to": "Bf. Bergedorf",
    "stops": [
      "S Harburg Rathaus (H\u00f6lertwiete)",
      "S Harburg Rathaus (Ei\u00dfendorfer Stra\u00dfe)",
      "Knoopstra\u00dfe/Bremer Stra\u00dfe",
      "Moorstra\u00dfe (Phoenix-Center)",
      "Felix-Jud-Ring (Mitte)",
      "Michael-Pritzl-Weg",
      "Von-Scheliha-Stra\u00dfe",
      "S Nettelnburg (S\u00fcdeingang)",
      "Oberer Landweg (Eisenbahnbr\u00fccke)",
      "Kurt-A.-K\u00f6rber-Chaussee (Ost)",
      "Bf. Bergedorf"
    ],
    "coordinates": [
      [
        53.46154,
        9.98203
      ],
      [
        53.45996,
        9.97707
      ],
      [
        53.45808,
        9.98101
      ],
      [
        53.45691,
        9.98635
      ],
      [
        53.48132,
        10.15407
      ],
      [
        53.4809,
        10.15725
      ],
      [
        53.48546,
        10.16287
      ],
      [
        53.48665,
        10.17933
      ],
      [
        53.48806,
        10.18592
      ],
      [
        53.4889,
        10.1975
      ],
      [
        53.48943,
        10.20626
      ]
    ]
  },
  "X80": {
    "id": "hh-bus-x80",
    "ref": "X80",
    "name": "Expressbus X80",
    "type": "bus",
    "color": "#009944",
    "from": "Lauenburg, ZOB",
    "to": "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)",
    "stops": [
      "Lauenburg, ZOB",
      "Lauenburg, Albinusstra\u00dfe",
      "Lauenburg, Sportplatz",
      "Lauenburg, Birnbaumkamp",
      "Gl\u00fcsing, Berliner Stra\u00dfe",
      "Schnakenbek, Twiete",
      "Gr\u00fcnhof, Krukower Weg",
      "Gr\u00fcnhof, Steinberg",
      "Geesthacht, Gr\u00fcner J\u00e4ger",
      "Geesthacht, Waldfriedhof",
      "Geesthacht, Jugendherberge",
      "Geesthacht, Berliner Stra\u00dfe",
      "Geesthacht, ZOB",
      "Geesthacht, An der Post",
      "Geesthacht, D\u00fcneberger Stra\u00dfe",
      "Geesthacht, Sch\u00e4ferstrift",
      "Geesthacht, Besenhorst",
      "Lehfeld",
      "Bf. Bergedorf",
      "Sander Markt",
      "Lohbr\u00fcgger Markt",
      "Lohbr\u00fcgger Kirchstra\u00dfe",
      "Grandkoppel",
      "BG Klinikum Boberg",
      "Boberg",
      "Billstedter Hauptstra\u00dfe",
      "Bauerberg",
      "U Burgstra\u00dfe",
      "Borgfelder Stra\u00dfe",
      "U S Berliner Tor (Beim Strohhause)",
      "Hauptbahnhof/ZOB",
      "HBF/Steintordamm",
      "Gerhart-Hauptmann-Platz",
      "Rathausmarkt",
      "U R\u00f6dingsmarkt (Gro\u00dfer Burstah)"
    ],
    "coordinates": [
      [
        53.37326,
        10.55413
      ],
      [
        53.37417,
        10.54588
      ],
      [
        53.37329,
        10.53496
      ],
      [
        53.3738,
        10.52835
      ],
      [
        53.37687,
        10.51618
      ],
      [
        53.38568,
        10.50373
      ],
      [
        53.40934,
        10.44476
      ],
      [
        53.41213,
        10.44058
      ],
      [
        53.42425,
        10.41785
      ],
      [
        53.42959,
        10.39626
      ],
      [
        53.43139,
        10.39072
      ],
      [
        53.43592,
        10.38453
      ],
      [
        53.436,
        10.37322
      ],
      [
        53.43862,
        10.36768
      ],
      [
        53.44437,
        10.36283
      ],
      [
        53.45009,
        10.35925
      ],
      [
        53.45496,
        10.34904
      ],
      [
        53.48087,
        10.20803
      ],
      [
        53.4896,
        10.20659
      ],
      [
        53.49265,
        10.20859
      ],
      [
        53.49479,
        10.20787
      ],
      [
        53.49857,
        10.203
      ],
      [
        53.5047,
        10.18885
      ],
      [
        53.50771,
        10.17994
      ],
      [
        53.51448,
        10.16734
      ],
      [
        53.54069,
        10.10013
      ],
      [
        53.55046,
        10.07797
      ],
      [
        53.55564,
        10.04144
      ],
      [
        53.5547,
        10.03311
      ],
      [
        53.55341,
        10.0242
      ],
      [
        53.55234,
        10.01042
      ],
      [
        53.55196,
        10.00686
      ],
      [
        53.55077,
        9.99806
      ],
      [
        53.55101,
        9.99385
      ],
      [
        53.54843,
        9.98983
      ]
    ]
  },

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
    "from": "Hamburg-Schnelsen (A Burgwedel)",
    "to": "Hauptbahnhof / ZOB",
    "stops": [
      "Hamburg-Schnelsen (A Burgwedel)",
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
      "Hamburg-Schnelsen (A Burgwedel)",
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
