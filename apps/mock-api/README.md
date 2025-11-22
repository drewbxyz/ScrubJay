# Mock API

A comprehensive mock API for development and testing purposes. This includes:
- **eBird API v2**: Mock implementation that closely mirrors the real eBird API structure, endpoints, and response formats
- **RSS Feeds**: Mock RSS feeds for birding news and updates

## Features

### eBird API
- **Authentication**: API key validation (simulates eBird's authentication)
- **Rate Limiting**: 10,000 requests per day per API key (matches eBird limits)
- **Comprehensive Endpoints**: All major eBird API v2 endpoints
- **Realistic Data**: 50+ bird species with proper taxonomy
- **Geographic Support**: California region with hotspots and realistic coordinates
- **Query Parameters**: Full support for eBird API query parameters
- **Error Handling**: Proper HTTP status codes and error responses

### RSS Feeds
- **Mock Birding News**: Realistic RSS feed with birding articles and updates
- **Standard RSS 2.0 Format**: Compatible with all RSS readers and parsers
- **Dynamic Content**: Generates fresh articles with proper dates and metadata

## Available API Keys

For development and testing, use one of these API keys:

- `test-api-key`
- `dev-key-123`

## Endpoints

### Recent Observations

- `GET /v2/data/obs/{regionCode}/recent` - Recent observations in a region
- `GET /v2/data/obs/{regionCode}/recent/notable` - Notable observations in a region
- `GET /v2/data/obs/{regionCode}/recent/{speciesCode}` - Recent observations for a specific species

### Geographic Observations

- `GET /v2/data/obs/geo/recent` - Recent observations by geographic area
- `GET /v2/data/obs/geo/recent/notable` - Notable observations by geographic area

### Reference Data

- `GET /v2/ref/hotspot/{regionCode}` - Hotspots in a region
- `GET /v2/ref/species/info/{speciesCode}` - Species information

### RSS Feeds

- `GET /rss` - List all available RSS feeds
- `GET /rss/{feedId}` - Get specific RSS feed (returns RSS XML)

### Utility

- `GET /` - API information and available endpoints
- `GET /health` - Health check

## Query Parameters

### Common Parameters

- `maxResults` (default: 50, max: 10000) - Maximum number of results to return
- `includeProvisional` (default: false) - Include unconfirmed observations
- `hotspot` (default: false) - Only include hotspot observations

### Geographic Parameters

- `lat` - Latitude (required for geo endpoints)
- `lng` - Longitude (required for geo endpoints)
- `dist` - Distance in kilometers (default: 25)

## Usage Examples

### Get recent observations in California

```bash
curl -H "X-eBirdApiKey: test-api-key" \
  "http://localhost:8080/v2/data/obs/US-CA/recent?maxResults=10"
```

### Get notable observations near San Francisco

```bash
curl -H "X-eBirdApiKey: test-api-key" \
  "http://localhost:8080/v2/data/obs/geo/recent/notable?lat=37.7749&lng=-122.4194&maxResults=5"
```

### Get species information

```bash
curl -H "X-eBirdApiKey: test-api-key" \
  "http://localhost:8080/v2/ref/species/info/cascrub"
```

### Get hotspots in California

```bash
curl -H "X-eBirdApiKey: test-api-key" \
  "http://localhost:8080/v2/ref/hotspot/US-CA"
```

### List available RSS feeds

```bash
curl "http://localhost:8080/rss"
```

### Get RSS feed

```bash
curl "http://localhost:8080/rss/birding-news"
```

The RSS feed returns standard RSS 2.0 XML format with birding news articles, suitable for testing RSS ingestion functionality.

## Response Format

The API returns JSON responses that match the eBird API v2 format. Observation objects include:

```json
{
  "speciesCode": "cascrub",
  "comName": "California Scrub-Jay",
  "sciName": "Aphelocoma californica",
  "locId": "L1234567",
  "locName": "Golden Gate Park",
  "obsDt": "2024-01-15 08:30:00",
  "howMany": 3,
  "lat": 37.7694,
  "lng": -122.4862,
  "obsValid": true,
  "obsReviewed": true,
  "locationPrivate": false,
  "countryCode": "US",
  "countryName": "United States",
  "subnational1Code": "US-CA",
  "subnational1Name": "California",
  "subnational2Code": "US-CA-075",
  "subnational2Name": "San Francisco",
  "firstName": "John",
  "lastName": "Doe",
  "userDisplayName": "John Doe",
  "obsId": "obs-123",
  "checklistId": "checklist-456",
  "presenceNoted": true,
  "hasRichMedia": false,
  "hasComments": false,
  "evidence": null,
  "exoticsCategory": null,
  "isChecklistReviewed": true
}
```

## Error Responses

The API returns appropriate HTTP status codes:

- `400` - Bad Request (missing required parameters)
- `401` - Unauthorized (invalid or missing API key)
- `404` - Not Found (region or species not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Development

### Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:8080`

### Dependencies

- Express.js for the web server
- Moment.js with timezone support for date handling
- TypeScript for type safety

## Data Sources

The mock API includes:

- **50+ Bird Species**: Common North American birds, California endemics, and rare species
- **California Regions**: Complete county-level data for California
- **Hotspots**: 5 popular birding locations in California with realistic coordinates
- **Realistic Coordinates**: Proper latitude/longitude for California locations

## Rate Limiting

The API implements the same rate limiting as the real eBird API:

- 10,000 requests per day per API key
- 24-hour rolling window
- Returns 429 status when limit exceeded

## Authentication

All eBird API endpoints (`/v2/*`) require the `X-eBirdApiKey` header with a valid API key. This matches the real eBird API authentication method.

RSS feed endpoints (`/rss/*`) do not require authentication.

## Project Structure

The application is organized into modular components:

```
src/
├── data/           # Static data (species, regions, hotspots)
├── middleware/     # Express middleware (auth, rate limiting)
├── routes/         # Route handlers (ebird, rss)
├── services/       # Business logic (RSS generation)
└── index.ts        # Application entry point
```

This structure makes it easy to add new features, endpoints, or data sources.
