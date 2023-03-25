import { forwardRef, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './club.entity';
import { Badge } from 'src/badge/badge.entity';
import { CreateClubInput } from './type/create-club-input';
import{User} from 'src/user/user.entity';
import { BadgeService } from 'src/badge/badge.service';
import { Inject } from '@nestjs/common/decorators';
import { UserService } from 'src/user/user.service';
@Injectable()
export class ClubService{
    constructor(
        @InjectRepository(Club) private clubRepository: Repository<Club>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @Inject(forwardRef(()=>BadgeService))
        private readonly badgeService:BadgeService,
        private readonly userService:UserService,
        ){}

        async create(club: CreateClubInput, user:User){
            var newClub = new Club();
            newClub.clubName = club.clubName;
            await this.clubRepository.save(club);
            var currentUser= await this.userService.getOneById(user.id, ['club'])
            currentUser.club = newClub;
            console.log(currentUser);
            await this.userRepository.save(currentUser);
            console.log(currentUser.club);
            return await this.clubRepository.save(newClub);

        }
        async findAll(){
            var clubList : Club[];
            clubList = await this.clubRepository.find();
            var total = clubList.length;
            return {list: clubList, total};
        }
        async findOneById(clubId:string){
            return this.clubRepository.findOne({
                where: {clubId:clubId}
            })
        }
        async getMyClub(user:User){
            var currentUser = this.userService.getOneById(user.id, ['club','club.badges'])
            var club = (await currentUser).club;
            return club;
        }

        async deleteAll(){
           return await this.clubRepository.clear();
        }
       
}