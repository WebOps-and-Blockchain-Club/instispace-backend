import { Module } from '@nestjs/common';
import { CommentsModule } from './comments/comments.module';
import { PostModule } from './post.module';
import { ReportreasonsModule } from './reportReasons/reportReasons.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [PostModule, CommentsModule, ReportreasonsModule, ReportsModule],
})
export class PostParentModule {
  constructor() {}
}
