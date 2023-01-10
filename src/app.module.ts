import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
import { typeOrmModuleOptions } from './data-source';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,
    TagModule,
  ],
})
export class AppModule { }
