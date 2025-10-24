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
      locId: "L1234567",
      locName: "Golden Gate Park",
      countryCode: "US",
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-075",
      lat: 37.7694,
      lng: -122.4862,
      latestObsDt: "2024-01-15 08:30:00",
      numSpeciesAllTime: 245,
    },
    {
      locId: "L2345678",
      locName: "Point Reyes National Seashore",
      countryCode: "US",
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-041",
      lat: 38.0694,
      lng: -122.8069,
      latestObsDt: "2024-01-14 14:20:00",
      numSpeciesAllTime: 312,
    },
    {
      locId: "L3456789",
      locName: "Bolsa Chica Ecological Reserve",
      countryCode: "US",
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-059",
      lat: 33.6889,
      lng: -118.0208,
      latestObsDt: "2024-01-13 16:45:00",
      numSpeciesAllTime: 189,
    },
    {
      locId: "L4567890",
      locName: "Yosemite National Park",
      countryCode: "US",
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-041",
      lat: 37.8651,
      lng: -119.5383,
      latestObsDt: "2024-01-12 09:15:00",
      numSpeciesAllTime: 267,
    },
    {
      locId: "L5678901",
      locName: "Monterey Bay",
      countryCode: "US",
      subnational1Code: "US-CA",
      subnational2Code: "US-CA-053",
      lat: 36.6002,
      lng: -121.8947,
      latestObsDt: "2024-01-11 11:30:00",
      numSpeciesAllTime: 298,
    },
  ],
};
