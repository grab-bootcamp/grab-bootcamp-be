import { Module } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';

import { DbService } from './db.service';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [ DbService],
    exports: [DbService]
    
})
export class DbModule {
    
}
