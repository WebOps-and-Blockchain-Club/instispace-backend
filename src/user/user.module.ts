import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModule } from 'src/tag/tag.module';
import { AuthModule } from '../auth/auth.module';
import { PermissionModule } from './permission/permission.module';
import Hostel from 'src/hostel/hostel.entity';
import { User } from './user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import UsersDev from './usersDev.entity';
import { LdapModule } from 'src/ldap/ldap.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Hostel, UsersDev]),
    AuthModule,
    PermissionModule,
    TagModule,
    LdapModule,
  ],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
