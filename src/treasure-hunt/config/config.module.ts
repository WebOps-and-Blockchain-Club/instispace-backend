import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigResolver } from './config.resolver';
import { Config } from './config.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [ConfigResolver, ConfigService],
  exports:[ConfigService],
  imports:[TypeOrmModule.forFeature([Config])]
})
export class ConfigModule {}
