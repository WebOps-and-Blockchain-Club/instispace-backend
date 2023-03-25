import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User }from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Badge } from './badge.entity';
import { CreateBadgeInput } from './type/create-badge.input';
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
        //console.log(user.club)
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
}