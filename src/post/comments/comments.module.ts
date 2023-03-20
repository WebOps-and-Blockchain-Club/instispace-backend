import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifConfigModule } from 'src/notif-config/notif-config.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PostModule } from 'src/post/post.module';
import { Comments } from './comment.entity';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comments]),
    PostModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [CommentsResolver, CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {
  constructor() {}
}
