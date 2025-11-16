import { z } from "zod";

export const RawEBirdObservationSchema = z.object({
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
  userDisplayName: z.string().optional().default(""),
  obsId: z.string(),
  checklistId: z.string(),
  presenceNoted: z.boolean(),
  hasComments: z.boolean(),
  evidence: z.enum(["P", "A", "V"]).optional().nullable(),
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  hasRichMedia: z.boolean(),
});

export type EBirdObservation = z.infer<typeof RawEBirdObservationSchema>;

export type EBirdObservationResponse = z.infer<
  typeof RawEBirdObservationSchema
>;

export interface EBirdMediaCounts {
  photoCount: number;
  audioCount: number;
  videoCount: number;
}

export type TransformedEBirdObservation = Omit<EBirdObservation, "evidence"> &
  EBirdMediaCounts;

export type EBirdLocation = Pick<
  EBirdObservation,
  | "locId"
  | "locName"
  | "countryCode"
  | "countryName"
  | "subnational1Code"
  | "subnational1Name"
  | "subnational2Code"
  | "subnational2Name"
  | "locationPrivate"
  | "lat"
  | "lng"
>;
