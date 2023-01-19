import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current_user';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.entity';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { CreatePostInput } from './type/create-post.input';
import { FilteringConditions } from './type/filtering-condition';
import getPostOutput from './type/post-output';
import { OrderInput } from './type/sorting-conditions';
import { UpdatePostInput } from './type/update-post';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => getPostOutput, { name: 'FindAllposts' })
  async findPost(
    @Args('lastEventId') lastEventId: string,
    @Args('take') take: number,
    @Args('filteringCondition') filteringConditions: FilteringConditions,
    @Args('orderInput') orderInput: OrderInput,
  ) {
    return await this.postService.findAll(
      lastEventId,
      take,
      filteringConditions,
      orderInput,
    );
  }

  @Query(() => Post, { name: 'Findpost' })
  async findOnePost(@Args('Postid') postId: string) {
    return await this.postService.findOne(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post, { name: 'CreatePost' })
  async create(
    @Args('postInput') post: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    console.log(user);
    return await this.postService.create(post, user);
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @Args('id') id: string,
  ) {
    let postToUpdate = await this.postService.findOne(id);
    return await this.postService.update(updatePostInput, postToUpdate);
  }

  @Mutation(() => Post)
  async removePost(@Args('id') id: string) {
    let post = await this.postService.getPost(id);
    return await this.postService.remove(post);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async toggleLike(@Args('postId') postId: string, @CurrentUser() user: User) {
    let post = await this.postService.findOne(postId);
    console.log(user);
    return await this.postService.toggleLike(post, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async toggleSave(@Args('postId') postId: string, @CurrentUser() user: User) {
    let post = await this.postService.findOne(postId);
    console.log(user);
    return await this.postService.toggleSave(post, user);
  }

  @ResolveField(() => [User])
  async likedBy(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    return newPost.likedBy;
  }

  @ResolveField(() => [Post])
  async tags(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    return newPost.tags;
  }
  @ResolveField(() => [User])
  async savedBy(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    return newPost.savedBy;
  }

  @ResolveField(() => Number)
  async likeCount(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    newPost.likeCount = newPost.likedBy.length;
    return newPost.likeCount;
  }

  @ResolveField(() => User)
  async createdBy(@Parent() post: Post) {
    let newPost = await this.postService.getPost(post.id);
    return newPost.createdBy;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isSaved(@Parent() post: Post, @CurrentUser() user: User) {
    let newPost = await this.postService.getPost(post.id);
    console.log(newPost.savedBy.filter((u) => u.id === user.id));
    if (newPost.savedBy.filter((u) => u.id === user.id)?.length)
      newPost.isSaved = true;
    else newPost.isSaved = false;
    return newPost.isSaved;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isLiked(@Parent() post: Post, @CurrentUser() user: User) {
    let newPost = await this.postService.getPost(post.id);
    if (newPost.likedBy.filter((u) => u.id === user.id).length)
      newPost.isLiked = true;
    else newPost.isLiked = false;
    return newPost.isLiked;
  }
}
