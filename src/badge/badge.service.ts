import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User }from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Badge } from './badge.entity';
import { CreateBadgeInput } from './type/create-badge.input';
import { CreateBadgesInput } from './type/create-badges.input';
import { ClubService } from 'src/club/club.service';
@Injectable()
export class BadgeService{
    constructor(
        @InjectRepository(Badge) private badgeRepository: Repository<Badge>,
        private readonly userService:UserService,
        )
        {}
    async create(badge:CreateBadgeInput, user:User){
        var newBadge = new Badge();
        
        newBadge.imageURL = badge.imageURL;
        newBadge.threshold = badge.threshold;
        newBadge.tier = badge.tier;
        var currentUser = await this.userService.getOneById(user.id, ['club'])
        console.log(currentUser.club)
        newBadge.createdBy = currentUser.club;
        return await this.badgeRepository.save(newBadge);
    }

    async findAll(){
        var badgeList:Badge[];
        badgeList = await this.badgeRepository.find();
        var total = badgeList.length;
        return{list:badgeList, total};
    }
    async findOne(id:string){
        return this.badgeRepository.findOne({
            where:{id:id}
        });
    }
    async createBadges(badges:CreateBadgesInput, user:User){
        badges.badges.forEach((badge)=> this.create(badge, user));
        return true;
    }
    async getUserBadges(user:User){
        let badgesForUser:Badge[] = [];
        let currentUser = await this.userService.getOneById(user.id, ['attendedEvents']);
        if (currentUser.attendedEvents) {
            let pointsMapping = new Map();
            currentUser.attendedEvents.forEach((e)=>{
                if(pointsMapping.has(e.createdBy)){
                    pointsMapping.set(e.createdBy, pointsMapping.get(e.createdBy)+e.pointsValue);
                }
                else{
                    pointsMapping.set(e.createdBy, e.pointsValue);
                }
            });
            for(let point of pointsMapping.entries()){
                let superuser  = await this.userService.getOneById(point[0].id, ['club', 'club.badges']);
                superuser.club.badges.forEach((badge)=>{
                    if(badge.threshold <= point[1]){
                        badgesForUser.push(badge);
                    }
                });
            }
        }
        let total = badgesForUser.length;
        return {list: badgesForUser, total};
    }
}