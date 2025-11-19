import { Module } from "@nestjs/common";
import { FiltersModule } from "@/features/filters/filters.module";
import { UtilCommands } from "./util-commands.service";

@Module({
  imports: [FiltersModule],
  providers: [UtilCommands],
})
export class CommandsModule {}
