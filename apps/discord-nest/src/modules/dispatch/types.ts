export interface GroupedObservation {
  species: {
    code: string;
    commonName: string;
  };
  location: {
    id: string;
    name: string;
    county: string;
    isPrivate: boolean;
  };
  reports: {
    subId: string;
    count: number;
    maxCount: number;
    latestTimestamp: Date;
    confirmedLastWeek: boolean;
    media: {
      photos: number;
      audio: number;
      video: number;
    };
  };
}
