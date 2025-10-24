import { z } from "zod";

export const SourceType = ['RSS', 'EBIRD', 'EMAIL'] as const;

// Base source interface
export interface BaseSource {
    id: string;
    type: typeof SourceType[number];
    fetchIntervalMin: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// RSS source specific data
export interface RssSourceData {
    url: string;
    format: 'rss' | 'atom' | 'unknown';
    etag?: string;
    lastModified?: string;
}

// eBird source specific data
export interface EBirdSourceData {
    regionName: string;
    regionCode: string;
}

// Email source specific data
export interface EmailSourceData {
    imapHost: string;
    imapPort: number;
    username: string;
    password: string;
}

export interface EBirdSource extends BaseSource {
    type: 'EBIRD';
    data: EBirdSourceData;
}

// Union type for all sources
export type Source = EBirdSource;

// Type guards
export function isEBirdSource(source: Source): source is EBirdSource {
    return source.type === 'EBIRD';
}

// Zod schemas for validation
export const EBirdSourceDataSchema = z.object({
    regionName: z.string().min(1),
    regionCode: z.string().min(1),
});

export const EmailSourceDataSchema = z.object({
    imapHost: z.string().min(1),
    imapPort: z.number().int().positive(),
    username: z.string().min(1),
    password: z.string().min(1),
});