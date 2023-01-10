import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';

import { PostResolver } from './post.resolver';
import { PostService } from './post.service';


@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [],
  providers: [PostService,PostResolver],
  exports:[PostService],
})
export class PostModule {
  constructor(){
    console.log("post module")
}
}