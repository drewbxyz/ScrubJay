import { Injectable } from "@nestjs/common";
import {
  EBirdLocation,
  EBirdObservation,
  TransformedEBirdObservation,
} from "./ebird.schema";

@Injectable()
export class EBirdTransformer {
  private countMedia(observation: EBirdObservation) {
    return {
      photoCount: observation.evidence === "P" ? 1 : 0,
      audioCount: observation.evidence === "A" ? 1 : 0,
      videoCount: observation.evidence === "V" ? 1 : 0,
    };
  }

  private isPresenceNoted(curr: boolean, acc: boolean) {
    return curr || acc;
  }

  transformObservations(raw: EBirdObservation[]) {
    const reduced = raw.reduce((acc, observation) => {
      const key = `${observation.speciesCode}-${observation.subId}`;
      const mediaCounts = this.countMedia(observation);

      const existing = acc.get(key);
      if (existing) {
        acc.set(key, {
          ...existing,
          photoCount: existing.photoCount + mediaCounts.photoCount,
          videoCount: existing.videoCount + mediaCounts.videoCount,
          audioCount: existing.audioCount + mediaCounts.audioCount,
          presenceNoted: this.isPresenceNoted(
            existing.presenceNoted,
            observation.presenceNoted
          ),
        });
      } else {
        acc.set(key, {
          ...observation,
          ...mediaCounts,
        });
      }

      return acc;
    }, new Map<string, TransformedEBirdObservation>());
    return Array.from(reduced.values());
  }

  extractLocation(
    observation: EBirdObservation | TransformedEBirdObservation
  ): EBirdLocation {
    return {
      locId: observation.locId,
      locName: observation.locName,
      countryCode: observation.countryCode,
      countryName: observation.countryName,
      subnational1Code: observation.subnational1Code,
      subnational1Name: observation.subnational1Name,
      subnational2Code: observation.subnational2Code,
      subnational2Name: observation.subnational2Name,
      locationPrivate: observation.locationPrivate,
      lat: observation.lat,
      lng: observation.lng,
    };
  }
}
