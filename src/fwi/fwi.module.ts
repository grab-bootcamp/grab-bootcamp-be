import { Module } from '@nestjs/common';
import { FwiService } from './fwi.service';

@Module({
  providers: [FwiService]
})
export class FwiModule {}
