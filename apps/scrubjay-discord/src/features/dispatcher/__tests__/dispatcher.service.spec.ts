import { Test, type TestingModule } from "@nestjs/testing";
import { DispatcherService } from "../dispatcher.service";
import { EBirdDispatcherService } from "../dispatchers/ebird-dispatcher.service";
import { RssDispatcherService } from "../dispatchers/rss-dispatcher.service";

describe("DispatcherService", () => {
  let service: DispatcherService;

  const ebirdDispatcherMock = {
    dispatchSince: jest.fn(),
    getUndeliveredSinceDate: jest.fn(),
  } as unknown as jest.Mocked<EBirdDispatcherService>;

  const rssDispatcherMock = {
    dispatchSince: jest.fn(),
    getUndeliveredSinceDate: jest.fn(),
  } as unknown as jest.Mocked<RssDispatcherService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DispatcherService,
          useFactory: () =>
            new DispatcherService(ebirdDispatcherMock, rssDispatcherMock),
        },
      ],
    }).compile();

    service = module.get<DispatcherService>(DispatcherService);
    jest.clearAllMocks();
  });

  it("routes dispatchSince to correct dispatcher based on type", async () => {
    const since = new Date("2024-01-01T00:00:00Z");

    await service.dispatchSince("ebird", since);
    expect(ebirdDispatcherMock.dispatchSince).toHaveBeenCalledWith(since);

    await service.dispatchSince("rss", since);
    expect(rssDispatcherMock.dispatchSince).toHaveBeenCalledWith(since);
  });

  it("routes getUndeliveredSinceDate to correct dispatcher based on type", async () => {
    const since = new Date("2024-01-01T00:00:00Z");

    await service.getUndeliveredSinceDate("ebird", since);
    expect(ebirdDispatcherMock.getUndeliveredSinceDate).toHaveBeenCalledWith(
      since,
    );

    await service.getUndeliveredSinceDate("rss", since);
    expect(rssDispatcherMock.getUndeliveredSinceDate).toHaveBeenCalledWith(
      since,
    );
  });
});
