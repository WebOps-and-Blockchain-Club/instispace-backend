import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ConfigService } from './config.service';
// import { Config } from './entities/config.entity';

import { Config } from './config.entity';
import { CreateConfigInput } from './types/create-config.input';

@Resolver(() => Config)
export class ConfigResolver {
  constructor(private readonly configService: ConfigService) {}

  @Mutation(()=>Config)
  async createConfigItem(@Args('createConfigInput') createConfigItem:CreateConfigInput){
    return await this.configService.createConfigKey(createConfigItem);
  }

  @Mutation(()=>Config)
  async updateConfigItem(@Args('key') key:string , @Args('value') value:string){
    return await this.configService.updateConfigKey(key,value);
  }
 
}
