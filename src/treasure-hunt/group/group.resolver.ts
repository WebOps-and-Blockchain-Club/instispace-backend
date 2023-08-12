import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current_user';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';



@Resolver(() => Group)
export class GroupResolver {
  constructor(
    private readonly userServive: UserService,
    private readonly groupService: GroupService
    ) {}
  
  @UseGuards(JwtAuthGuard)
  @Mutation(()=>User)
  async addUserToGroup(@CurrentUser()user: User,@Args('maxMembers') maxMembers : number,@Args("numberOfGroup") numberOfGroup : number){
    let newUser= await this.userServive.getOneById(user.id,['group']);
    if(newUser.group) throw new Error("user is already in a group");
    let groupList = await this.groupService.findGroups(maxMembers);
    if(groupList===null || groupList.length===0){
    //create 5 more groups
    for(let i=0;i<numberOfGroup;i++){
      await this.groupService.createGroup();
    }
    groupList=await this.groupService.findGroups(maxMembers);
  } 
    
      let group=groupList[Math.floor(Math.random() * groupList.length)];
      // console.log(group);
     return await this.userServive.addGroup(user,group);
    
  }

  @Query(()=>Group)
  async GetOneGroupByid(@Args('id') id:string){
    await this.groupService.findGroup(id);
  }

  @Query(()=>[Group])
  async GetAllGroups(){
    return await this.groupService.FindAllGroup();
  }

  @ResolveField(() => [User])
  async users(@Parent() group:Group) {
    try {
      let newGroup= await this.groupService.findGroup(group.id);
      return newGroup.users;
    } catch (error) {
      throw new Error(error);
    }
  }
}
