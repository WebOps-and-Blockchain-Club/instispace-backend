import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from 'src/notification/notification.module';
import { TagModule } from 'src/tag/tag.module';
import { UserModule } from 'src/user/user.module';
import { Post } from './post.entity';

import { PostResolver } from './post.resolver';
import { PostService } from './post.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Post]),
    // NotificationModule,
    TagModule,
  ],
  controllers: [],
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {
  constructor() {}
}
