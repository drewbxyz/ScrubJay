import { sql } from 'drizzle-orm';
import {
  integer,
  text,
  real,
  primaryKey,
  index,
  boolean,
  timestamp,
  pgTable,
  jsonb,
} from 'drizzle-orm/pg-core';

import { timezones } from '@/shared/timezones';

export const locations = pgTable(
  'location',
  {
    id: text('id').primaryKey(),
    county: text('county').notNull(),
    countyCode: text('county_code').notNull(),
    state: text('state').notNull(),
    stateCode: text('state_code').notNull(),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    name: text('name').notNull(),
    isPrivate: boolean('is_private').notNull(),
    lastUpdated: timestamp('last_updated')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('county_state_code_idx').on(table.countyCode, table.stateCode),
  ]
);

export const observations = pgTable(
  'observation',
  {
    speciesCode: text('species_code').notNull(),
    subId: text('sub_id').notNull(),
    comName: text('common_name').notNull(),
    sciName: text('scientific_name').notNull(),
    locId: text('location_id')
      .references(() => locations.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .notNull(),
    obsDt: timestamp('observation_date').notNull(),
    howMany: integer('how_many').notNull(),
    obsValid: boolean('observation_valid').notNull(),
    obsReviewed: boolean('observation_reviewed').notNull(),
    presenceNoted: boolean('presence_noted').notNull(),
    photoCount: integer('photo_count').notNull().default(0),
    audioCount: integer('audio_count').notNull().default(0),
    videoCount: integer('video_count').notNull().default(0),
    hasComments: boolean('has_comments').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    lastUpdated: timestamp('last_updated')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    primaryKey({ columns: [t.speciesCode, t.subId] }),
    index('obs_created_at_idx').on(t.createdAt),
    index('obs_location_date_idx').on(t.locId, t.obsDt),
    index('obs_review_valid_date_idx').on(t.obsReviewed, t.obsValid, t.obsDt),
  ]
);

export const channelEBirdSubscriptions = pgTable(
  'channel_ebird_subscription',
  {
    channelId: text('channel_id').notNull(),
    stateCode: text('state_code').notNull(),
    countyCode: text('county_code'), // NULL means subscribe to all counties in state
    active: boolean('active').notNull().default(true),
    lastUpdated: timestamp('last_updated')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    primaryKey({ columns: [t.channelId, t.stateCode, t.countyCode] }),
    index('state_county_idx').on(t.stateCode, t.countyCode),
    index('active_state_county_idx').on(t.active, t.stateCode, t.countyCode),
  ]
);

export const filteredSpecies = pgTable(
  'filtered_species',
  {
    commonName: text('common_name').notNull(),
    channelId: text('channel_id').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.commonName, t.channelId] }),
    index('common_name_channel_id_idx').on(t.commonName, t.channelId),
  ]
);

export const countyTimezones = pgTable(
  'county_timezones',
  {
    countyCode: text('county_code').primaryKey(),
    timezone: text('timezone', { enum: timezones })
      .notNull()
      .default('America/Los_Angeles'),
  },
  (t) => [index('county_code_idx').on(t.countyCode)]
);

export const SourceType = ['EBIRD'] as const;

// --- Base source table with common fields ---
export const sources = pgTable(
  'source',
  {
    id: text('id').primaryKey(), // e.g. "sandiegoregionbirding"
    type: text('type', { enum: SourceType }).notNull(),
    fetchIntervalMin: integer('fetch_interval_min').notNull().default(20),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index('source_type_active_idx').on(t.type, t.active)]
);

// --- eBird source specific fields ---
export const ebirdSources = pgTable(
  'ebird_source',
  {
    sourceId: text('source_id')
      .primaryKey()
      .references(() => sources.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    regionName: text('region_name').notNull(),
    regionCode: text('region_code').notNull(),
  }
);

export const deliveries = pgTable(
  'delivery',
  {
    kind: text('kind', { enum: ['RSS', 'EBIRD', 'EMAIL'] }).notNull(),
    itemKey: text('item_key').notNull(),
    channelId: text('channel_id').notNull(),
    messageId: text('message_id'),
    deliveredAt: timestamp('delivered_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    primaryKey({ columns: [t.kind, t.itemKey, t.channelId] }),
    index('delivery_channel_kind_idx').on(t.channelId, t.kind),
  ]
);