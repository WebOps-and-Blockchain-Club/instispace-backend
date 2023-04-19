import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import Tag from 'src/tag/tag.entity';
import { CurrentUser } from 'src/auth/current_user';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.entity';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { CreatePostInput } from './type/create-post.input';
import { FilteringConditions } from './type/filtering-condition';
import findoneOutput from './type/post-output';
import { OrderInput } from './type/sorting-conditions';
import { PostStatusInput, UpdatePostInput } from './type/update-post';
import { PostCategory } from './type/post-category.enum';
import { PermissionGuard } from 'src/auth/permission.guard';
import { PermissionEnum } from 'src/auth/permission.enum';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/type/role.enum';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userServive: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => findoneOutput)
  async findPosts(
    @Args('lastEventId') lastEventId: string,
    @Args('take') take: number,
    @Args('filteringCondition') filteringConditions: FilteringConditions,
    @Args('orderInput') orderInput: OrderInput,
    @CurrentUser() user: User,
  ) {
    return await this.postService.findAll(
      lastEventId,
      take,
      filteringConditions,
      orderInput,
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Post)
  async findOnePost(@Args('Postid') postId: string) {
    return await this.postService.findOne(postId);
  }

  @UseGuards(JwtAuthGuard, new PermissionGuard(PermissionEnum.CREATE_POST))
  @Mutation(() => Post, { name: 'createPost' })
  async create(
    @Args('postInput') post: CreatePostInput,
    @CurrentUser() user: User,
  ) {
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

  @UseGuards(JwtAuthGuard, new PermissionGuard(PermissionEnum.CHANGE_STATUS))
  @Mutation(() => Post)
  async changePostsStatus(
    @Args('id') id: string,
    @Args('status') { status }: PostStatusInput,
    @CurrentUser() user: User,
  ) {
    let postToUpdate = await this.postService.findOne(id);
    return await this.postService.changeStatus(postToUpdate, user, status);
  }

  @Mutation(() => Post)
  async removePost(@Args('id') id: string) {
    let post = await this.postService.findOne(id);
    return await this.postService.remove(post);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async toggleLikePost(
    @Args('postId') postId: string,
    @CurrentUser() user: User,
  ) {
    let post = await this.postService.findOne(postId);
    return await this.postService.toggleLike(post, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async toggleDislikePost(
    @Args('postId') postId: string,
    @CurrentUser() user: User,
  ) {
    let post = await this.postService.findOne(postId);
    return await this.postService.toggleDislike(post, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async toggleSavePost(
    @Args('postId') postId: string,
    @CurrentUser() user: User,
  ) {
    let post = await this.postService.findOne(postId);
    return await this.postService.toggleSave(post, user);
  }

  @ResolveField(() => [User])
  async likedBy(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    return newPost.likedBy;
  }

  @ResolveField(() => [User])
  async dislikedBy(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    return newPost.dislikedBy;
  }

  @ResolveField(() => [Tag])
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

  @ResolveField(() => Number)
  async dislikeCount(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    newPost.dislikeCount = newPost.dislikedBy.length;
    return newPost.dislikeCount;
  }

  @ResolveField(() => User)
  async createdBy(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    return newPost.createdBy;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isSaved(@Parent() post: Post, @CurrentUser() user: User) {
    let newPost = await this.postService.findOne(post.id);
    if (newPost.savedBy.filter((u) => u.id === user.id)?.length)
      newPost.isSaved = true;
    else newPost.isSaved = false;
    return newPost.isSaved;
  }

  @ResolveField(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async isLiked(@CurrentUser() user: User, @Parent() post: Post) {
    let newPost = await this.postService.findOne(post?.id);
    if (newPost.likedBy?.filter((u) => u?.id === user?.id).length) return true;
    else return false;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isDisliked(@Parent() post: Post, @CurrentUser() user: User) {
    let newPost = await this.postService.findOne(post.id);
    if (newPost.dislikedBy.filter((u) => u.id === user.id).length)
      newPost.isDisliked = true;
    else newPost.isDisliked = false;
    return newPost.isDisliked;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isReported(@Parent() post: Post, @CurrentUser() user: User) {
    let newPost = await this.postService.findOne(post.id);
    if (newPost.postReports.filter((r) => r.createdBy.id === user.id).length)
      newPost.isReported = true;
    else newPost.isReported = false;

    return newPost.isReported;
  }

  @ResolveField(() => Number)
  async reportCount(@Parent() post: Post) {
    let newPost = await this.postService.findOne(post.id);
    newPost.reportCount = newPost.postReports.length;
    return newPost.reportCount;
  }

  // Permissions: edit, report, comment, save
  // Actions: like/upvotes & downvotes, share, setRemider
  @UseGuards(JwtAuthGuard)
  @ResolveField(() => [String])
  async permissions(@Parent() post: Post, @CurrentUser() user: User) {
    try {
      let permissions = ['Comment', 'Save'];
      let newPost = await this.postService.findOne(post?.id);
      let newUser = await this.userServive.getOneById(user?.id);
      if (user?.id === newPost?.createdBy?.id) permissions.push('Edit');
      else permissions.push('Report');
      if((newPost.category === PostCategory.Competition || newPost.category === PostCategory.Event || newPost.category === PostCategory.Recruitment)
      && user?.id === newPost?.createdBy?.id
      &&(newUser?.role === UserRole.ADMIN || newUser?.role === UserRole.LEADS || newUser?.role === UserRole.SECRETARY || newUser?.role === UserRole.MODERATOR || newUser?.role === UserRole.HOSTEL_SEC) )
     permissions.push('ShowQR');
      // view reported, approve post
      // if (
      //   newUser.permission.approvePosts &&
      //   newUser.accountsCreated.includes(newPost.createdBy) &&
      //   !newPost.createdBy.permission.createPost?.includes(newPost.category)
      // )
      //   permissions.push('APPROVE_POST');
      // if (newUser.permission.handleReports) permissions.push('MODERATE_REPORT');
      return permissions;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => String)
  async attachment(@Parent() post: Post) {
    try {
      if (
        post.photo &&
        (post.category === PostCategory.Connect ||
          post.category === PostCategory.Opportunity ||
          post.category === PostCategory.Query ||
          post.category === PostCategory.Help ||
          post.category === PostCategory.Review ||
          post.category === PostCategory.RandomThought)
      ) {
        return post.photo;
      } else return null;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => String)
  async photo(@Parent() post: Post) {
    try {
      if (
        post.category === PostCategory.Connect ||
        post.category === PostCategory.Opportunity ||
        post.category === PostCategory.Query ||
        post.category === PostCategory.Help ||
        post.category === PostCategory.Review ||
        post.category === PostCategory.RandomThought
      )
        return null;
      else {
        if (post.photo) {
          return post.photo;
        } else {
          return null;
        }
      }
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => [String])
  async actions(@Parent() post: Post) {
    if (
      [PostCategory.Lost, PostCategory.Found].includes(
        post.category as PostCategory,
      )
    )
      return [];
    let actions: string[] = ['Share'];
    if (
      [
        PostCategory.Event,
        PostCategory.Announcement,
        PostCategory.Recruitment,
        PostCategory.Competition,
        PostCategory.Opportunity,
      ].includes(post.category as PostCategory)
    )
      actions.push('Like', 'Set_Reminder');
    if (
      [PostCategory.RandomThought, PostCategory.RandomThought].includes(
        post.category as PostCategory,
      )
    )
      actions.push('Like');
    if (post.category === PostCategory.Query) actions.push('Upvote_Downvote');
    return actions;
  }
}
