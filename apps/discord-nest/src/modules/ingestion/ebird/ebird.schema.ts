import { z } from 'zod';

export const ebirdObservationSchema = z.object({
    speciesCode: z.string(),
    comName: z.string(),
    sciName: z.string(),
    locId: z.string(),
    locName: z.string(),
    obsDt: z.string(),
    howMany: z.number().optional(),
    lat: z.number(),
    lng: z.number(),
    obsValid: z.boolean(),
    obsReviewed: z.boolean(),
    locationPrivate: z.boolean(),
    subId: z.string(),
    subnational2Code: z.string(),
    subnational2Name: z.string(),
    subnational1Code: z.string(),
    subnational1Name: z.string(),
    countryCode: z.string(),
    countryName: z.string(),
    userDisplayName: z.string().optional().default(''),
    obsId: z.string(),
    checklistId: z.string(),
    presenceNoted: z.boolean(),
    hasComments: z.boolean(),
    evidence: z.enum(['P', 'A', 'V']).optional().nullable(),
    firstName: z.string().optional().default(''),
    lastName: z.string().optional().default(''),
    hasRichMedia: z.boolean(),
});

export type EBirdObservation = z.infer<typeof ebirdObservationSchema>;

export const ebirdObservationResponseSuccessSchema = z.object({
    type: z.literal('success'),
    observations: z.array(ebirdObservationSchema),
});

export const ebirdObservationResponseErrorSchema = z.object({
    type: z.literal('error'),
    message: z.string(),
});

export const ebirdObservationResponseSchema = z.discriminatedUnion('type', [
    ebirdObservationResponseSuccessSchema,
    ebirdObservationResponseErrorSchema,
]);

export type EBirdObservationResponse = z.infer<
    typeof ebirdObservationResponseSchema
>;

export interface MediaCounts {
    photos: number;
    audio: number;
    video: number;
}

export type EBirdObservationWithMediaCounts = EBirdObservation & MediaCounts;

