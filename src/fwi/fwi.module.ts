import { Module } from '@nestjs/common';
import { FwiService } from './fwi.service';

@Module({
  providers: [FwiService],
  exports: [FwiService]
})
export class FwiModule {}
