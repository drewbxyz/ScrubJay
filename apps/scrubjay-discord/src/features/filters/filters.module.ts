import { Module } from "@nestjs/common";
import { FiltersRepository } from "./filters.repository";
import { FiltersService } from "./filters.service";
import { FiltersAddHandler } from "./handlers/filters-add.handler";

@Module({
  exports: [FiltersService, FiltersAddHandler],
  imports: [],
  providers: [FiltersService, FiltersRepository, FiltersAddHandler],
})
export class FiltersModule {}
