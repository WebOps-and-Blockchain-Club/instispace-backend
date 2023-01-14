import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

import { Post } from './post.entity';
import { PostService } from './post.service';
import { CreatePostInput } from './type/create-post.input';
import { FilteringConditions } from './type/filtering-condition';
import getPostOutput from './type/post-output';
import { UpdatePostInput } from './type/update-post';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  @Query(() => getPostOutput, { name: 'FindAllposts' })
  async findAllPost(
    @Args('lastEventId') lastEventId: string,
    @Args('take') take: number,
    @Args('filteringCondition') filteringConditions:FilteringConditions
  ) {
    return await this.postService.findAll(lastEventId, take,filteringConditions);
  }

  @Mutation(() => Post, { name: 'CreatePost' })
  async create(@Args('postInput') post: CreatePostInput) {
    return await this.postService.create(post);
  }

  @Query(() => Post, { name: 'Findpost' })
  async findOnePost(@Args('Postid') postId: string) {
    return await this.postService.findOne(postId);
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @Args('id') id: string,
  ) {
    let postToUpdate = await this.postService.findOne(id);
    return this.postService.update(updatePostInput, postToUpdate);
  }

  @Mutation(() => Post)
  removePost(@Args('id') id: string) {
    return this.postService.remove(id);
  }

  @ResolveField(() => User)
  async createdBy(@Parent() post: Post) {
    let newPost = await this.postService.getPost(post.id);
    return newPost.createdBy;
  }

  @Mutation(() => Post)
  async toggleLike(
    @Args('postId') postId: string,
    @Args('UserId') userId: string,
  ) {
    let post = await this.postService.findOne(postId);
    let user = await this.userService.getOneById(userId, ['likedPost']);
    return await this.postService.toggleLike(post, user);
  }

  @ResolveField(()=> [User])
  async likedBy(@Parent() post:Post){
   let newPost = await this.postService.findOne(post.id);
   return newPost.likedBy;
  }
}
