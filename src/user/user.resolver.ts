import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Comments } from 'src/Post/comments/comment.entity';
import { Post } from 'src/Post/post.entity';
import { CurrentUser } from '../auth/current_user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import Tag from '../tag/tag.entity';
import { PermissionInput } from './permission/type/permission.input';
import { CreateUserInput, LoginInput } from './type/user.input';
import { LoginOutput } from './type/user.object';
import { UpdateUserInput } from './type/user.update';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => LoginOutput)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return this.userService.login(loginInput);
  }

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User) {
    console.log(user);
    return user;
  }

  @Query(() => [User])
  async getUsers() {
    return await this.userService.getAll();
  }

  @Mutation(() => User)
  async createUser(
    @CurrentUser() currUser: User,
    @Args('user') user: CreateUserInput,
    @Args('permission') permissionInput: PermissionInput,
  ) {
    return await this.userService.create(
      currUser,
      user.roll,
      permissionInput,
      user.role,
      user.name,
      user.pass,
    );
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Args('userInput') userInput: UpdateUserInput,
    @CurrentUser() user: User,
  ) {
    return await this.userService.updateUser(user, userInput);
  }

  @ResolveField(() => [Tag], { nullable: true })
  async interests(@Parent() { id, interests }: User) {
    try {
      if (interests) return interests;
      const user = await this.userService.getOneById(id, ['interests']);
      return user?.interests;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @ResolveField(() => [Post], { nullable: true })
  async likedPost(@Parent() user: User) {
    let newUser = await this.userService.getOneById(user.id, ['likedPost']);
    return newUser.likedPost;
  }

  @ResolveField(() => [Post], { nullable: true })
  async dislikedPost(@Parent() user: User) {
    let newUser = await this.userService.getOneById(user.id, ['likedPost']);
    return newUser.dislikedPost;
  }

  @ResolveField(() => [Comments], { nullable: true })
  async likedComment(@Parent() user: User) {
    let newUser = await this.userService.getOneById(user.id, ['likedComment']);
    return newUser.likedComment;
  }

  @ResolveField(() => [Comments], { nullable: true })
  async dislikedComment(@Parent() user: User) {
    let newUser = await this.userService.getOneById(user.id, [
      'dislikedComment',
    ]);
    return newUser.dislikedComment;
  }

  @ResolveField(() => [Post], { nullable: true })
  async savedPost(@Parent() user: User) {
    let newUser = await this.userService.getOneById(user.id, ['savedPost']);
    return newUser.savedPost;
  }

  @ResolveField(() => User)
  async createdBy(@Parent() { id, createdBy }: User) {
    if (createdBy) return createdBy;
    const user = await this.userService.getOneById(id, null);
    return await this.userService.getParent(user);
  }

  @ResolveField(() => [User])
  async accountsCreated(@Parent() { id, accountsCreated }: User) {
    if (accountsCreated) return accountsCreated;
    const user = await this.userService.getOneById(id, null);
    return await this.userService.getChildren(user);
  }
}
