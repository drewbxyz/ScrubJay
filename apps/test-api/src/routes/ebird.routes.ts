import express from "express";
import moment from "moment-timezone";
import { hotspots } from "../data/hotspots";
import { regions } from "../data/regions";
import { species } from "../data/species";

export interface eBirdObservation {
  speciesCode: string;
  comName: string;
  sciName: string;
  locId: string;
  locName: string;
  obsDt: string;
  howMany: number;
  lat: number;
  lng: number;
  obsValid: boolean;
  obsReviewed: boolean;
  locationPrivate: boolean;
  subId: string;
  countryCode: string;
  countryName: string;
  subnational1Code: string;
  subnational1Name: string;
  subnational2Code: string;
  subnational2Name: string;
  firstName: string;
  lastName: string;
  userDisplayName: string;
  obsId: string;
  checklistId: string;
  presenceNoted: boolean;
  hasRichMedia: boolean;
  hasComments: boolean;
  evidence: "P" | "A" | "V" | null;
  exoticsCategory: string | null;
  isChecklistReviewed: boolean;
}

// Pool of existing locations for reuse
const locationPool: Record<
  string,
  { locId: string; locName: string; lat: number; lng: number }[]
> = {};

// Initialize location pools from hotspots data
Object.keys(hotspots).forEach((regionCode) => {
  const regionHotspots = hotspots[regionCode as keyof typeof hotspots];
  if (regionHotspots) {
    locationPool[regionCode] = regionHotspots.map((hotspot) => ({
      lat: hotspot.lat,
      lng: hotspot.lng,
      locId: hotspot.locId,
      locName: hotspot.locName,
    }));
  }
});

function generateRandomObservation(
  regionCode: string,
  hotspot?: { locId: string; locName: string; lat: number; lng: number },
  daysBack: number = 7,
): eBirdObservation {
  const region = regions[regionCode as keyof typeof regions];
  const randomSpecies = species[Math.floor(Math.random() * species.length)];
  const randomSubregion = Object.keys(region.counties)[
    Math.floor(Math.random() * Object.keys(region.counties).length)
  ];

  if (!randomSpecies || !randomSubregion) {
    throw new Error("Unable to generate observation data");
  }

  let hotspotData: { locId: string; locName: string; lat: number; lng: number };

  if (hotspot) {
    hotspotData = hotspot;
  } else {
    const shouldReuseLocation = Math.random() < 0.8;
    const availableLocations = locationPool[regionCode] || [];

    if (shouldReuseLocation && availableLocations.length > 0) {
      const randomLocation =
        availableLocations[
          Math.floor(Math.random() * availableLocations.length)
        ];
      // biome-ignore lint/style/noNonNullAssertion: We know it exists because we checked length > 0
      hotspotData = randomLocation!;
    } else {
      hotspotData = {
        lat: 37.7749 + (Math.random() - 0.5) * 0.1,
        lng: -122.4194 + (Math.random() - 0.5) * 0.1,
        locId: crypto.randomUUID(),
        locName: `Random Location ${Math.floor(Math.random() * 1000)}`,
      };

      if (!locationPool[regionCode]) {
        locationPool[regionCode] = [];
      }
      locationPool[regionCode].push(hotspotData);
    }
  }

  const obsDt = moment()
    .subtract(Math.floor(Math.random() * daysBack), "days")
    .format("YYYY-MM-DD HH:mm:ss");

  return {
    checklistId: crypto.randomUUID(),
    comName: randomSpecies.comName,
    countryCode: "US",
    countryName: "United States",
    evidence:
      Math.random() > 0.9
        ? (["P", "A", "V"][Math.floor(Math.random() * 3)] as "P" | "A" | "V")
        : null,
    exoticsCategory: null,
    firstName: "John",
    hasComments: Math.random() > 0.7,
    hasRichMedia: Math.random() > 0.8,
    howMany: Math.floor(Math.random() * 10) + 1,
    isChecklistReviewed: Math.random() > 0.2,
    lastName: "Doe",
    lat: hotspotData.lat,
    lng: hotspotData.lng,
    locationPrivate: false,
    locId: hotspotData.locId,
    locName: hotspotData.locName,
    obsDt,
    obsId: crypto.randomUUID(),
    obsReviewed: Math.random() > 0.3,
    obsValid: true,
    presenceNoted: true,
    sciName: randomSpecies.sciName,
    speciesCode: randomSpecies.speciesCode,
    subId: crypto.randomUUID(),
    subnational1Code: region.code,
    subnational1Name: region.name,
    subnational2Code:
      region.counties[randomSubregion as keyof typeof region.counties],
    subnational2Name: randomSubregion,
    userDisplayName: "John Doe",
  };
}

export function createEbirdRoutes() {
  const router = express.Router();

  // In-memory storage for observations
  const observations: Record<string, eBirdObservation[]> = {};
  const notableObservations: Record<string, eBirdObservation[]> = {};

  // Recent observations in a region
  router.get("/data/obs/:regionCode/recent", (req, res) => {
    const { regionCode } = req.params;
    const {
      maxResults = "50",
      includeProvisional = "false",
      hotspot = "false",
    } = req.query;

    if (!regionCode) {
      return res.status(400).json({ error: "Region code is required" });
    }

    const region = regions[regionCode as keyof typeof regions];
    if (!region) {
      return res.status(404).json({ error: "Region not found" });
    }

    const maxResultsNum = Math.min(
      parseInt(maxResults as string, 10) || 50,
      10000,
    );
    const includeProv = includeProvisional === "true";
    const hotspotOnly = hotspot === "true";

    const newObservations: eBirdObservation[] = [];

    for (let i = 0; i < Math.min(maxResultsNum, 20); i++) {
      const hotspotData =
        hotspotOnly && hotspots[regionCode]
          ? hotspots[regionCode][
              Math.floor(Math.random() * hotspots[regionCode].length)
            ]
          : undefined;

      const obs = generateRandomObservation(regionCode, hotspotData);
      if (includeProv || obs.obsReviewed) {
        newObservations.push(obs);
      }
    }

    res.json(observations[regionCode] || newObservations);
  });

  // Notable observations in a region
  router.get("/data/obs/:regionCode/recent/notable", (req, res) => {
    const { regionCode } = req.params;
    const {
      maxResults = "50",
      includeProvisional = "false",
      hotspot = "false",
      back = "7",
    } = req.query;

    if (!regionCode) {
      return res.status(400).json({ error: "Region code is required" });
    }

    const region = regions[regionCode as keyof typeof regions];
    if (!region) {
      return res.status(404).json({ error: "Region not found" });
    }

    const maxResultsNum = Math.min(
      parseInt(maxResults as string, 10) || 50,
      10000,
    );
    const includeProv = includeProvisional === "true";
    const hotspotOnly = hotspot === "true";
    const daysBack = parseInt(back as string, 10) || 7;

    // Filter existing observations to only include those within the time window
    const cutoffDate = moment().subtract(daysBack, "days");
    const existingNotable = (notableObservations[regionCode] || []).filter(
      (obs) => moment(obs.obsDt).isAfter(cutoffDate),
    );

    const newNotableObservations: eBirdObservation[] = [];

    // Generate more observations (up to 10, or maxResultsNum if less)
    const numToGenerate = Math.min(maxResultsNum, 10);
    for (let i = 0; i < numToGenerate; i++) {
      const hotspotData =
        hotspotOnly && hotspots[regionCode]
          ? hotspots[regionCode][
              Math.floor(Math.random() * hotspots[regionCode].length)
            ]
          : undefined;

      const obs = generateRandomObservation(regionCode, hotspotData, daysBack);
      obs.obsReviewed = true;
      obs.evidence =
        Math.random() > 0.5
          ? (["P", "A", "V"][Math.floor(Math.random() * 3)] as "P" | "A" | "V")
          : null;

      if (includeProv || obs.obsReviewed) {
        newNotableObservations.push(obs);
      }
    }

    notableObservations[regionCode] = [
      ...existingNotable,
      ...newNotableObservations,
    ].slice(-maxResultsNum);

    res.json(notableObservations[regionCode]);
  });

  // Recent observations for a specific species in a region
  router.get("/data/obs/:regionCode/recent/:speciesCode", (req, res) => {
    const { regionCode, speciesCode } = req.params;
    const {
      maxResults = "50",
      includeProvisional = "false",
      hotspot = "false",
    } = req.query;

    if (!regionCode || !speciesCode) {
      return res
        .status(400)
        .json({ error: "Region code and species code are required" });
    }

    const region = regions[regionCode as keyof typeof regions];
    if (!region) {
      return res.status(404).json({ error: "Region not found" });
    }

    const speciesData = species.find((s) => s.speciesCode === speciesCode);
    if (!speciesData) {
      return res.status(404).json({ error: "Species not found" });
    }

    const maxResultsNum = Math.min(
      parseInt(maxResults as string, 10) || 50,
      10000,
    );
    const includeProv = includeProvisional === "true";
    const hotspotOnly = hotspot === "true";

    const speciesObservations: eBirdObservation[] = [];

    for (let i = 0; i < Math.min(maxResultsNum, 15); i++) {
      const hotspotData =
        hotspotOnly && hotspots[regionCode]
          ? hotspots[regionCode][
              Math.floor(Math.random() * hotspots[regionCode].length)
            ]
          : undefined;

      const obs = generateRandomObservation(regionCode, hotspotData);
      obs.speciesCode = speciesData.speciesCode;
      obs.comName = speciesData.comName;
      obs.sciName = speciesData.sciName;

      if (includeProv || obs.obsReviewed) {
        speciesObservations.push(obs);
      }
    }

    res.json(speciesObservations);
  });

  // Hotspots in a region
  router.get("/ref/hotspot/:regionCode", (req, res) => {
    const { regionCode } = req.params;
    const { maxResults = "50" } = req.query;

    if (!regionCode) {
      return res.status(400).json({ error: "Region code is required" });
    }

    const region = regions[regionCode as keyof typeof regions];
    if (!region) {
      return res.status(404).json({ error: "Region not found" });
    }

    const regionHotspots = hotspots[regionCode] || [];
    const maxResultsNum = Math.min(
      parseInt(maxResults as string, 10) || 50,
      10000,
    );

    res.json(regionHotspots.slice(0, maxResultsNum));
  });

  // Species information
  router.get("/ref/species/info/:speciesCode", (req, res) => {
    const { speciesCode } = req.params;

    if (!speciesCode) {
      return res.status(400).json({ error: "Species code is required" });
    }

    const speciesData = species.find((s) => s.speciesCode === speciesCode);
    if (!speciesData) {
      return res.status(404).json({ error: "Species not found" });
    }

    res.json({
      bandingCodes: [speciesData.speciesCode.substring(0, 4).toUpperCase()],
      category: "species",
      comName: speciesData.comName,
      comNameCodes: [speciesData.speciesCode],
      extinct: false,
      extinctYear: null,
      familyCode: "mock",
      familyComName: "Mock Family",
      familySciName: "Mockidae",
      order: "Passeriformes",
      orderCode: "passeriformes",
      reportAs: speciesData.speciesCode,
      sciName: speciesData.sciName,
      sciNameCodes: [speciesData.speciesCode],
      speciesCode: speciesData.speciesCode,
      taxonOrder: Math.floor(Math.random() * 10000),
    });
  });

  // Recent observations by geographic area
  router.get("/data/obs/geo/recent", (req, res) => {
    const {
      lat,
      lng,
      maxResults = "50",
      includeProvisional = "false",
    } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const maxResultsNum = Math.min(
      parseInt(maxResults as string, 10) || 50,
      10000,
    );
    const includeProv = includeProvisional === "true";

    const geoObservations: eBirdObservation[] = [];

    for (let i = 0; i < Math.min(maxResultsNum, 20); i++) {
      const regionCode = "US-CA";
      const obs = generateRandomObservation(regionCode);

      obs.lat = parseFloat(lat as string) + (Math.random() - 0.5) * 0.1;
      obs.lng = parseFloat(lng as string) + (Math.random() - 0.5) * 0.1;

      if (includeProv || obs.obsReviewed) {
        geoObservations.push(obs);
      }
    }

    res.json(geoObservations);
  });

  // Notable observations by geographic area
  router.get("/data/obs/geo/recent/notable", (req, res) => {
    const {
      lat,
      lng,
      maxResults = "50",
      includeProvisional = "false",
    } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const maxResultsNum = Math.min(
      parseInt(maxResults as string, 10) || 50,
      10000,
    );
    const includeProv = includeProvisional === "true";

    const geoNotableObservations: eBirdObservation[] = [];

    for (let i = 0; i < Math.min(maxResultsNum, 2); i++) {
      const regionCode = "US-CA";
      const obs = generateRandomObservation(regionCode);

      obs.lat = parseFloat(lat as string) + (Math.random() - 0.5) * 0.1;
      obs.lng = parseFloat(lng as string) + (Math.random() - 0.5) * 0.1;
      obs.obsReviewed = true;
      obs.evidence =
        Math.random() > 0.5
          ? (["P", "A", "V"][Math.floor(Math.random() * 3)] as "P" | "A" | "V")
          : null;

      if (includeProv || obs.obsReviewed) {
        geoNotableObservations.push(obs);
      }
    }

    res.json(geoNotableObservations);
  });

  return router;
}
