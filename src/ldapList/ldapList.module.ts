import { Module } from '@nestjs/common';
import { LdapListService } from './ldapList.service';
import { LdapListResolver } from './ldapList.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LdapList } from './ldapList.entity';

@Module({
  providers: [LdapListResolver, LdapListService],
  imports: [TypeOrmModule.forFeature([LdapList])],
})
export class LdapListModule {}
