import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from 'src/Post/post.module';
import { Comments } from './comment.entity';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';


@Module({
  imports: [TypeOrmModule.forFeature([Comments]),PostModule],
  controllers: [],
  providers: [CommentsResolver,CommentsService],
  exports:[CommentsService]
})
export class CommentsModule {
    constructor(){
        console.log("Comments module")
    }
}