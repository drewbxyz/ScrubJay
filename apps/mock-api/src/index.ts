import express from "express";
import moment from "moment-timezone";

import { hotspots } from "./hotspots";
import { regions } from "./regions";
import { species } from "./species";

const app = express();
const PORT = 8080;

// In-memory storage for observations
const observations: Record<string, eBirdObservation[]> = {};
const notableObservations: Record<string, eBirdObservation[]> = {};
const apiKeys = new Set(["test-api-key", "dev-key-123"]); // Simple API key storage

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
      locId: hotspot.locId,
      locName: hotspot.locName,
      lat: hotspot.lat,
      lng: hotspot.lng,
    }));
  }
});

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

// Rate limiting storage
const rateLimits: Record<string, { count: number; resetTime: number }> = {};

// Middleware for API key authentication
const authenticateApiKey = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const apiKey = req.headers["x-ebirdapitoken"] as string;

  console.log("apiKey", apiKey);

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (!apiKeys.has(apiKey)) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  next();
};

// Rate limiting middleware
const rateLimit = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const apiKey = req.headers["x-ebirdapitoken"] as string;
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxRequests = 10000; // eBird API limit

  if (!rateLimits[apiKey] || now > rateLimits[apiKey].resetTime) {
    rateLimits[apiKey] = { count: 0, resetTime: now + windowMs };
  }

  if (rateLimits[apiKey].count >= maxRequests) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  rateLimits[apiKey].count++;
  next();
};

function generateRandomObservation(
  regionCode: string,
  hotspot?: { locId: string; locName: string; lat: number; lng: number }
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
    // Use provided hotspot
    hotspotData = hotspot;
  } else {
    // 80% chance to reuse existing location, 20% chance to create new one
    const shouldReuseLocation = Math.random() < 0.8;
    const availableLocations = locationPool[regionCode] || [];

    if (shouldReuseLocation && availableLocations.length > 0) {
      // Reuse existing location
      const randomLocation =
        availableLocations[
          Math.floor(Math.random() * availableLocations.length)
        ];
      hotspotData = randomLocation!; // We know it exists because we checked length > 0
    } else {
      // Create new location and add to pool
      hotspotData = {
        locId: crypto.randomUUID(),
        locName: `Random Location ${Math.floor(Math.random() * 1000)}`,
        lat: 37.7749 + (Math.random() - 0.5) * 0.1,
        lng: -122.4194 + (Math.random() - 0.5) * 0.1,
      };

      // Add new location to pool for future reuse
      if (!locationPool[regionCode]) {
        locationPool[regionCode] = [];
      }
      locationPool[regionCode].push(hotspotData);
    }
  }

  const obsDt = moment()
    .subtract(Math.floor(Math.random() * 30), "days")
    .format("YYYY-MM-DD HH:mm:ss");

  return {
    speciesCode: randomSpecies.speciesCode,
    comName: randomSpecies.comName,
    sciName: randomSpecies.sciName,
    locId: hotspotData.locId,
    locName: hotspotData.locName,
    obsDt,
    howMany: Math.floor(Math.random() * 10) + 1,
    lat: hotspotData.lat,
    lng: hotspotData.lng,
    obsValid: true,
    obsReviewed: Math.random() > 0.3,
    locationPrivate: false,
    subId: crypto.randomUUID(),
    countryCode: "US",
    countryName: "United States",
    subnational1Code: region.code,
    subnational1Name: region.name,
    subnational2Code:
      region.counties[randomSubregion as keyof typeof region.counties],
    subnational2Name: randomSubregion,
    firstName: "John",
    lastName: "Doe",
    userDisplayName: "John Doe",
    obsId: crypto.randomUUID(),
    checklistId: crypto.randomUUID(),
    presenceNoted: true,
    hasRichMedia: Math.random() > 0.8,
    hasComments: Math.random() > 0.7,
    evidence:
      Math.random() > 0.9
        ? (["P", "A", "V"][Math.floor(Math.random() * 3)] as "P" | "A" | "V")
        : null,
    exoticsCategory: null,
    isChecklistReviewed: Math.random() > 0.2,
  };
}

app.use(express.json());

// Apply authentication and rate limiting to all API routes
app.use("/v2", authenticateApiKey, rateLimit);

app.get("/", (_req, res) => {
  res.json({
    message: "eBird Mock API Server for Development",
    version: "2.0",
    endpoints: [
      "GET /v2/data/obs/{regionCode}/recent",
      "GET /v2/data/obs/{regionCode}/recent/notable",
      "GET /v2/data/obs/{regionCode}/recent/{speciesCode}",
      "GET /v2/ref/hotspot/{regionCode}",
      "GET /v2/ref/species/info/{speciesCode}",
      "GET /v2/data/obs/geo/recent",
      "GET /v2/data/obs/geo/recent/notable",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Recent observations in a region
app.get("/v2/data/obs/:regionCode/recent", (req, res) => {
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

  const maxResultsNum = Math.min(parseInt(maxResults as string) || 50, 10000);
  const includeProv = includeProvisional === "true";
  const hotspotOnly = hotspot === "true";

  // Generate observations
  const regionObservations = observations[regionCode] || [];
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

  res.json(observations[regionCode]);
});

// Notable observations in a region
app.get("/v2/data/obs/:regionCode/recent/notable", (req, res) => {
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

  const maxResultsNum = Math.min(parseInt(maxResults as string) || 50, 10000);
  const includeProv = includeProvisional === "true";
  const hotspotOnly = hotspot === "true";

  // Get previously generated notable observations
  const existingNotable = notableObservations[regionCode] || [];

  // Generate new notable observations (rarer species)
  const newNotableObservations: eBirdObservation[] = [];

  for (let i = 0; i < Math.min(maxResultsNum, 2); i++) {
    const hotspotData =
      hotspotOnly && hotspots[regionCode]
        ? hotspots[regionCode][
            Math.floor(Math.random() * hotspots[regionCode].length)
          ]
        : undefined;

    const obs = generateRandomObservation(regionCode, hotspotData);
    // Make it more likely to be notable
    obs.obsReviewed = true;
    obs.evidence =
      Math.random() > 0.5
        ? (["P", "A", "V"][Math.floor(Math.random() * 3)] as "P" | "A" | "V")
        : null;

    if (includeProv || obs.obsReviewed) {
      newNotableObservations.push(obs);
    }
  }

  // Combine existing and new notable observations, keeping most recent
  notableObservations[regionCode] = [
    ...existingNotable,
    ...newNotableObservations,
  ].slice(-maxResultsNum);

  res.json(notableObservations[regionCode]);
});

// Recent observations for a specific species in a region
app.get("/v2/data/obs/:regionCode/recent/:speciesCode", (req, res) => {
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

  const maxResultsNum = Math.min(parseInt(maxResults as string) || 50, 10000);
  const includeProv = includeProvisional === "true";
  const hotspotOnly = hotspot === "true";

  // Generate observations for specific species
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
app.get("/v2/ref/hotspot/:regionCode", (req, res) => {
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
  const maxResultsNum = Math.min(parseInt(maxResults as string) || 50, 10000);

  res.json(regionHotspots.slice(0, maxResultsNum));
});

// Species information
app.get("/v2/ref/species/info/:speciesCode", (req, res) => {
  const { speciesCode } = req.params;

  if (!speciesCode) {
    return res.status(400).json({ error: "Species code is required" });
  }

  const speciesData = species.find((s) => s.speciesCode === speciesCode);
  if (!speciesData) {
    return res.status(404).json({ error: "Species not found" });
  }

  res.json({
    speciesCode: speciesData.speciesCode,
    comName: speciesData.comName,
    sciName: speciesData.sciName,
    category: "species",
    taxonOrder: Math.floor(Math.random() * 10000),
    bandingCodes: [speciesData.speciesCode.substring(0, 4).toUpperCase()],
    comNameCodes: [speciesData.speciesCode],
    sciNameCodes: [speciesData.speciesCode],
    order: "Passeriformes",
    familyComName: "Mock Family",
    familySciName: "Mockidae",
    reportAs: speciesData.speciesCode,
    extinct: false,
    extinctYear: null,
    familyCode: "mock",
    orderCode: "passeriformes",
  });
});

// Recent observations by geographic area
app.get("/v2/data/obs/geo/recent", (req, res) => {
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

  const maxResultsNum = Math.min(parseInt(maxResults as string) || 50, 10000);
  const includeProv = includeProvisional === "true";

  // Generate observations near the given coordinates
  const geoObservations: eBirdObservation[] = [];

  for (let i = 0; i < Math.min(maxResultsNum, 20); i++) {
    // Use a default region or try to determine from coordinates
    const regionCode = "US-CA"; // Default to California for now
    const obs = generateRandomObservation(regionCode);

    // Adjust coordinates to be near the requested location
    obs.lat = parseFloat(lat as string) + (Math.random() - 0.5) * 0.1;
    obs.lng = parseFloat(lng as string) + (Math.random() - 0.5) * 0.1;

    if (includeProv || obs.obsReviewed) {
      geoObservations.push(obs);
    }
  }

  res.json(geoObservations);
});

// Notable observations by geographic area
app.get("/v2/data/obs/geo/recent/notable", (req, res) => {
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

  const maxResultsNum = Math.min(parseInt(maxResults as string) || 50, 10000);
  const includeProv = includeProvisional === "true";

  // Generate notable observations near the given coordinates
  const geoNotableObservations: eBirdObservation[] = [];

  for (let i = 0; i < Math.min(maxResultsNum, 2); i++) {
    // Use a default region or try to determine from coordinates
    const regionCode = "US-CA"; // Default to California for now
    const obs = generateRandomObservation(regionCode);

    // Adjust coordinates to be near the requested location
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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`eBird Mock API Server is running on http://localhost:${PORT}`);
  console.log(`Available API keys: ${Array.from(apiKeys).join(", ")}`);
});
