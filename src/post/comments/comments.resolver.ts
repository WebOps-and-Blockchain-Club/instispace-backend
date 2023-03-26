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
import { Post } from 'src/post/post.entity';
import { CurrentUser } from 'src/auth/current_user';
import { User } from 'src/user/user.entity';
import { PostService } from '../post.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { userInfo } from 'os';

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
    @Args('postId') postId: string,
  ) {
    let post = await this.postService.findOne(postId);
    return this.commentsService.create(createCommentInput, user, post);
  }

  @Query(() => [Comments], { name: 'getAllComments' })
  findAll() {
    return this.commentsService.findAll();
  }

  @Query(() => Comments, { name: 'getComments' })
  findOne(@Args('id') id: string) {
    return this.commentsService.findOne(id, [
      'commentReports',
      'post',
      'createBy',
      'likedBy',
      'dislikedBy',
    ]);
  }

  @Mutation(() => Comments)
  async updateComment(
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
    @Args('id') id: string,
  ) {
    let commentToUpdate = await this.commentsService.findOne(id, [
      'commentReports',
      'post',
      'createBy',
      'likedBy',
      'dislikedBy',
    ]);
    return await this.commentsService.update(
      updateCommentInput,
      commentToUpdate,
    );
  }

  @Mutation(() => Comments)
  removeComment(@Args('id') id: string) {
    return this.commentsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comments)
  async toggleLikeComment(
    @Args('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    let comment = await this.commentsService.findOne(commentId, [
      'likedBy',
      'createdBy.notifConfig',
    ]);
    return await this.commentsService.toggleLike(comment, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comments)
  async toggleDislikeComment(
    @Args('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    let comment = await this.commentsService.findOne(commentId, ['dislikedBy']);
    return await this.commentsService.toggleDislike(comment, user);
  }

  @ResolveField(() => Post)
  async post(@Parent() comment: Comments) {
    let newComment = await this.commentsService.findOne(comment.id, ['post']);
    return newComment.post;
  }

  @ResolveField(() => User)
  async createdBy(@Parent() comment: Comments) {
    let newComment = await this.commentsService.findOne(comment.id, [
      'createdBy',
    ]);
    return newComment.createdBy;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isReported(@Parent() comment: Comments, @CurrentUser() user: User) {
    let newComment = await this.commentsService.findOne(comment.id, [
      'commentReports',
    ]);
    if (
      newComment.commentReports.filter((r) => r.createdBy.id === user.id).length
    )
      comment.isReported = true;
    else comment.isReported = false;

    return comment.isReported;
  }

  @ResolveField(() => Number)
  async reportCount(@Parent() comment: Comments) {
    let newComment = await this.commentsService.findOne(comment.id, [
      'commentReports',
    ]);
    newComment.reportCount = comment.commentReports.length;

    return newComment.reportCount;
  }

  @ResolveField(() => [User])
  async likedBy(@Parent() comment: Comments) {
    let newComment = await this.commentsService.findOne(comment.id, [
      'likedBy',
    ]);
    return newComment.likedBy;
  }

  @ResolveField(() => [User])
  async dislikedBy(@Parent() comment: Comments) {
    let newComment = await this.commentsService.findOne(comment.id, [
      'dislikedBy',
    ]);
    return newComment.dislikedBy;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isLiked(@Parent() comment: Comments, @CurrentUser() user: User) {
    let newComment = await this.commentsService.findOne(comment?.id, [
      'likedBy',
    ]);
    if (newComment.likedBy.filter((u) => u.id === user?.id).length)
      newComment.isLiked = true;
    else newComment.isLiked = false;
    return newComment.isLiked;
  }

  @ResolveField(() => Number)
  async likeCount(@Parent() comment: Comments) {
    let newComment = await this.commentsService.findOne(comment.id, [
      'likedBy',
    ]);
    newComment.likeCount = newComment.likedBy.length;
    return newComment.likeCount;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isDisliked(@Parent() comment: Comments, @CurrentUser() user: User) {
    let newComment = await this.commentsService.findOne(comment.id, [
      'dislikedBy',
    ]);
    if (newComment.dislikedBy.filter((u) => u.id === user.id).length)
      newComment.isDisliked = true;
    else newComment.isDisliked = false;

    return newComment.isDisliked;
  }

  @ResolveField(() => Number)
  async dislikeCount(@Parent() comment: Comments) {
    let newComment = await this.commentsService.findOne(comment.id, [
      'dislikedBy',
    ]);
    newComment.dislikeCount = newComment.dislikedBy.length;
    return newComment.dislikeCount;
  }
}
