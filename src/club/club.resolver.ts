import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
    Args,
    Mutation,
    Query,
    Resolver,
  } from '@nestjs/graphql';
import { User }from 'src/user/user.entity';
import { CurrentUser } from 'src/auth/current_user';
import { Club } from './club.entity';
import { ClubService } from './club.service';
import { CreateClubInput } from './type/create-club-input';
import { getClubOutput } from './type/find-club-output';

@Resolver(()=>Club)

export class ClubResolver{

    constructor(private readonly clubService:ClubService){}

    @Query(()=> getClubOutput)
    findAllClubs(){
        return this.clubService.findAll();
    }
    @Query(()=>Club)
    findClubById(@Args('id', {type:()=>String}) id:string){
        return this.clubService.findOneById(id)
    }
    
    @UseGuards(JwtAuthGuard)
    @Mutation(()=>Club)
    createClub(@Args('createClubInput', {type:()=>CreateClubInput}) clubInput:CreateClubInput,
    @CurrentUser()user: User){
        //console.log(user);
        return this.clubService.create(clubInput, user);
    }
    @UseGuards(JwtAuthGuard)
    @Query(()=>Club)
    getMyClub(@CurrentUser()user: User){
        return this.clubService.getMyClub(user);
    }
    @Mutation(()=>Boolean)
    deleteAllClubs(){
        return this.clubService.deleteAll();
    }
}