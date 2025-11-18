import { Test, type TestingModule } from "@nestjs/testing";
import { EmbedBuilder } from "discord.js";
import { DiscordHelper } from "@/discord/discord.helper";
import { DeliveriesService } from "@/features/deliveries/deliveries.service";
import { DispatcherService } from "../dispatcher.service";
import { DispatcherRepository } from "../dispatcher.repository";
import type { DispatchableObservation } from "../dispatcher.schema";

describe("DispatcherService", () => {
  let service: DispatcherService;

  const repoMock = {
    getConfirmedSinceDate: jest.fn(),
    getUndeliveredObservationsSinceDate: jest.fn(),
  } as unknown as jest.Mocked<DispatcherRepository>;

  const deliveriesMock = {
    recordDeliveries: jest.fn(),
  } as unknown as jest.Mocked<DeliveriesService>;

  const discordMock = {
    sendEmbedToChannel: jest.fn(),
  } as unknown as jest.Mocked<DiscordHelper>;

  const baseObservation: DispatchableObservation = {
    audioCount: 0,
    channelId: "channel-1",
    comName: "Common Loon",
    county: "King",
    createdAt: new Date("2024-01-02T10:00:00Z"),
    howMany: 2,
    isPrivate: false,
    locationName: "Lake Union",
    locId: "loc-1",
    obsDt: new Date("2024-01-02T10:00:00Z"),
    photoCount: 1,
    sciName: "Gavia immer",
    speciesCode: "comloo",
    state: "Washington",
    subId: "sub-1",
    videoCount: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DispatcherService,
          useFactory: () =>
            new DispatcherService(
              repoMock as unknown as DispatcherRepository,
              deliveriesMock as unknown as DeliveriesService,
              discordMock as unknown as DiscordHelper,
            ),
        },
      ],
    }).compile();

    service = module.get<DispatcherService>(DispatcherService);
    jest.clearAllMocks();
  });

  it("returns early when there are no new observations", async () => {
    repoMock.getUndeliveredObservationsSinceDate.mockResolvedValue([]);

    const since = new Date("2024-01-01T00:00:00Z");
    await service.dispatchEBirdSince(since);

    expect(repoMock.getUndeliveredObservationsSinceDate).toHaveBeenCalledWith(
      since,
    );
    expect(repoMock.getConfirmedSinceDate).not.toHaveBeenCalled();
    expect(discordMock.sendEmbedToChannel).not.toHaveBeenCalled();
    expect(deliveriesMock.recordDeliveries).not.toHaveBeenCalled();
  });

  it("groups observations, sends embeds, and records deliveries", async () => {
    const observations: DispatchableObservation[] = [
      baseObservation,
      {
        ...baseObservation,
        audioCount: 1,
        obsDt: new Date("2024-01-02T12:00:00Z"),
        photoCount: 0,
        subId: "sub-2",
      },
      {
        ...baseObservation,
        channelId: "channel-2",
        comName: "Red-tailed Hawk",
        county: "Pierce",
        locId: "loc-2",
        locationName: "Mount Tacoma",
        obsDt: new Date("2024-01-02T09:00:00Z"),
        speciesCode: "rethaw",
        subId: "sub-3",
      },
    ];

    repoMock.getUndeliveredObservationsSinceDate.mockResolvedValue(
      observations,
    );
    repoMock.getConfirmedSinceDate.mockResolvedValue([
      { speciesCode: "comloo", locId: "loc-1" },
    ]);
    discordMock.sendEmbedToChannel.mockResolvedValue(true);

    await service.dispatchEBirdSince(new Date("2024-01-01T00:00:00Z"));

    expect(repoMock.getConfirmedSinceDate).toHaveBeenCalledWith(
      expect.any(Date),
    );
    expect(discordMock.sendEmbedToChannel).toHaveBeenCalledTimes(2);

    const confirmedEmbed = discordMock.sendEmbedToChannel.mock.calls.find(
      ([channelId]) => channelId === "channel-1",
    )?.[1] as EmbedBuilder;
    expect(confirmedEmbed.data.color).toBe(0x2ecc71);

    const unconfirmedEmbed = discordMock.sendEmbedToChannel.mock.calls.find(
      ([channelId]) => channelId === "channel-2",
    )?.[1] as EmbedBuilder;
    expect(unconfirmedEmbed.data.color).toBe(0xf1c40f);

    expect(deliveriesMock.recordDeliveries).toHaveBeenCalledWith([
      { alertId: "comloo:sub-1", alertKind: "ebird", channelId: "channel-1" },
      { alertId: "comloo:sub-2", alertKind: "ebird", channelId: "channel-1" },
      { alertId: "rethaw:sub-3", alertKind: "ebird", channelId: "channel-2" },
    ]);
  });
});
