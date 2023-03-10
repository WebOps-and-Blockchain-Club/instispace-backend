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
import { UserService } from 'src/user/user.service';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
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

  @Query(() => Post)
  async findOnePost(@Args('Postid') postId: string) {
    return await this.postService.findOne(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post, { name: 'createPost' })
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

  @UseGuards(JwtAuthGuard)
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
    let newUser = await this.userService.getOneById(user.id, ['likedPost']);
    return await this.postService.toggleLike(post, newUser);
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
    try {
      let newPost = await this.postService.findOne(post.id);
      return newPost.likedBy;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => [User])
  async dislikedBy(@Parent() post: Post) {
    try {
      let newPost = await this.postService.findOne(post.id);
      return newPost.dislikedBy;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => [Tag])
  async tags(@Parent() post: Post) {
    try {
      let newPost = await this.postService.findOne(post.id);
      return newPost.tags;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => [User])
  async savedBy(@Parent() post: Post) {
    try {
      let newPost = await this.postService.findOne(post.id);
      return newPost.savedBy;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => Number)
  async likeCount(@Parent() post: Post) {
    try {
      let newPost = await this.postService.findOne(post.id);
      newPost.likeCount = newPost.likedBy.length;
      return newPost.likeCount;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => Number)
  async dislikeCount(@Parent() post: Post) {
    try {
      let newPost = await this.postService.findOne(post.id);
      newPost.dislikeCount = newPost.dislikedBy.length;
      return newPost.dislikeCount;
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

  @ResolveField(() => User)
  async createdBy(@Parent() post: Post) {
    try {
      let newPost = await this.postService.findOne(post.id);
      return newPost.createdBy;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isSaved(@Parent() post: Post, @CurrentUser() user: User) {
    try {
      let newPost = await this.postService.findOne(post.id);
      console.log(newPost.savedBy.filter((u) => u.id === user.id));
      if (newPost.savedBy.filter((u) => u.id === user.id)?.length)
        newPost.isSaved = true;
      else newPost.isSaved = false;
      return newPost.isSaved;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isLiked(@Parent() post: Post, @CurrentUser() user: User) {
    try {
      let newPost = await this.postService.findOne(post.id);
      if (newPost.likedBy.filter((u) => u.id === user.id).length)
        newPost.isLiked = true;
      else newPost.isLiked = false;
      return newPost.isLiked;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isDisliked(@Parent() post: Post, @CurrentUser() user: User) {
    try {
      let newPost = await this.postService.findOne(post.id);
      if (newPost.dislikedBy.filter((u) => u.id === user.id).length)
        newPost.isDisliked = true;
      else newPost.isDisliked = false;
      return newPost.isDisliked;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Boolean)
  async isReported(@Parent() post: Post, @CurrentUser() user: User) {
    try {
      let newPost = await this.postService.findOne(post.id);
      if (newPost.postReports.filter((r) => r.createdBy.id === user.id).length)
        newPost.isReported = true;
      else newPost.isReported = false;

      return newPost.isReported;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => Number)
  async reportCount(@Parent() post: Post) {
    try {
      let newPost = await this.postService.findOne(post.id);
      newPost.reportCount = newPost.postReports.length;
      return newPost.reportCount;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  // Permissions: edit, report, comment, save
  // Actions: like/upvotes & downvotes, share, setRemider
  @UseGuards(JwtAuthGuard)
  @ResolveField(() => [String])
  async permissions(@Parent() post: Post, @CurrentUser() user: User) {
    try {
      let permissions = ['Comment', 'Save'];
      let newPost = await this.postService.findOne(post?.id);
      if (user?.id === newPost?.createdBy?.id) permissions.push('Edit');
      else permissions.push('Report');
      // view reported, approve post
      return permissions;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => [String])
  async actions(@Parent() post: Post) {
    try {
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
        [PostCategory.RandomThought, PostCategory.Review].includes(
          post.category as PostCategory,
        )
      )
        actions.push('Like');
      if (post.category === PostCategory.Query) actions.push('Upvote_Downvote');
      return actions;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}
