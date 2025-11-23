import { Test, type TestingModule } from "@nestjs/testing";
import type { MessageReaction } from "discord.js";
import { FiltersAddHandler } from "../handlers/filters-add.handler";
import { FiltersService } from "../filters.service";

describe("FiltersAddHandler", () => {
  let handler: FiltersAddHandler;

  const filtersServiceMock = {
    addFilter: jest.fn(),
    isChannelFilterable: jest.fn(),
  } as unknown as jest.Mocked<FiltersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FiltersAddHandler,
          useFactory: () =>
            new FiltersAddHandler(
              filtersServiceMock as unknown as FiltersService,
            ),
        },
      ],
    }).compile();

    handler = module.get<FiltersAddHandler>(FiltersAddHandler);
    jest.clearAllMocks();
  });

  it("detects supported emoji", () => {
    expect(handler.supports("👎")).toBe(true);
    expect(handler.supports("👍")).toBe(false);
  });

  it("adds a filter when the channel is filterable and an embed title exists", async () => {
    filtersServiceMock.isChannelFilterable.mockResolvedValue(true);

    const reaction = {
      count: 3,
      message: {
        channelId: "channel-1",
        embeds: [{ title: "Snowy Owl - King County" }],
      },
    } as unknown as MessageReaction;

    await handler.execute({ reaction, user: {} as never });

    expect(filtersServiceMock.addFilter).toHaveBeenCalledWith(
      "channel-1",
      "Snowy Owl",
    );
  });

  it("does not add a filter when the channel is not filterable", async () => {
    filtersServiceMock.isChannelFilterable.mockResolvedValue(false);

    const reaction = {
      count: 5,
      message: {
        channelId: "channel-2",
        embeds: [{ title: "Barn Owl - Pierce County" }],
      },
    } as unknown as MessageReaction;

    await handler.execute({ reaction, user: {} as never });

    expect(filtersServiceMock.addFilter).not.toHaveBeenCalled();
  });
});
