import { Module } from "@nestjs/common";
import { DispatcherRepository } from "./dispatcher.repository";
import { DispatcherService } from "./dispatcher.service";

@Module({
  providers: [DispatcherRepository],
  exports: [DispatcherService],
})
export class DispatcherModule {}
