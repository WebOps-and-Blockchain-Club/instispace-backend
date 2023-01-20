import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comments } from './comment.entity';
import { CreateCommentInput } from './type/create-comment.input';
import { UpdateCommentInput } from './type/update-comment.input';
import { Post } from 'src/Post/post.entity';
import { CurrentUser } from 'src/auth/current_user';
import { User } from 'src/user/user.entity';
import { PostService } from '../post.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Resolver(() => Comments)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    private postService: PostService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comments)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
    postId: string,
  ) {
    let post = await this.postService.getPost(postId);
    return this.commentsService.create(createCommentInput, user, post);
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
  async updateComment(
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
    @Args('id') id: string,
  ) {
    let commentToUpdate = await this.commentsService.findOne(id);
    return await this.commentsService.update(
      updateCommentInput,
      commentToUpdate,
    );
  }

  @Mutation(() => Comments)
  removeComment(@Args('id') id: string) {
    return this.commentsService.remove(id);
  }

  @ResolveField(() => Post)
  async post(@Parent() comment: Comments) {
    let newComment = await this.commentsService.getComment(comment.id, [
      'post',
    ]);
    return newComment.post;
  }

  @ResolveField(() => User)
  async createdBy(@Parent() comment: Comments) {
    let newComment = await this.commentsService.getComment(comment.id, [
      'createdBy',
    ]);
    return newComment.createdBy;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isReported(@Parent() comment: Comments, @CurrentUser() user: User) {
    let newComment = await this.commentsService.getComment(comment.id, [
      'commentReports',
    ]);
    if (newComment.commentReports.filter((r) => r.createdBy.id === user.id))
      comment.isReported = true;
    else comment.isReported = false;

    return comment.isReported;
  }

  @ResolveField(() => Number)
  async reportCount(@Parent() comment: Comments) {
    let newComment = await this.commentsService.getComment(comment.id, [
      'commentReports',
    ]);
    newComment.reportCount = comment.commentReports.length;

    return newComment.reportCount;
  }
}
