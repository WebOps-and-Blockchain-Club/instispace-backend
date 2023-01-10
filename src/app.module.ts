import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { typeOrmModuleOptions } from './data-source';
import { PostParentModule } from './Post/postParent.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      debug: false,
      playground: false,
    }),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    UserModule,
    PostParentModule,
  ],
})
export class AppModule {}
