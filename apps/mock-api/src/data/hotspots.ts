export interface Hotspot {
  locId: string;
  locName: string;
  countryCode: string;
  subnational1Code: string;
  subnational2Code: string;
  lat: number;
  lng: number;
  latestObsDt: string;
  numSpeciesAllTime: number;
}

export const hotspots: Record<string, Hotspot[]> = {
  "US-CA": [
    {
      countryCode: "US",
      lat: 37.7694,
      latestObsDt: "2024-01-15 08:30:00",
      lng: -122.4862,
      locId: "L1234567",
      locName: "Golden Gate Park",
      numSpeciesAllTime: 245,
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-075",
    },
    {
      countryCode: "US",
      lat: 38.0694,
      latestObsDt: "2024-01-14 14:20:00",
      lng: -122.8069,
      locId: "L2345678",
      locName: "Point Reyes National Seashore",
      numSpeciesAllTime: 312,
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-041",
    },
    {
      countryCode: "US",
      lat: 33.6889,
      latestObsDt: "2024-01-13 16:45:00",
      lng: -118.0208,
      locId: "L3456789",
      locName: "Bolsa Chica Ecological Reserve",
      numSpeciesAllTime: 189,
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-059",
    },
    {
      countryCode: "US",
      lat: 37.8651,
      latestObsDt: "2024-01-12 09:15:00",
      lng: -119.5383,
      locId: "L4567890",
      locName: "Yosemite National Park",
      numSpeciesAllTime: 267,
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-041",
    },
    {
      countryCode: "US",
      lat: 36.6002,
      latestObsDt: "2024-01-11 11:30:00",
      lng: -121.8947,
      locId: "L5678901",
      locName: "Monterey Bay",
      numSpeciesAllTime: 298,
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-053",
    },
  ],
};

