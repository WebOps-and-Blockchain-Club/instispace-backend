import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  Args,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current_user';
import {Badge} from './badge.entity';
import {BadgeService} from './badge.service';
import { getBadgeOutput } from './type/find-badge-output';
import { CreateBadgeInput } from './type/create-badge.input';
import { User } from 'src/user/user.entity';
import { CreateBadgesInput } from './type/create-badges.input';
import { UpdateBadgeInput } from './type/update-badge.input';

@Resolver(()=>Badge)
export class BadgeResolver{
    constructor(private readonly badgeService:BadgeService){}

    @Query(()=> getBadgeOutput)
    findAllBadges(){
        return this.badgeService.findAll();
    }
    
    @Query(()=>Badge, {name:'badge'})
    findOne(@Args('id', {type:()=> String}) id:string) {
        return this.badgeService.findOne(id);
    }

    @Mutation(()=>Badge)
    updateBadge(@Args('badgeId', {type:()=> String}) badgeId:string, @Args('updateBadgeInput', {type: ()=>UpdateBadgeInput}) updateBadgeInput:UpdateBadgeInput){
        return this.badgeService.update(updateBadgeInput, badgeId);
    }
    @UseGuards(JwtAuthGuard)
    @Query(()=>getBadgeOutput)
    getMyBadges(@Args('userId', {type:()=> String}) userId:string, ){
        return this.badgeService.getUserBadges(userId);
    }
    @UseGuards(JwtAuthGuard)
    @Mutation(()=> Badge)
    createBadges(@Args('createBadgesInput', {type: ()=> CreateBadgesInput}) createBadgesInput: CreateBadgesInput,
    @CurrentUser() user:User)
    {
    return this.badgeService.createBadges(createBadgesInput, user);
    }
    @UseGuards(JwtAuthGuard)
    @Mutation(()=> Badge)
    createBadge(
    @Args('createBadgeInput', {type: ()=> CreateBadgeInput}) createBadgeInput: CreateBadgeInput,
    @CurrentUser() user:User)
    {
    return this.badgeService.create(createBadgeInput, user);
    }

}