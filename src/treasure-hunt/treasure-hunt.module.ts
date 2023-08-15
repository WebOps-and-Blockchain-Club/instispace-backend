import { Module } from '@nestjs/common';
import { QuestionsModule } from './questions/questions.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { GroupModule } from './group/group.module';
import { ConfigModule } from './config/config.module';

@Module({
    imports: [QuestionsModule,SubmissionsModule,GroupModule, ConfigModule]
})
export class TreasureHuntModule {
    constructor() {}
}
