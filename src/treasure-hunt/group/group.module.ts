import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { UserModule } from 'src/user/user.module';
import { Group } from './group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  providers: [GroupResolver, GroupService],
  imports:[ TypeOrmModule.forFeature([Group]),UserModule,ConfigModule,QuestionsModule]
})
export class GroupModule {}
