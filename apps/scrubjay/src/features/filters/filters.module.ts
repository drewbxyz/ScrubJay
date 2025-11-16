import { Module } from "@nestjs/common";
import { FiltersService } from "./filters.service";
import { FiltersAddHandler } from "./handlers/filters-add.handler";
import { FiltersRepository } from "./filters.repository";
import { DrizzleService } from "@/core/drizzle/drizzle.service";

@Module({
  imports: [DrizzleService],
  providers: [FiltersService, FiltersRepository, FiltersAddHandler],
  exports: [FiltersService, FiltersAddHandler],
})
export class FiltersModule {}
