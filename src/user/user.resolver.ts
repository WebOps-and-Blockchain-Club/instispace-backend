import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Post } from 'src/Post/post.entity';
import { CurrentUser } from '../auth/current_user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import Tag from '../tag/tag.entity';
import { CreateUserInput, LoginInput } from './type/user.input';
import { LoginOutput } from './type/user.object';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @Mutation(() => LoginOutput)
  async login(@Args("loginInput") loginInput: LoginInput) {
    return this.userService.login(loginInput);
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
  async createUser(@Args('user') user: CreateUserInput) {
    console.log(user);
    return await this.userService.create(user.roll, user.name);
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

  @ResolveField(()=>[Post],{nullable:true})
  async likedPost(@Parent()user:User){
     let newUser=await this.userService.getOneById(user.id,['likedPost']);
     return newUser.likedPost;
  }

  @ResolveField(()=>[Post],{nullable:true})
  async savedPost(@Parent()user:User){
     let newUser=await this.userService.getOneById(user.id,['savedPost']);
     return newUser.savedPost;
  }
}
