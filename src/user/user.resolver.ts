import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './type/user.input';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @Query(() => [User])
  async getUsers() {
    return await this.userService.getAll();
  }

  @Mutation(() => User)
  async createUser(@Args('user') user: CreateUserInput) {
    console.log(user)
    return await this.userService.create(user.roll, user.name);
  }
}
