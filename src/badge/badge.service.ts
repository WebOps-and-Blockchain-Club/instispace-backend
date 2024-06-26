import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User }from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Badge } from './badge.entity';
import { CreateBadgeInput } from './type/create-badge.input';
import { CreateBadgesInput } from './type/create-badges.input';
import { ClubService } from 'src/club/club.service';
import { UpdateBadgeInput } from './type/update-badge.input';
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
    
    async update(badgeInput:UpdateBadgeInput, badgeId:string){
        var badge:Badge = await this.badgeRepository.findOne({
            where: {id:badgeId}
        });
        if(badgeInput.imageURL){
            badge.imageURL = badgeInput.imageURL;
        }
        if(badgeInput.tier){
            badge.tier = badgeInput.tier;
        }
        if(badgeInput.threshold){
            badge.threshold = badgeInput.threshold;
        }
        return await this.badgeRepository.save(badge);
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
    async getUserBadges(userId:string){
        let badgesForUser:Badge[] = [];
        let currentUser = await this.userService.getOneById(userId, ['attendedEvents', 'attendedEvents.createdBy']);
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
                let sortedBadges = superuser.club.badges.sort((a,b)=> b.threshold - a.threshold);
                for(var badge of sortedBadges){
                    if(badge.threshold <= point[1]){
                        badgesForUser.push(badge);
                        break;
                    }
                };
            }
        }
        let total = badgesForUser.length;
        return {list: badgesForUser, total};
    }
}