import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comments } from './comment.entity';
import { CreateCommentInput } from './type/create-comment.input';
import { UpdateCommentInput } from './type/update-comment.input';
import { Post } from 'src/Post/post.entity';


@Resolver(() => Comments)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation(() => Comments)
  createComment(@Args('createCommentInput') createCommentInput: CreateCommentInput) {
    return this.commentsService.create(createCommentInput);
  }

  @Query(() => [Comments], { name: 'getAllComments' })
  findAll() {
    return this.commentsService.findAll();
  }

  @Query(() => Comments, { name: 'getComments' })
  findOne(@Args('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Mutation(() => Comments)
 async updateComment(@Args('updateCommentInput')updateCommentInput: UpdateCommentInput,@Args('id') id:string) {
    let commentToUpdate=await this.commentsService.findOne(id)
    return await this.commentsService.update(updateCommentInput,commentToUpdate);
  }

  @Mutation(() => Comments)
  removeComment(@Args('id') id: string) {
    return this.commentsService.remove(id);
  }

  @ResolveField(()=> Post)
 async post(@Parent() comment:Comments){
     let  newComment =await this.commentsService.getComment(comment.id);
     return newComment.post;

  }
}
