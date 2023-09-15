import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsResolver } from './submissions.resolver';
import { UserModule } from 'src/user/user.module';
import { Submission } from './submission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsModule } from '../questions/questions.module';
import { ConfigModule } from '../config/config.module';
import { GroupModule } from '../group/group.module';

@Module({
  providers: [SubmissionsResolver, SubmissionsService],
  imports: [
    TypeOrmModule.forFeature([Submission]),
    UserModule,
    QuestionsModule,
    ConfigModule,
    GroupModule,
  ],
})
export class SubmissionsModule {}
