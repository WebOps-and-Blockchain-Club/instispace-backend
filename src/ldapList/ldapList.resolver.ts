import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { LdapListService } from './ldapList.service';
import { LdapList } from './ldapList.entity';
import { CreateLdapListInput } from './types/create-ldap-list.input';
import { UpdateLdapListInput } from './types/update-ldap-list.input';
import getLdapUserOutput from './types/ldap-output';

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
    @Args('search') search: string,
    @Args('lastUserId') lastUserId: string,
  ) {
    return this.ldapListService.getUsers(lastUserId, take, search);
  }

  @Mutation(() => String)
  populateUser(
    @Args('csvUrl') csvUrl: string,
    @Args('program') program: string,
  ) {
    return this.ldapListService.populateUser(csvUrl, program);
  }

  @Query(() => LdapList, { name: 'ldapList' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.ldapListService.findOne(id);
  }

  @Mutation(() => LdapList)
  removeLdapList(@Args('id', { type: () => Int }) id: number) {
    return this.ldapListService.remove(id);
  }
}
