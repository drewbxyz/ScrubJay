import { Module } from "@nestjs/common";
import { FiltersService } from "./filters.service";
import { FiltersAddHandler } from "./handlers/filters-add.handler";
import { FiltersRepository } from "./filters.repository";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";

@Module({
  imports: [DrizzleModule],
  providers: [FiltersService, FiltersRepository, FiltersAddHandler],
  exports: [FiltersService, FiltersAddHandler],
})
export class FiltersModule {}
