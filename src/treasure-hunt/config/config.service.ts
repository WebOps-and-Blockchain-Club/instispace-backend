import { Injectable } from '@nestjs/common';
import { CreateConfigInput } from './types/create-config.input';

import { Config } from './config.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config) private configRepository: Repository<Config>,
  ){}

  async createConfigKey(configInput:CreateConfigInput){
    let config=new Config();
    config.key=configInput.key;
    config.value=configInput.value;
    return await this.configRepository.save(config);
  }

  async findItemBYKey(key:string){
    return await this.configRepository.findOne({where: {key:key}});
  }

  async updateConfigKey(key:string , value:string){
      let item= await this.findItemBYKey(key)
      item.value=value;
      return await this.configRepository.save(item);
  }
}
