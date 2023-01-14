import { Module } from '@nestjs/common';
import { ConfigModule } from './config.module';
import { GraphqlModule } from './graphql.module';
import { TypeORMModule } from './typeorm.module';

@Module({
    imports: [ConfigModule, GraphqlModule, TypeORMModule],
    exports: [ConfigModule, GraphqlModule, TypeORMModule],
})
export class CommonModule { }
