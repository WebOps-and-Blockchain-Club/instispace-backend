import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsResolver } from './reports.resolver';
import { PostModule } from '../post.module';
import { Report } from './report.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from '../comments/comments.module';
import { ReportreasonsModule } from '../reportReasons/reportReasons.module';
import { NotifConfigModule } from 'src/notif-config/notif-config.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    PostModule,
    CommentsModule,
    ReportreasonsModule,
    NotificationModule,
  ],
  providers: [ReportsResolver, ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {
  constructor() {}
}
