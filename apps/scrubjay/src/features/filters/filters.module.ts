import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { FiltersRepository } from "./filters.repository";
import { FiltersService } from "./filters.service";
import { FiltersAddHandler } from "./handlers/filters-add.handler";

@Module({
  exports: [FiltersService, FiltersAddHandler],
  imports: [DrizzleModule],
  providers: [FiltersService, FiltersRepository, FiltersAddHandler],
})
export class FiltersModule {}
