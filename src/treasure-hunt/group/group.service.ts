import { Injectable } from '@nestjs/common';
import { Group } from './group.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';


@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    private readonly userServive: UserService,
  ){}
  async createGroup(){
    let newGroup=new Group();
    // newGroup.code=code;
    return await this.groupRepository.save(newGroup);
  }

  async nameGroup(name:string, groupId:string ){
    let group=await this.findGroup(groupId);
    group.name=name;
    return await this.groupRepository.save(group);

  }

  async findGroup(groupId:string){
      return await this.groupRepository.findOne({where:{id:groupId},relations:['users']});
  }

  async addUser(user:User,groupId:string){
    let newgroup= await this.findGroup(groupId);
    let list=newgroup.users;
    list = [...newgroup.users, user]
    newgroup.users=list;
    console.log(newgroup);
    return await this.groupRepository?.save(newgroup);
  }

  async findGroups(maxMembers:number){
    let group= await this.groupRepository.find({relations:['users']});
    let finalGroup=group.filter((g)=>g.users?.length<maxMembers);
    return finalGroup;
  }

  


}
