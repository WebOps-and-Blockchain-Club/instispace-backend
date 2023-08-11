import { Module } from '@nestjs/common';
import { QuestionsModule } from './questions/questions.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { GroupModule } from './group/group.module';

@Module({
    imports: [QuestionsModule,SubmissionsModule,GroupModule]
})
export class TreasureHuntModule {
    constructor() {}
}
