import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PermissionEnum } from 'src/auth/permission.enum';
import { PermissionGuard } from 'src/auth/permission.guard';
import Hostel from 'src/hostel/hostel.entity';
import { LdapListService } from 'src/ldapList/ldapList.service';
import { Comments } from 'src/post/comments/comment.entity';
import { Post } from 'src/post/post.entity';
import { CurrentUser } from '../auth/current_user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import Tag from '../tag/tag.entity';
import Permission from './permission/permission.entity';
import { PermissionInput } from './permission/type/permission.input';
import { UserRole } from './type/role.enum';
import {
  CreateUserInput,
  ForgotPasswordInput,
  LoginInput,
} from './type/user.input';
import { LoginOutput } from './type/user.object';
import { UpdateUserInput } from './type/user.update';
import { User } from './user.entity';
import { UserService } from './user.service';
import { NotifConfig } from 'src/notif-config/notif-config.entity';
import { CreateNotifConfigInput } from 'src/notif-config/type/create-notif-config.input';
import { use } from 'passport';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly ldapListService: LdapListService,
  ) { }

  @Mutation(() => LoginOutput)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Args('fcmToken') fcmToken: string,
  ) {
    return this.userService.login(loginInput, fcmToken);
  }

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User) {
    return user;
  }

  @Query(() => [User])
  async getUsers() {
    return await this.userService.getAll();
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, new PermissionGuard(PermissionEnum.CREATE_ACCOUNT))
  async createUser(
    @CurrentUser() currUser: User,
    @Args('user') user: CreateUserInput,
    @Args('permission') permissionInput: PermissionInput,
    @Args('hostelId', { nullable: true }) hostelId: string,
  ) {
    return await this.userService.create(
      currUser,
      user.roll,
      permissionInput,
      user.role,
      hostelId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Args('userInput') userInput: UpdateUserInput,
    @CurrentUser() user: User,
  ) {
    const userUpdated = await this.userService.updateUser(user, userInput);
    return !!userUpdated;
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPassInp: ForgotPasswordInput,
  ) {
    return await this.userService.forgotPassword(forgotPassInp);
  }

  @Mutation(() => NotifConfig)
  @UseGuards(JwtAuthGuard)
  async addNewToken(
    @Args('fcmToken') fcmToken: string,
    @CurrentUser() user: User,
  ) {
    let notifInput = new CreateNotifConfigInput();
    notifInput.fcmToken = fcmToken;
    return await this.userService.getNewToken(notifInput, user);
  }

  @Mutation(() => Boolean)
  async updateRole(@Args('roll') roll: string) {
    return await this.userService.updateRole(roll);
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
  async attendedEvents(@Parent() user: User) {
    let newUser = await this.userService.getOneById(user.id, [
      'attendedEvents',
    ]);
    return newUser.attendedEvents;
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
    const parents = await this.userService.getParents(user);
    if (parents.length <= 1) return null;
    else return parents[parents.length - 2];
  }

  @ResolveField(() => [NotifConfig])
  async notifConfig(@Parent() user: User) {
    const newUser = await this.userService.getOneById(user.id, ['notifConfig']);
    return newUser.notifConfig;
  }

  @ResolveField(() => [User])
  async accountsCreated(@Parent() { id, accountsCreated }: User) {
    if (accountsCreated) return accountsCreated;
    const user = await this.userService.getOneById(id, null);
    return await this.userService.getChildren(user);
  }

  @ResolveField(() => Permission)
  async permission(@Parent() { id, permission }: User) {
    if (permission) return permission;
    const user = await this.userService.getOneById(id, ['permission']);
    // console.log(user.permission);
    return user.permission;
  }

  @ResolveField(() => String)
  async department(@Parent() user: User) {
    try {
      let newUser = await this.userService.getOneByRoll(user.roll);
      newUser.department = this.ldapListService.getDepartment(
        newUser.roll.slice(0, 2),
      );
      return newUser.department;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => String)
  async programme(@Parent() user: User) {
    try {
      user.programme = this.userService.getprogramme(user.roll);
      return user.programme;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => String)
  async photo(@Parent() user: User) {
    try {
      if (user.photo) {
        return user.photo;
      } else {
        return user.role === UserRole.USER || user.role === UserRole.MODERATOR
          ? `https://instispace.iitm.ac.in/photos/byroll.php?roll=${user.roll.toUpperCase()}`
          : '';
      }
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @Mutation(() => Hostel)
  @UseGuards(JwtAuthGuard)
  async setHostel(@Args('hostelname') name: string, @CurrentUser() user: User) {
    let hostel = this.userService.hostel(name, user);
    return hostel;
  }

  @Query(() => User, { nullable: true })
  async getUser(
    @Args('userId', { nullable: true }) userId: string,
    @Args('roll', { nullable: true }) roll: string,
  ) {
    if (userId)
      return await this.userService.getOneById(userId, ['hostel', 'interests']);
    if (roll) return await this.userService.getOneByRoll(roll);
  }

  @ResolveField(() => Boolean)
  async isFreshie(@Parent() user: User) {
    if (user.roll.substring(2, 5).toLowerCase() === '21b') {
      return true;
    } else return false;
  }

  @Query(() => [User], { nullable: true })
  async getSuperUser() {
    return await this.userService.getLeads()
  }
}
