import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Post } from './post.entity';

import { PostResolver } from './post.resolver';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UserModule],
  controllers: [],
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {
  constructor() {
    console.log('post module');
  }
}
