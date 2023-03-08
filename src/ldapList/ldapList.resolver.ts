import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { LdapListService } from './ldapList.service';
import { LdapList } from './ldapList.entity';
import { CreateLdapListInput } from './types/create-ldap-list.input';
import { UpdateLdapListInput } from './types/update-ldap-list.input';
import getLdapUserOutput from './types/ldap-output';
import { LdapFilteringConditions } from './types/ldap-filteringConditions';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current_user';
import { User } from 'src/user/user.entity';
import { UserRole } from 'src/user/type/role.enum';

@Resolver(() => LdapList)
export class LdapListResolver {
  constructor(private readonly ldapListService: LdapListService) {}

  @Mutation(() => LdapList)
  createLdapList(
    @Args('createLdapListInput') createLdapListInput: CreateLdapListInput,
  ) {
    return this.ldapListService.create(createLdapListInput);
  }

  @Query(() => getLdapUserOutput)
  getLdapStudents(
    @Args('take') take: number,
    @Args('filteringconditions') filteringConditions: LdapFilteringConditions,
    @Args('lastUserId') lastUserId: string,
  ) {
    return this.ldapListService.getUsers(lastUserId, take, filteringConditions);
  }

  @Mutation(() => String)
  populateUser(
    @Args('csvUrl') csvUrl: string,
    @Args('program') program: string,
  ) {
    return this.ldapListService.populateUser(csvUrl, program);
  }

  @ResolveField(() => String)
  async photo(@Parent() ldaplist: LdapList) {
    return `https://instispace.iitm.ac.in/photos/byroll.php?roll=${ldaplist.roll.toUpperCase()}`;
  }
}
