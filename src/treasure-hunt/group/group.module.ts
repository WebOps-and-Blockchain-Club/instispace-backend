import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { UserModule } from 'src/user/user.module';
import { Group } from './group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [GroupResolver, GroupService],
  imports:[ TypeOrmModule.forFeature([Group]),UserModule]
})
export class GroupModule {}
