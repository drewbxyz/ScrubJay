import { EBirdDispatchService } from "@/modules/dispatch/ebird/ebird.dispatch";
import { Cron } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";
import { EBirdIngestionService } from "@/modules/ingestion/ebird/ebird.ingestion";
import { SourcesService } from "@/modules/sources/sources.service";

@Injectable()
export class EBirdWorkflow {
  private readonly logger = new Logger(EBirdWorkflow.name);
  constructor(
    private readonly ebirdDispatchService: EBirdDispatchService,
    private readonly ebirdIngestionService: EBirdIngestionService,
    private readonly sourcesService: SourcesService,
  ) {}

  @Cron('*/20 * * * * *')
  async runWorkflow() {
   
    try {
      this.logger.log('Running eBird workflow');

      const source = await this.sourcesService.getActiveSourcesByType('EBIRD');
      if (!source) {
        this.logger.error('No active eBird source found');
        return;
      }

      this.logger.log(`Found ${source.length} active eBird sources`);

      await Promise.allSettled(source.map(async (source) => {
        try {
          await this.ebirdIngestionService.ingest(source);
          this.logger.log(`Successfully ingested source ${source.id}`);
        } catch (error) {
          this.logger.error(`Error ingesting source ${source.id}: ${error}`);
        }
      }));
      
      // await this.ebirdDispatchService.dispatch()
    } catch (error) {
      this.logger.error(`Error running eBird workflow: ${error}`);
      throw error;
    }
  }
}