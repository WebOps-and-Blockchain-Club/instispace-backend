import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import Tag from '../tag/tag.entity';
import { CreateUserInput } from './type/user.input';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
      const user = await this.userService.getOne(id, ['interests']);
      return user?.interests;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}
